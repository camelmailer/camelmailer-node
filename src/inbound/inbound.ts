import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  GetInboundResponse,
  InboundRequeueResponse,
  ListInboundOptions,
  ListInboundResponse,
} from './types';

/**
 * Inbound and held messages (`/api/v2/server/inbound`).
 *
 * Covers mail arriving through an inbound route as well as outbound mail
 * the spam filter put on hold, which is why a message here can be either
 * retried or released past the hold.
 */
export class Inbound {
  constructor(private readonly client: CamelMailer) {}

  /** Search inbound and held messages, newest first. */
  list(options: ListInboundOptions = {}): Promise<CamelMailerResult<ListInboundResponse>> {
    return this.client.get<ListInboundResponse>('/api/v2/server/inbound', options);
  }

  /** Retrieve one inbound message. */
  get(id: number): Promise<CamelMailerResult<GetInboundResponse>> {
    return this.client.get<GetInboundResponse>(`/api/v2/server/inbound/${id}`);
  }

  /** Put a message back on the delivery queue, for instance after fixing
   *  the route it should have matched. */
  retry(id: number): Promise<CamelMailerResult<InboundRequeueResponse>> {
    return this.client.post<InboundRequeueResponse>(`/api/v2/server/inbound/${id}/retry`);
  }

  /** Release a held message past the hold and deliver it. */
  bypass(id: number): Promise<CamelMailerResult<InboundRequeueResponse>> {
    return this.client.post<InboundRequeueResponse>(`/api/v2/server/inbound/${id}/bypass`);
  }
}
