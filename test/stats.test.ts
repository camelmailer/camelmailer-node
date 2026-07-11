import { describe, expect, it } from 'vitest';
import { envelope, stubFetch, testClient } from './helpers';

const stats = {
  total: 10,
  incoming: 2,
  outgoing: 8,
  sent: 7,
  pending: 1,
  held: 0,
  bounced: 0,
  soft_fail: 0,
  hard_fail: 0,
  opens: 3,
  clicks: 1,
  unique_opens: 2,
  unique_clicks: 1,
};

describe('stats.get', () => {
  it('GETs /api/v2/server/stats', async () => {
    const { requests } = stubFetch({ body: envelope({ stats }) });
    const { data } = await testClient().stats.get();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/stats');
    expect(requests[0]?.url.search).toBe('');
    expect(data?.stats).toEqual(stats);
  });

  it('serializes the from/to time window', async () => {
    const { requests } = stubFetch({ body: envelope({ stats }) });
    await testClient().stats.get({ from: '2026-01-01T00:00:00Z', to: '2026-02-01T00:00:00Z' });
    const params = requests[0]?.url.searchParams;
    expect(params?.get('from')).toBe('2026-01-01T00:00:00Z');
    expect(params?.get('to')).toBe('2026-02-01T00:00:00Z');
  });
});

describe('stats.deliveries', () => {
  it('GETs the outbound queue depth', async () => {
    const payload = { queued: 3, domains: [{ domain: 'example.com', queued: 2 }] };
    const { requests } = stubFetch({ body: envelope(payload) });
    const { data } = await testClient().stats.deliveries();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/stats/deliveries');
    expect(data).toEqual(payload);
  });
});
