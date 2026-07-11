import type { CamelMailerError } from './error';

/**
 * Every SDK call resolves to this shape — exactly one of `data` / `error`
 * is set, so a single null-check narrows the type:
 *
 * ```ts
 * const { data, error } = await camelmailer.emails.send(...);
 * if (error) return console.error(error.code, error.message);
 * console.log(data.message_id);
 * ```
 */
export type CamelMailerResult<T> =
  | { data: T; error: null }
  | { data: null; error: CamelMailerError };

/** An email address: either a bare string or an object with a display name. */
export type EmailAddress = string | { email: string; name?: string };

/** Standard pagination block returned by list endpoints. */
export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/** Common pagination parameters (`per_page` is capped at 100 server-side). */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

/** Response of {@link CamelMailer.ping}. */
export interface PingResponse {
  pong: boolean;
  server_id: number;
  /** Permalink of the server the API key is scoped to. */
  server: string;
}
