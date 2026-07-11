import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  CreateStreamOptions,
  ListStreamsResponse,
  StreamResponse,
  UpdateStreamOptions,
} from './types';

/** Manage message streams (`/api/v2/server/streams`). */
export class Streams {
  constructor(private readonly client: CamelMailer) {}

  /** List all message streams of the server. */
  list(): Promise<CamelMailerResult<ListStreamsResponse>> {
    return this.client.get<ListStreamsResponse>('/api/v2/server/streams');
  }

  /** Create a message stream. */
  create(options: CreateStreamOptions): Promise<CamelMailerResult<StreamResponse>> {
    return this.client.post<StreamResponse>('/api/v2/server/streams', options);
  }

  /** Retrieve a stream by permalink. */
  get(permalink: string): Promise<CamelMailerResult<StreamResponse>> {
    return this.client.get<StreamResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}`,
    );
  }

  /** Update a stream; only the provided fields are changed. */
  update(
    permalink: string,
    options: UpdateStreamOptions,
  ): Promise<CamelMailerResult<StreamResponse>> {
    return this.client.patch<StreamResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}`,
      options,
    );
  }

  /** Archive a stream (archived streams reject new sends). */
  archive(permalink: string): Promise<CamelMailerResult<StreamResponse>> {
    return this.client.post<StreamResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/archive`,
    );
  }
}
