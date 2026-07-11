import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type { GetBounceResponse, ListBouncesOptions, ListBouncesResponse } from './types';

/** Read bounced messages (`/api/v2/server/bounces`). */
export class Bounces {
  constructor(private readonly client: CamelMailer) {}

  /** List bounced messages, filtered and paginated. */
  list(options: ListBouncesOptions = {}): Promise<CamelMailerResult<ListBouncesResponse>> {
    return this.client.get<ListBouncesResponse>('/api/v2/server/bounces', options);
  }

  /** Retrieve one bounced message by id. */
  get(id: number): Promise<CamelMailerResult<GetBounceResponse>> {
    return this.client.get<GetBounceResponse>(`/api/v2/server/bounces/${id}`);
  }
}
