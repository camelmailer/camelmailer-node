import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const send = {
  from: 'billing@acme.com',
  to: 'ada@example.com',
  subject: 'Your receipt',
  text_body: 'Thanks.',
};

describe('idempotent sending', () => {
  it('sends the key as a header, not in the body', async () => {
    const { requests } = stubFetch({ body: envelope({ message_id: 1 }) });
    await testClient().emails.send(send, { idempotencyKey: 'order-4711' });
    expect(requests[0]?.headers.get('Idempotency-Key')).toBe('order-4711');
    // The body has to stay the payload the server hashes for the claim; a
    // key leaking into it would change that hash.
    expect(requests[0]?.body).not.toHaveProperty('idempotencyKey');
    expect(requests[0]?.body).not.toHaveProperty('Idempotency-Key');
  });

  it('sends no such header when no key is given', async () => {
    const { requests } = stubFetch({ body: envelope({ message_id: 1 }) });
    await testClient().emails.send(send);
    expect(requests[0]?.headers.has('Idempotency-Key')).toBe(false);
  });

  it('works for a batch too', async () => {
    const { requests } = stubFetch({ body: envelope({ messages: [] }) });
    await testClient().emails.sendBatch([send], { idempotencyKey: 'nightly-2026-09-14' });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/batch');
    expect(requests[0]?.headers.get('Idempotency-Key')).toBe('nightly-2026-09-14');
  });

  it('works for a template send, which the server also claims', async () => {
    const { requests } = stubFetch({ body: envelope({ message_id: 1 }) });
    await testClient().emails.sendWithTemplate(
      { ...send, template: 'welcome', template_model: { name: 'Ada' } },
      { idempotencyKey: 'welcome-ada' },
    );
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/with_template');
    expect(requests[0]?.headers.get('Idempotency-Key')).toBe('welcome-ada');
  });

  it('works for a template batch', async () => {
    const { requests } = stubFetch({ body: envelope({ messages: [] }) });
    await testClient().emails.sendWithTemplateBatch([{ ...send, template: 'welcome' }], {
      idempotencyKey: 'welcome-nightly',
    });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/with_template/batch');
    expect(requests[0]?.headers.get('Idempotency-Key')).toBe('welcome-nightly');
  });

  it('still carries the API key and content type alongside it', async () => {
    const { requests } = stubFetch({ body: envelope({ message_id: 1 }) });
    await testClient().emails.send(send, { idempotencyKey: 'k' });
    expect(requests[0]?.headers.get('X-Server-API-Key')).toBe('cm_test_key');
    expect(requests[0]?.headers.get('Content-Type')).toBe('application/json');
  });

  it('surfaces a reused key with different content as its own code', async () => {
    stubFetch({
      status: 409,
      body: errorEnvelope('InvalidIdempotentRequest', 'The key was used for a different request'),
    });
    const { data, error } = await testClient().emails.send(send, { idempotencyKey: 'order-4711' });
    expect(data).toBeNull();
    expect(error?.code).toBe('InvalidIdempotentRequest');
    expect(error?.statusCode).toBe(409);
  });
});

describe('send limits', () => {
  it('surfaces SendLimitExceeded with its 429', async () => {
    stubFetch({
      status: 429,
      body: errorEnvelope('SendLimitExceeded', 'The server has reached its 30-day send limit'),
    });
    const { data, error } = await testClient().emails.send(send);
    expect(data).toBeNull();
    expect(error?.code).toBe('SendLimitExceeded');
    expect(error?.statusCode).toBe(429);
  });
});

describe('emails.sendToStream', () => {
  it('POSTs to the stream and reports queued against skipped', async () => {
    const { requests } = stubFetch({ body: envelope({ queued: 1000, skipped: 240 }) });
    const { data } = await testClient().emails.sendToStream('product-news', {
      from: 'news@acme.com',
      subject: 'Hello',
      text_body: 'Hi',
    });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/product-news/send');
    expect(data).toEqual({ queued: 1000, skipped: 240 });
  });
});
