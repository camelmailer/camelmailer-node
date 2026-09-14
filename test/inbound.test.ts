import { describe, expect, it } from 'vitest';
import { envelope, stubFetch, testClient } from './helpers';

const message = { id: 55, subject: 'Re: invoice', status: 'Processed' };

describe('inbound', () => {
  it('lists with filters as query parameters', async () => {
    const { requests } = stubFetch({
      body: envelope({ inbound: [message], pagination: { page: 1, per_page: 30, total: 1 } }),
    });
    const { data } = await testClient().inbound.list({ stream: 'support', status: 'Held', per_page: 30 });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/inbound');
    expect(requests[0]?.url.searchParams.get('stream')).toBe('support');
    expect(requests[0]?.url.searchParams.get('status')).toBe('Held');
    expect(requests[0]?.url.searchParams.get('per_page')).toBe('30');
    expect(data?.inbound).toHaveLength(1);
  });

  it('omits filters that were not given', async () => {
    const { requests } = stubFetch({ body: envelope({ inbound: [], pagination: {} }) });
    await testClient().inbound.list();
    expect([...requests[0]!.url.searchParams.keys()]).toEqual([]);
  });

  it('gets one message', async () => {
    const { requests } = stubFetch({ body: envelope({ message }) });
    const { data } = await testClient().inbound.get(55);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/inbound/55');
    expect(data?.message.id).toBe(55);
  });

  it('retries and bypasses', async () => {
    const { requests } = stubFetch({ body: envelope({ message, requeued: true }) });
    const client = testClient();
    const { data: retried } = await client.inbound.retry(55);
    await client.inbound.bypass(55);
    expect(requests.map((r) => r.url.pathname)).toEqual([
      '/api/v2/server/inbound/55/retry',
      '/api/v2/server/inbound/55/bypass',
    ]);
    expect(retried?.requeued).toBe(true);
  });
});
