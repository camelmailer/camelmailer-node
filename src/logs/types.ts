import type { Pagination, PaginationParams } from '../types';

/** One logged API request. */
export interface ApiRequest {
  id: number;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  user_agent: string | null;
  created_at: string;
}

/** Filters for {@link Logs.list}. */
export interface ListLogsOptions extends PaginationParams {
  /** Status-code class: `2xx`, `3xx`, `4xx` or `5xx`. */
  status?: '2xx' | '3xx' | '4xx' | '5xx' | (string & {});
  /** Exact HTTP method. */
  method?: string;
  /** RFC 3339 lower bound. */
  from?: string;
  /** RFC 3339 upper bound. */
  to?: string;
}

export interface ListLogsResponse {
  requests: ApiRequest[];
  pagination: Pagination;
}

/** A tag seen on the server's recent messages, with how often. */
export interface TagCount {
  tag: string;
  count: number;
}

export interface ListTagsResponse {
  tags: TagCount[];
}
