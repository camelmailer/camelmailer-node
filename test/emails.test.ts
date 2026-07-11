import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const sendResult = {
  message_id: 100,
  recipients: [{ rcpt_to: 'ada@example.com', message_id: 100, token: 'tok1', status: 'queued' }],
};

describe('emails.send', () => {
  it('POSTs the payload to /api/v2/server/messages', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope(sendResult) });
    const { data, error } = await testClient().emails.send({
      from: 'billing@acme.com',
      to: ['ada@example.com'],
      subject: 'Your receipt',
      text_body: 'Thanks!',
      tag: 'receipt',
    });
    expect(error).toBeNull();
    expect(data).toEqual(sendResult);
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages');
    expect(requests[0]?.body).toEqual({
      from: 'billing@acme.com',
      to: ['ada@example.com'],
      subject: 'Your receipt',
      text_body: 'Thanks!',
      tag: 'receipt',
    });
  });

  it('normalizes single recipients into arrays', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope(sendResult) });
    await testClient().emails.send({
      from: { email: 'billing@acme.com', name: 'Acme Billing' },
      to: 'ada@example.com',
      cc: { email: 'cc@example.com' },
      bcc: 'bcc@example.com',
      reply_to: 'reply@acme.com',
      subject: 'Hi',
    });
    const body = requests[0]?.body as Record<string, unknown>;
    expect(body.from).toEqual({ email: 'billing@acme.com', name: 'Acme Billing' });
    expect(body.to).toEqual(['ada@example.com']);
    expect(body.cc).toEqual([{ email: 'cc@example.com' }]);
    expect(body.bcc).toEqual(['bcc@example.com']);
    expect(body.reply_to).toEqual(['reply@acme.com']);
  });

  it('passes attachments, headers, metadata and stream through', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope(sendResult) });
    await testClient().emails.send({
      from: 'a@acme.com',
      to: ['b@example.com'],
      subject: 'Invoice',
      html_body: '<p>Hi</p>',
      headers: { 'X-Custom': '1' },
      attachments: [{ name: 'invoice.pdf', content_type: 'application/pdf', data_base64: 'aGk=' }],
      metadata: { order_id: 7 },
      stream: 'broadcasts',
    });
    const body = requests[0]?.body as Record<string, unknown>;
    expect(body.headers).toEqual({ 'X-Custom': '1' });
    expect(body.attachments).toEqual([
      { name: 'invoice.pdf', content_type: 'application/pdf', data_base64: 'aGk=' },
    ]);
    expect(body.metadata).toEqual({ order_id: 7 });
    expect(body.stream).toBe('broadcasts');
  });

  it('surfaces a ValidationError for unverified sender domains', async () => {
    stubFetch({
      status: 422,
      body: errorEnvelope('ValidationError', 'From domain "nope.com" is not a verified sender for this server'),
    });
    const { data, error } = await testClient().emails.send({
      from: 'x@nope.com',
      to: ['a@b.c'],
      subject: 'x',
    });
    expect(data).toBeNull();
    expect(error?.code).toBe('ValidationError');
    expect(error?.statusCode).toBe(422);
  });
});

describe('emails.sendBatch', () => {
  it('POSTs a bare array and returns per-entry results', async () => {
    const batchResponse = {
      messages: [
        { status: 'success', data: sendResult },
        { status: 'error', error: { code: 'ParameterMissing', message: 'param is missing or the value is empty: from' } },
      ],
    };
    const { requests } = stubFetch({ body: envelope(batchResponse) });
    const { data, error } = await testClient().emails.sendBatch([
      { from: 'a@acme.com', to: ['b@example.com'], subject: 'one' },
      { to: ['c@example.com'], subject: 'two' } as never,
    ]);
    expect(error).toBeNull();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/batch');
    expect(Array.isArray(requests[0]?.body)).toBe(true);
    expect((requests[0]?.body as unknown[]).length).toBe(2);
    expect(data?.messages[0]?.status).toBe('success');
    expect(data?.messages[1]?.status).toBe('error');
  });
});

describe('emails.sendWithTemplate', () => {
  it('POSTs template and template_model alongside the message fields', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope(sendResult) });
    const { data } = await testClient().emails.sendWithTemplate({
      from: 'hello@acme.com',
      to: ['ada@example.com'],
      template: 'welcome',
      template_model: { name: 'Ada' },
    });
    expect(data).toEqual(sendResult);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/with_template');
    expect(requests[0]?.body).toEqual({
      from: 'hello@acme.com',
      to: ['ada@example.com'],
      template: 'welcome',
      template_model: { name: 'Ada' },
    });
  });

  it('surfaces an error when the template does not exist', async () => {
    stubFetch({ status: 422, body: errorEnvelope('ValidationError', 'Message template "nope" does not exist') });
    const { error } = await testClient().emails.sendWithTemplate({
      from: 'hello@acme.com',
      to: ['ada@example.com'],
      template: 'nope',
    });
    expect(error?.code).toBe('ValidationError');
  });
});

describe('emails.sendWithTemplateBatch', () => {
  it('POSTs a bare array to the batch endpoint', async () => {
    const { requests } = stubFetch({
      body: envelope({ messages: [{ status: 'success', data: sendResult }] }),
    });
    const { data } = await testClient().emails.sendWithTemplateBatch([
      { from: 'hello@acme.com', to: ['ada@example.com'], template: 'welcome', template_model: { name: 'Ada' } },
    ]);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/with_template/batch');
    expect(Array.isArray(requests[0]?.body)).toBe(true);
    expect(data?.messages).toHaveLength(1);
  });
});

describe('emails.get', () => {
  it('GETs one message with its deliveries', async () => {
    const message = { id: 42, token: 'tok', scope: 'outgoing', rcpt_to: 'a@b.c' };
    const { requests } = stubFetch({ body: envelope({ message, deliveries: [] }) });
    const { data } = await testClient().emails.get(42);
    expect(requests[0]?.method).toBe('GET');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/42');
    expect(data?.message.id).toBe(42);
    expect(data?.deliveries).toEqual([]);
  });

  it('returns NotFound for unknown ids', async () => {
    stubFetch({ status: 404, body: errorEnvelope('NotFound', 'Resource not found') });
    const { data, error } = await testClient().emails.get(999999);
    expect(data).toBeNull();
    expect(error?.code).toBe('NotFound');
    expect(error?.statusCode).toBe(404);
  });
});

describe('emails.list', () => {
  it('GETs /api/v2/server/messages without params by default', async () => {
    const { requests } = stubFetch({ body: envelope({ messages: [], pagination: { page: 1, per_page: 25, total: 0, total_pages: 0 } }) });
    const { data } = await testClient().emails.list();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages');
    expect(requests[0]?.url.search).toBe('');
    expect(data?.messages).toEqual([]);
    expect(data?.pagination.page).toBe(1);
  });

  it('serializes all supported filters as query params', async () => {
    const { requests } = stubFetch({ body: envelope({ messages: [], pagination: {} }) });
    await testClient().emails.list({
      page: 2,
      per_page: 50,
      scope: 'outgoing',
      status: 'Sent',
      tag: 'receipt',
      query: 'ada',
      stream: 'transactional',
    });
    const params = requests[0]?.url.searchParams;
    expect(params?.get('page')).toBe('2');
    expect(params?.get('per_page')).toBe('50');
    expect(params?.get('scope')).toBe('outgoing');
    expect(params?.get('status')).toBe('Sent');
    expect(params?.get('tag')).toBe('receipt');
    expect(params?.get('query')).toBe('ada');
    expect(params?.get('stream')).toBe('transactional');
  });
});

describe('emails events', () => {
  it('GETs delivery attempts', async () => {
    const deliveries = [{ id: 1, status: 'Sent', details: 'ok', output: '250 OK', sent_with_ssl: true, created_at: '2026-01-01T00:00:00Z' }];
    const { requests } = stubFetch({ body: envelope({ deliveries }) });
    const { data } = await testClient().emails.deliveries(42);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/42/deliveries');
    expect(data?.deliveries).toEqual(deliveries);
  });

  it('GETs open events', async () => {
    const opens = [{ ip_address: '203.0.113.9', user_agent: 'Mozilla', url: null, created_at: '2026-01-01T00:00:00Z' }];
    const { requests } = stubFetch({ body: envelope({ opens }) });
    const { data } = await testClient().emails.opens(42);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/42/opens');
    expect(data?.opens).toEqual(opens);
  });

  it('GETs click events', async () => {
    const clicks = [{ ip_address: '203.0.113.9', user_agent: 'Mozilla', url: 'https://acme.com', created_at: '2026-01-01T00:00:00Z' }];
    const { requests } = stubFetch({ body: envelope({ clicks }) });
    const { data } = await testClient().emails.clicks(42);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/42/clicks');
    expect(data?.clicks).toEqual(clicks);
  });

  it('GETs the raw base64 MIME source', async () => {
    const { requests } = stubFetch({ body: envelope({ raw_message: 'SGVsbG8=' }) });
    const { data } = await testClient().emails.raw(42);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/messages/42/raw');
    expect(data?.raw_message).toBe('SGVsbG8=');
  });

  it('surfaces NotAvailable when the server runs in privacy mode', async () => {
    stubFetch({ status: 404, body: errorEnvelope('NotAvailable', 'Raw message content is not retained in privacy mode') });
    const { error } = await testClient().emails.raw(42);
    expect(error?.code).toBe('NotAvailable');
  });
});
