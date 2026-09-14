import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type { ListLogsOptions, ListLogsResponse, ListTagsResponse } from './types';

/**
 * The server's own request log and tag index
 * (`/api/v2/server/logs`, `/api/v2/server/tags`).
 *
 * Useful when a send did not arrive and the question is whether the request
 * ever reached the API, and with what answer.
 */
export class Logs {
  constructor(private readonly client: CamelMailer) {}

  /** List logged API requests, newest first. */
  list(options: ListLogsOptions = {}): Promise<CamelMailerResult<ListLogsResponse>> {
    return this.client.get<ListLogsResponse>('/api/v2/server/logs', options);
  }

  /** Tags used by the server's recent messages, most used first. */
  tags(): Promise<CamelMailerResult<ListTagsResponse>> {
    return this.client.get<ListTagsResponse>('/api/v2/server/tags');
  }
}
