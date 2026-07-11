import { describe, expect, it } from 'vitest';
import { envelope, stubFetch, testClient } from './helpers';

const report = {
  id: 9,
  domain: 'acme.com',
  org_name: 'google.com',
  org_email: 'noreply@google.com',
  report_id: 'r-123',
  date_range_begin: '2026-01-01T00:00:00Z',
  date_range_end: '2026-01-02T00:00:00Z',
  received_at: '2026-01-02T04:00:00Z',
  record_count: 2,
};

describe('dmarc.summary', () => {
  it('GETs the compliance summary', async () => {
    const summary = {
      total: 100,
      pass: 98,
      fail: 2,
      pass_rate: 0.98,
      by_source: [],
      by_disposition: { none: 100 },
    };
    const { requests } = stubFetch({ body: envelope({ summary }) });
    const { data } = await testClient().dmarc.summary();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/dmarc/summary');
    expect(data?.summary).toEqual(summary);
  });

  it('serializes domain and window filters', async () => {
    const { requests } = stubFetch({ body: envelope({ summary: {} }) });
    await testClient().dmarc.summary({ domain: 'acme.com', from: '2026-01-01T00:00:00Z' });
    const params = requests[0]?.url.searchParams;
    expect(params?.get('domain')).toBe('acme.com');
    expect(params?.get('from')).toBe('2026-01-01T00:00:00Z');
    expect(params?.has('to')).toBe(false);
  });
});

describe('dmarc.reports', () => {
  it('GETs the stored reports with pagination', async () => {
    const pagination = { page: 1, per_page: 25, total: 1, total_pages: 1 };
    const { requests } = stubFetch({ body: envelope({ reports: [report], pagination }) });
    const { data } = await testClient().dmarc.reports({ page: 1 });
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/dmarc/reports');
    expect(requests[0]?.url.searchParams.get('page')).toBe('1');
    expect(data?.reports).toEqual([report]);
    expect(data?.pagination).toEqual(pagination);
  });
});

describe('dmarc.report', () => {
  it('GETs one report with its records', async () => {
    const records = [
      {
        id: 1,
        source_ip: '203.0.113.10',
        count: 5,
        disposition: 'none',
        dkim_result: 'pass',
        spf_result: 'pass',
        dkim_aligned: true,
        spf_aligned: true,
        header_from: 'acme.com',
        envelope_from: 'acme.com',
      },
    ];
    const { requests } = stubFetch({ body: envelope({ report, records }) });
    const { data } = await testClient().dmarc.report(9);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/dmarc/reports/9');
    expect(data?.report.id).toBe(9);
    expect(data?.records).toEqual(records);
  });
});
