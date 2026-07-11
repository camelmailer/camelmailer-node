import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const bounce = { id: 5, token: 'tok', scope: 'incoming', rcpt_to: 'a@b.c', bounce: true };

describe('bounces.list', () => {
  it('GETs /api/v2/server/bounces with pagination', async () => {
    const pagination = { page: 1, per_page: 25, total: 1, total_pages: 1 };
    const { requests } = stubFetch({ body: envelope({ bounces: [bounce], pagination }) });
    const { data } = await testClient().bounces.list();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/bounces');
    expect(data?.bounces).toEqual([bounce]);
    expect(data?.pagination).toEqual(pagination);
  });

  it('serializes filters', async () => {
    const { requests } = stubFetch({ body: envelope({ bounces: [], pagination: {} }) });
    await testClient().bounces.list({ page: 3, per_page: 10, tag: 'receipt', query: 'ada' });
    const params = requests[0]?.url.searchParams;
    expect(params?.get('page')).toBe('3');
    expect(params?.get('per_page')).toBe('10');
    expect(params?.get('tag')).toBe('receipt');
    expect(params?.get('query')).toBe('ada');
  });
});

describe('bounces.get', () => {
  it('GETs one bounce by id', async () => {
    const { requests } = stubFetch({ body: envelope({ bounce }) });
    const { data } = await testClient().bounces.get(5);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/bounces/5');
    expect(data?.bounce.bounce).toBe(true);
  });

  it('returns NotFound for unknown ids', async () => {
    stubFetch({ status: 404, body: errorEnvelope('NotFound', 'Resource not found') });
    const { error } = await testClient().bounces.get(404404);
    expect(error?.code).toBe('NotFound');
  });
});
