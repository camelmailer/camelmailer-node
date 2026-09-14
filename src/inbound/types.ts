import type { Email } from '../emails/types';
import type { Pagination, PaginationParams } from '../types';

/** Filters for {@link Inbound.list}. */
export interface ListInboundOptions extends PaginationParams {
  status?: string;
  tag?: string;
  /** Substring match on subject and addresses. */
  query?: string;
  /** Restrict to one message stream, by permalink. */
  stream?: string;
}

export interface ListInboundResponse {
  inbound: Email[];
  pagination: Pagination;
}

export interface GetInboundResponse {
  message: Email;
}

/** Result of {@link Inbound.retry} and {@link Inbound.bypass}. */
export interface InboundRequeueResponse {
  message: Email;
  requeued: boolean;
}
