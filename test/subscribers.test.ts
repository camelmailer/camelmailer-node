import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const subscriber = {
  id: 3,
  address: 'ada@example.com',
  status: 'subscribed',
  created_at: '2026-09-01T10:00:00Z',
};

describe('subscribers.list', () => {
  it('GETs the subscribers of one stream', async () => {
    const { requests } = stubFetch({ body: envelope({ subscribers: [subscriber] }) });
    const { data } = await testClient().subscribers.list('product-news');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/product-news/subscribers');
    expect(data?.subscribers[0]?.address).toBe('ada@example.com');
  });
});

describe('subscribers.add', () => {
  it('POSTs the address and defaults the status server-side', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope({ subscriber }) });
    const { data } = await testClient().subscribers.add('product-news', {
      address: 'ada@example.com',
    });
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.body).toEqual({ address: 'ada@example.com' });
    expect(data?.subscriber.status).toBe('subscribed');
  });

  it('surfaces a ValidationError for an invalid status', async () => {
    stubFetch({ status: 422, body: errorEnvelope('ValidationError', 'Subscription status "maybe" is not valid') });
    const { error } = await testClient().subscribers.add('product-news', {
      address: 'ada@example.com',
      status: 'maybe' as never,
    });
    expect(error?.code).toBe('ValidationError');
  });
});

describe('subscribers.import', () => {
  it('POSTs the addresses and reports added against total', async () => {
    const { requests } = stubFetch({ body: envelope({ added: 2, total: 3 }) });
    const { data } = await testClient().subscribers.import('product-news', [
      'ada@example.com',
      'grace@example.com',
      'ada@example.com',
    ]);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/product-news/subscribers/import');
    expect(requests[0]?.body).toEqual({
      addresses: ['ada@example.com', 'grace@example.com', 'ada@example.com'],
    });
    expect(data).toEqual({ added: 2, total: 3 });
  });
});

describe('subscribers.remove', () => {
  it('DELETEs the address, encoded', async () => {
    const { requests } = stubFetch({ body: envelope({ deleted: true }) });
    const { data } = await testClient().subscribers.remove('product-news', 'ada+news@example.com');
    expect(requests[0]?.method).toBe('DELETE');
    // The + in an address is significant and must not arrive as a space.
    expect(requests[0]?.url.pathname).toBe(
      '/api/v2/server/streams/product-news/subscribers/ada%2Bnews%40example.com',
    );
    expect(data?.deleted).toBe(true);
  });
});

describe('subscribers.complaint', () => {
  it('POSTs a complaint and gets the unsubscribed row back', async () => {
    const { requests } = stubFetch({
      body: envelope({ subscriber: { ...subscriber, status: 'unsubscribed' } }),
    });
    const { data } = await testClient().subscribers.complaint('product-news', 'ada@example.com');
    expect(requests[0]?.url.pathname).toBe(
      '/api/v2/server/streams/product-news/subscribers/ada%40example.com/complaint',
    );
    expect(data?.subscriber.status).toBe('unsubscribed');
  });
});
