import { describe, expect, mock, test } from 'bun:test';
import type { MeResponse } from '../api/types.ts';

/**
 * The MCP kortix tool runs this CLI and answers identity lookups with
 * `whoami --json` (apps/api/src/mcp/cli.ts's denial table). The tool caps a
 * command's stdout at 45 000 characters and a cut JSON loses its parsed
 * `json` field, so the payload must stay under that cap whole — even for a
 * member of hundreds of workspaces, the gate's MCP-6 flow pins
 * (tests/src/flows/mcp.flow.ts: "never as a cut string, even for a user with
 * many accounts"). The fixtures' owner holds hundreds of memberships.
 */
const MCP_STDOUT_CAP = 45_000;

const ACCOUNTS = 500;
const account_id = (i: number) => `00000000-0000-4000-a000-${String(i).padStart(12, '0')}`;

const me: MeResponse = {
  user_id: 'usr_test',
  email: 'owner@ke2e.kortix.test',
  accounts: Array.from({ length: ACCOUNTS }, (_, i) => ({
    account_id: account_id(i),
    workspace_id: null,
    slug: `ws-${i}`,
    name: `Workspace ${i}`,
    role: 'member',
  })),
};

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
  test('answers whole JSON under the MCP tool stdout cap for a member of 500 workspaces', async () => {
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
    expect(code).toBe(0);
    const stdout = writes.join('');
    // The whole-JSON contract: a pipe (and the MCP tool) parses it in one piece.
    const parsed = JSON.parse(stdout);
    expect(parsed.user_id).toBe('usr_test');
    expect(parsed.account_id).toBe(account_id(0));
    // The list keeps its shape, capped, with the true total beside it.
    expect(Array.isArray(parsed.accounts)).toBe(true);
    expect(parsed.accounts.length).toBe(50);
    expect(parsed.accounts_total).toBe(ACCOUNTS);
    // And it fits the tool's cap: a bigger payload arrives at the MCP tool cut,
    // where the parsed json field is gone entirely (the MCP-6 gate failure).
    expect(stdout.length).toBeLessThan(MCP_STDOUT_CAP);
  });
});
