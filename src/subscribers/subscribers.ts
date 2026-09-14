import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  AddSubscriberOptions,
  ImportSubscribersResponse,
  ListSubscribersResponse,
  RemoveSubscriberResponse,
  SubscriberResponse,
} from './types';

/**
 * Opt-in subscribers of a broadcast stream
 * (`/api/v2/server/streams/{permalink}/subscribers`).
 *
 * A broadcast send to an address that is not subscribed is refused, so
 * this list is the audience, not a convenience.
 */
export class Subscribers {
  constructor(private readonly client: CamelMailer) {}

  private base(permalink: string): string {
    return `/api/v2/server/streams/${encodeURIComponent(permalink)}/subscribers`;
  }

  /** List the stream's subscribers, subscribed and unsubscribed alike. */
  list(permalink: string): Promise<CamelMailerResult<ListSubscribersResponse>> {
    return this.client.get<ListSubscribersResponse>(this.base(permalink));
  }

  /** Add or update one subscriber. Upserts by address, so calling it
   *  twice is safe. */
  add(
    permalink: string,
    options: AddSubscriberOptions,
  ): Promise<CamelMailerResult<SubscriberResponse>> {
    return this.client.post<SubscriberResponse>(this.base(permalink), options);
  }

  /**
   * Add many addresses at once, all as `subscribed`. Blanks and duplicates
   * within the request are skipped, and the response reports how many were
   * written against how many survived that filtering.
   */
  import(
    permalink: string,
    addresses: string[],
  ): Promise<CamelMailerResult<ImportSubscribersResponse>> {
    return this.client.post<ImportSubscribersResponse>(`${this.base(permalink)}/import`, {
      addresses,
    });
  }

  /** Remove a subscriber from the stream entirely. */
  remove(
    permalink: string,
    address: string,
  ): Promise<CamelMailerResult<RemoveSubscriberResponse>> {
    return this.client.delete<RemoveSubscriberResponse>(
      `${this.base(permalink)}/${encodeURIComponent(address)}`,
    );
  }

  /**
   * Record a spam complaint against an address: writes a stream-scoped
   * `complaint` suppression and flips the subscription to `unsubscribed`.
   * Idempotent, so a feedback loop can replay it safely.
   */
  complaint(
    permalink: string,
    address: string,
  ): Promise<CamelMailerResult<SubscriberResponse>> {
    return this.client.post<SubscriberResponse>(
      `${this.base(permalink)}/${encodeURIComponent(address)}/complaint`,
    );
  }
}
