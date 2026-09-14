import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const campaign = {
  id: 7,
  stream_id: 2,
  name: 'September newsletter',
  subject: 'What shipped in September',
  from: 'news@acme.com',
  html_body: '<p>Hello</p>',
  text_body: 'Hello',
  status: 'draft',
  total: 0,
  sent: 0,
  scheduled_at: null,
  created_at: '2026-09-01T10:00:00Z',
  completed_at: null,
  stream: { permalink: 'product-news', name: 'Product news' },
};

describe('campaigns.list', () => {
  it('GETs the server-wide campaign list', async () => {
    const { requests } = stubFetch({ body: envelope({ campaigns: [campaign] }) });
    const { data } = await testClient().campaigns.list();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/campaigns');
    expect(data?.campaigns[0]?.stream?.permalink).toBe('product-news');
  });
});

describe('campaigns.listForStream', () => {
  it('scopes the list to one stream and escapes the permalink', async () => {
    const { requests } = stubFetch({ body: envelope({ campaigns: [] }) });
    await testClient().campaigns.listForStream('product news');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/product%20news/campaigns');
  });
});

describe('campaigns.get', () => {
  it('returns the campaign with its statistics', async () => {
    const stats = {
      total: 120, sent: 120, delivered: 118, failed: 2,
      opened: 61, clicked: 12, unsubscribed: 1,
    };
    stubFetch({ body: envelope({ campaign, stats }) });
    const { data } = await testClient().campaigns.get(7);
    expect(data?.stats.delivered).toBe(118);
    expect(data?.campaign.id).toBe(7);
  });
});

describe('campaigns.create', () => {
  it('POSTs to the stream and starts as a draft', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope({ campaign }) });
    const { data } = await testClient().campaigns.create('product-news', {
      name: 'September newsletter',
      from: 'news@acme.com',
      subject: 'What shipped in September',
    });
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/product-news/campaigns');
    expect(data?.campaign.status).toBe('draft');
  });
});

describe('campaigns.update', () => {
  it('schedules by sending a time', async () => {
    const { requests } = stubFetch({
      body: envelope({ campaign: { ...campaign, status: 'scheduled', scheduled_at: '2026-10-01T08:00:00Z' } }),
    });
    const { data } = await testClient().campaigns.update(7, { scheduled_at: '2026-10-01T08:00:00Z' });
    expect(requests[0]?.method).toBe('PATCH');
    expect(data?.campaign.status).toBe('scheduled');
  });

  it('keeps an explicit null in the body, which is what clears a schedule', async () => {
    const { requests } = stubFetch({ body: envelope({ campaign }) });
    await testClient().campaigns.update(7, { scheduled_at: null });
    // JSON.stringify would drop an undefined here; null has to survive,
    // because null is what drops a campaign back to draft.
    expect(requests[0]?.body).toEqual({ scheduled_at: null });
  });
});

describe('campaigns.send and cancel', () => {
  it('sends now', async () => {
    const { requests } = stubFetch({ body: envelope({ campaign: { ...campaign, status: 'sending' } }) });
    const { data } = await testClient().campaigns.send(7);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/campaigns/7/send');
    expect(data?.campaign.status).toBe('sending');
  });

  it('cancels', async () => {
    const { requests } = stubFetch({ body: envelope({ campaign: { ...campaign, status: 'canceled' } }) });
    const { data } = await testClient().campaigns.cancel(7);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/campaigns/7/cancel');
    expect(data?.campaign.status).toBe('canceled');
  });

  it('surfaces the API error when a campaign cannot be sent', async () => {
    stubFetch({ status: 422, body: errorEnvelope('ValidationError', 'Campaign is already sent') });
    const { data, error } = await testClient().campaigns.send(7);
    expect(data).toBeNull();
    expect(error?.code).toBe('ValidationError');
  });
});
