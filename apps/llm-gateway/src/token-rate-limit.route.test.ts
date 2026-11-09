import { describe, expect, test } from 'bun:test';

// `config` reads required env at module-load time, so set it before importing
// `./server` (same pattern as server.test.ts). The limit itself is passed to
// `buildServer`, so this test does not depend on module-load order.
process.env.KORTIX_API_URL = process.env.KORTIX_API_URL ?? 'https://api.test.invalid';
process.env.GATEWAY_INTERNAL_TOKEN = process.env.GATEWAY_INTERNAL_TOKEN ?? 'test-internal-token';

const { buildServer } = await import('./server');

// A rotating fake credential reaches the gateway's model route without a real
// API behind it: the limit gate answers before the pipeline authenticates, so
// only the limiter's decision shows here. The API URL is unreachable, so an
// admitted request ends 503 (upstream unavailable) rather than 429.
const fake = (n: number) =>
  new Request('https://gateway.test/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer kortix_fake_${n}` },
    body: JSON.stringify({ model: 'x', messages: [] }),
  });

describe('per-credential limit on the gateway route (KRTX-4528)', () => {
  test('a flood of distinct never-validated credentials is refused once the shared allowance is spent', async () => {
    // 2/min is the setting the defect is about: a rotating fake bearer may
    // ride twice and must then be refused.
    const { app } = buildServer({ requestsPerMinutePerCredential: 2 });
    const statuses: number[] = [];
    for (let n = 1; n <= 5; n++) statuses.push((await app.request(fake(n))).status);
    // The first two fake credentials fit the shared allowance and reach the
    // unreachable API (503), so the limiter admits them; the rest are refused.
    // On origin/dev every one reaches the API (503) under its own bucket.
    expect(statuses).toEqual([503, 503, 429, 429, 429]);
  });
});
