import { afterEach, describe, expect, setSystemTime, test } from 'bun:test';
import { createTokenRateLimit } from './token-rate-limit';

const request = (path: string, headers: Record<string, string>) =>
  new Request(`https://gateway.test${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: '{"model":"x","messages":[]}',
  });

afterEach(() => setSystemTime());

describe('per-credential request limit', () => {
  test('refuses the request over the limit with 429 and Retry-After, and the next minute admits it again', async () => {
    setSystemTime(new Date('2026-11-02T12:00:00Z'));
    const limit = createTokenRateLimit(2);
    const call = () =>
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_sb_a' }));
    expect(call()).toBeNull();
    expect(call()).toBeNull();
    const refused = call();
    expect(refused?.status).toBe(429);
    expect(refused?.headers.get('retry-after')).toBe('30');
    const body = (await refused?.json()) as { error: { code: string } };
    expect(body.error.code).toBe('rate_limited');

    setSystemTime(new Date('2026-11-02T12:00:30Z'));
    expect(call()).toBeNull();
  });

  test('counts each validated credential apart, and x-api-key is a credential', () => {
    const limit = createTokenRateLimit(1);
    for (const credential of ['kortix_sb_a', 'kortix_sb_b', 'kortix_gw_c'])
      limit.validated(credential);
    expect(
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_sb_a' })),
    ).toBeNull();
    expect(
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_sb_a' }))?.status,
    ).toBe(429);
    expect(
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_sb_b' })),
    ).toBeNull();
    expect(limit(request('/v1/messages', { 'x-api-key': 'kortix_gw_c' }))).toBeNull();
    expect(limit(request('/v1/messages', { 'x-api-key': 'kortix_gw_c' }))?.status).toBe(429);
  });

  test('does not count a request without a credential: the pipeline refuses it with 401 and no API call', () => {
    const limit = createTokenRateLimit(1);
    for (let i = 0; i < 5; i++) expect(limit(request('/v1/chat/completions', {}))).toBeNull();
  });

  test('answers Messages and Claude Code requests in the Anthropic envelope', async () => {
    const limit = createTokenRateLimit(1);
    for (const path of ['/v1/messages', '/v1/claude-code/v1/messages']) {
      const headers = { authorization: `Bearer kortix_sb_${path.length}` };
      limit(request(path, headers));
      const refused = limit(request(path, headers));
      expect(refused?.status).toBe(429);
      expect(await refused?.json()).toEqual({
        type: 'error',
        error: {
          type: 'rate_limit_error',
          message: 'Too many requests for this credential. Retry shortly.',
        },
      });
    }
  });
});

describe('credentials the gateway has not validated (KRTX-4528)', () => {
  const fake = (n: number) =>
    request('/v1/chat/completions', { authorization: `Bearer kortix_fake_${n}` });

  test('refuses a flood of never-validated credentials once the shared allowance is spent', () => {
    setSystemTime(new Date('2026-11-02T12:00:00Z'));
    const limit = createTokenRateLimit(2);
    // Two distinct unseen credentials take the two shared slots and are admitted.
    expect(limit(fake(1))).toBeNull();
    expect(limit(fake(2))).toBeNull();
    // The third distinct one is refused: it cannot buy a private bucket forever.
    const refused = limit(fake(3));
    expect(refused?.status).toBe(429);
    expect(refused?.headers.get('retry-after')).toBe('30');
    // A fourth distinct one is refused too.
    expect(limit(fake(4))?.status).toBe(429);
  });

  test("a fake credential cannot ride a validated one's spent budget", () => {
    const limit = createTokenRateLimit(1);
    limit.validated('kortix_real');
    expect(
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_real' })),
    ).toBeNull();
    expect(
      limit(request('/v1/chat/completions', { authorization: 'Bearer kortix_real' }))?.status,
    ).toBe(429);
    // The real credential's minute is spent; a fake is charged to the shared
    // allowance, which still has its own slot.
    expect(limit(fake(1))).toBeNull();
    expect(limit(fake(2))?.status).toBe(429);
  });

  test('a credential moves to its own budget once the API validates it, and returns its shared slot', () => {
    const limit = createTokenRateLimit(2);
    // An unseen credential is charged to the shared bucket, not its own.
    expect(limit(fake(1))).toBeNull();
    expect(limit.buckets()).toContain('gateway_token:distinct_credentials');
    // The API then validates it: it now has its full own budget (2/min) while
    // the shared slot its pre-validation request took is returned.
    limit.validated('kortix_fake_1');
    expect(limit(fake(1))).toBeNull();
    expect(limit(fake(1))).toBeNull();
    expect(limit(fake(1))?.status).toBe(429);
    // And the returned shared slot admits another unseen credential.
    expect(limit(fake(2))).toBeNull();
  });

  test('a flood of never-validated credentials leaves only the one shared bucket', () => {
    setSystemTime(new Date('2026-11-02T12:00:00Z'));
    // Every unvalidated credential shares one bucket, so 200 distinct fakes
    // leave exactly that bucket behind, never one entry per request.
    const limit = createTokenRateLimit(5);
    for (let i = 0; i < 200; i++) limit(fake(i));
    expect(limit.buckets()).toEqual(['gateway_token:distinct_credentials']);
  });
});
