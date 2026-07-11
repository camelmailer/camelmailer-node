/** Message counters of the server. */
export interface Stats {
  total: number;
  incoming: number;
  outgoing: number;
  sent: number;
  pending: number;
  held: number;
  bounced: number;
  soft_fail: number;
  hard_fail: number;
  opens: number;
  clicks: number;
  unique_opens: number;
  unique_clicks: number;
}

/** Options for {@link StatsResource.get} — an optional `created_at` window (ISO 8601). */
export interface GetStatsOptions {
  from?: string;
  to?: string;
}

export interface GetStatsResponse {
  stats: Stats;
}

/** Current outbound queue depth, total and per destination domain. */
export interface DeliveryStatsResponse {
  queued: number;
  domains: Array<{ domain: string; queued: number }>;
}
