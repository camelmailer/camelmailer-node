import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  DmarcFilterOptions,
  DmarcSummaryResponse,
  GetDmarcReportResponse,
  ListDmarcReportsOptions,
  ListDmarcReportsResponse,
} from './types';

/** DMARC monitoring (`/api/v2/server/dmarc`). */
export class Dmarc {
  constructor(private readonly client: CamelMailer) {}

  /**
   * The DMARC compliance summary over the stored aggregate reports:
   * pass rate, top sending sources and disposition totals.
   */
  summary(options: DmarcFilterOptions = {}): Promise<CamelMailerResult<DmarcSummaryResponse>> {
    return this.client.get<DmarcSummaryResponse>('/api/v2/server/dmarc/summary', options);
  }

  /** List stored DMARC aggregate reports, newest report range first. */
  reports(
    options: ListDmarcReportsOptions = {},
  ): Promise<CamelMailerResult<ListDmarcReportsResponse>> {
    return this.client.get<ListDmarcReportsResponse>('/api/v2/server/dmarc/reports', options);
  }

  /** Retrieve one DMARC report with its per-source records. */
  report(id: number): Promise<CamelMailerResult<GetDmarcReportResponse>> {
    return this.client.get<GetDmarcReportResponse>(`/api/v2/server/dmarc/reports/${id}`);
  }
}
