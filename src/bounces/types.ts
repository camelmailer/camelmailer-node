import type { Email, ListEmailsOptions } from '../emails/types';
import type { Pagination } from '../types';

/** Filters for {@link Bounces.list} (same shape as message filters). */
export type ListBouncesOptions = Omit<ListEmailsOptions, 'stream'>;

export interface ListBouncesResponse {
  bounces: Email[];
  pagination: Pagination;
}

export interface GetBounceResponse {
  bounce: Email;
}
