import { describe, expect, mock, test } from 'bun:test';
import type { MeResponse } from '../api/types.ts';

/**
 * The MCP kortix tool (apps/api/src/mcp/cli.ts `STDOUT_CAP`) runs this CLI and
 * answers identity lookups with `whoami --json` (its denial table). It captures
 * stdout in BYTES and the CLI contract (` kortix whoami --json | jq`) needs the
 * whole value: a cut JSON loses the tool's parsed `json` field — the gate's
 * MCP-6 flow pins it ("never as a cut string, even for a user with many
 * accounts"). The e2e fixtures' owner holds hundreds of memberships, and one
 * membership name can legally hold 255 characters
 * (apps/api/src/accounts/core/account-name.ts), so the payload is judged in
 * bytes, not in rows.
 */
const MCP_STDOUT_CAP = 45_000;

const ACCOUNTS = 500;
const account_id = (i: number) => `00000000-0000-4000-a000-${String(i).padStart(12, '0')}`;

/** A mutable /me fixture: the mock reads whatever the case under test set. */
let me: MeResponse;
const membership = (i: number, name: string): MeResponse['accounts'][number] => ({
  account_id: account_id(i),
  workspace_id: null,
  slug: `ws-${i}`,
  name,
  role: 'member',
});

const memberships = (name: (i: number) => string): MeResponse => ({
  user_id: 'usr_test',
  email: 'owner@ke2e.kortix.test',
  accounts: Array.from({ length: ACCOUNTS }, (_, i) => membership(i, name(i))),
});

const auth = {
  api_base: 'http://127.0.0.1:8008',
  token: 'kortix_pat_test',
  user_id: 'usr_test',
  user_email: 'owner@ke2e.kortix.test',
  account_id: account_id(0),
};

const realClient = await import('../api/client.ts');
mock.module('../api/client.ts', () => ({
  ...realClient,
  clientFromAuth: () => ({
    get: async (path: string) => {
      if (path !== '/me') throw new Error(`unexpected get ${path}`);
      return me;
    },
  }),
}));
const realAuth = await import('../api/auth.ts');
mock.module('../api/auth.ts', () => ({
  ...realAuth,
  loadAuth: () => auth,
  loadAuthForHost: () => auth,
}));
const realConfig = await import('../api/config.ts');
mock.module('../api/config.ts', () => ({
  ...realConfig,
  activeHostEntry: () => ({ name: 'sandbox' }),
  defaultProject: () => null,
  getHost: () => null,
  listHosts: async () => [],
}));

describe('whoami --json', () => {
  /** Captures the command's stdout and returns it as bytes (the MCP capture's unit). */
  async function runJsonCommand(): Promise<{ code: number; stdout: string; stdoutBytes: number }> {
    const writes: string[] = [];
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: Parameters<typeof process.stdout.write>[0]) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    let code = -1;
    try {
      const { runWhoami } = await import('../commands/whoami.ts');
      code = await runWhoami(['--json']);
    } finally {
      process.stdout.write = original;
    }
    const stdout = writes.join('');
    return { code, stdout, stdoutBytes: new TextEncoder().encode(stdout).length };
  }

  test('answers whole JSON under the MCP tool byte cap for a member of 500 workspaces', async () => {
    me = memberships((i) => `Workspace ${i}`);
    const { code, stdout, stdoutBytes } = await runJsonCommand();
    expect(code).toBe(0);
    // The whole-JSON contract: a pipe (and the MCP tool) parses it in one piece.
    const parsed = JSON.parse(stdout);
    expect(parsed.user_id).toBe('usr_test');
    expect(parsed.account_id).toBe(account_id(0));
    // The list keeps its shape, byte-bounded, with the true total beside it.
    expect(Array.isArray(parsed.accounts)).toBe(true);
    expect(parsed.accounts.length).toBeGreaterThan(0);
    expect(parsed.accounts_total).toBe(ACCOUNTS);
    // And it fits the tool's BYTE capture: a bigger payload arrives at the MCP
    // tool cut, where the parsed json field is gone entirely (the MCP-6 gate
    // failure).
    expect(stdoutBytes).toBeLessThan(MCP_STDOUT_CAP);
  });

  test('fits 255-character multibyte membership names inside the same byte cap', async () => {
    // Accounting names accept 255 characters (account-name.ts). 50 rows of
    // these pass a row-count cap and still blow the byte capture — this
    // fixture is the red-first case for a rows-only bound.
    me = memberships(() => 'U0001F98A'.repeat(255));
    me.accounts = me.accounts.map((a, i) => ({
      ...a,
      workspace_id: `10000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    }));
    const { code, stdout, stdoutBytes } = await runJsonCommand();
    expect(code).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.accounts_total).toBe(ACCOUNTS);
    expect(parsed.accounts.length).toBeGreaterThan(0);
    expect(stdoutBytes).toBeLessThan(MCP_STDOUT_CAP);
  });
});
