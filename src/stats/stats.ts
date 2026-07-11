import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type { DeliveryStatsResponse, GetStatsOptions, GetStatsResponse } from './types';

/** Read message and delivery statistics (`/api/v2/server/stats`). */
export class StatsResource {
  constructor(private readonly client: CamelMailer) {}

  /** Message counters, optionally limited to a `from`/`to` time window (ISO 8601). */
  get(options: GetStatsOptions = {}): Promise<CamelMailerResult<GetStatsResponse>> {
    return this.client.get<GetStatsResponse>('/api/v2/server/stats', options);
  }

  /** Pending outbound queue depth, total and per destination domain. */
  deliveries(): Promise<CamelMailerResult<DeliveryStatsResponse>> {
    return this.client.get<DeliveryStatsResponse>('/api/v2/server/stats/deliveries');
  }
}
