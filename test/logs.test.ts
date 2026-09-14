import { describe, expect, it } from 'vitest';
import { envelope, stubFetch, testClient } from './helpers';

describe('logs', () => {
  it('lists requests with a status class filter', async () => {
    const { requests } = stubFetch({
      body: envelope({
        requests: [
          {
            id: 1, method: 'POST', path: '/api/v2/server/messages',
            status_code: 422, duration_ms: 12, user_agent: 'camelmailer-node:0.1.0',
            created_at: '2026-09-14T07:00:00Z',
          },
        ],
        pagination: { page: 1, per_page: 30, total: 1 },
      }),
    });
    const { data } = await testClient().logs.list({ status: '4xx', method: 'POST' });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/logs');
    expect(requests[0]?.url.searchParams.get('status')).toBe('4xx');
    expect(data?.requests[0]?.status_code).toBe(422);
  });

  it('lists tags with their counts', async () => {
    const { requests } = stubFetch({
      body: envelope({ tags: [{ tag: 'receipt', count: 91 }, { tag: 'welcome', count: 4 }] }),
    });
    const { data } = await testClient().logs.tags();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/tags');
    expect(data?.tags[0]).toEqual({ tag: 'receipt', count: 91 });
  });
});
