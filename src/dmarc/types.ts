import type { Pagination, PaginationParams } from '../types';

/** Common DMARC filters: a domain plus a report date-range window (ISO 8601). */
export interface DmarcFilterOptions {
  domain?: string;
  from?: string;
  to?: string;
}

/** Options for {@link Dmarc.reports}. */
export interface ListDmarcReportsOptions extends DmarcFilterOptions, PaginationParams {}

/** Aggregated DMARC compliance over the stored reports. */
export interface DmarcSummary {
  /** Messages covered by the reports. */
  total: number;
  /** Messages with DKIM **and** SPF aligned. */
  pass: number;
  fail: number;
  /** pass / total (0.0 – 1.0). */
  pass_rate: number;
  /** Top 20 sending sources by volume. */
  by_source: Array<{
    source_ip: string;
    count: number;
    spf_aligned_pct: number;
    dkim_aligned_pct: number;
    disposition_counts: Record<string, number>;
  }>;
  by_disposition: Record<string, number>;
}

/** A stored DMARC aggregate report. */
export interface DmarcReport {
  id: number;
  domain: string;
  org_name: string | null;
  org_email: string | null;
  /** The reporter's report id. */
  report_id: string;
  date_range_begin: string;
  date_range_end: string;
  received_at: string;
  record_count: number;
}

/** One row of a DMARC aggregate report. */
export interface DmarcRecord {
  id: number;
  source_ip: string;
  count: number;
  disposition: 'none' | 'quarantine' | 'reject';
  dkim_result: string | null;
  spf_result: string | null;
  dkim_aligned: boolean;
  spf_aligned: boolean;
  header_from: string | null;
  envelope_from: string | null;
}

export interface DmarcSummaryResponse {
  summary: DmarcSummary;
}

export interface ListDmarcReportsResponse {
  reports: DmarcReport[];
  pagination: Pagination;
}

export interface GetDmarcReportResponse {
  report: DmarcReport;
  records: DmarcRecord[];
}
