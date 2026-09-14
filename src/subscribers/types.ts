/** Whether a subscriber currently receives broadcast mail on this stream. */
export type SubscriberStatus = 'subscribed' | 'unsubscribed';

/**
 * One opt-in address on one broadcast stream.
 *
 * Subscribers are wired to a stream rather than to a global contact list,
 * so the same address can be subscribed to one stream and not another.
 */
export interface Subscriber {
  id: number;
  address: string;
  status: SubscriberStatus;
  created_at: string;
}

/** Options for {@link Subscribers.add}. */
export interface AddSubscriberOptions {
  address: string;
  /** Defaults to `subscribed`. */
  status?: SubscriberStatus;
}

export interface SubscriberResponse {
  subscriber: Subscriber;
}

export interface ListSubscribersResponse {
  subscribers: Subscriber[];
}

/** Result of {@link Subscribers.import}. */
export interface ImportSubscribersResponse {
  /** How many addresses were written. */
  added: number;
  /** How many the request carried after blanks and duplicates were dropped. */
  total: number;
}

export interface RemoveSubscriberResponse {
  deleted: boolean;
}
