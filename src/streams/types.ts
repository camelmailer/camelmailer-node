export type StreamType = 'transactional' | 'broadcast' | 'inbound';

/** A message stream — an isolated sending lane of a server. */
export interface Stream {
  id: number;
  uuid: string;
  name: string;
  permalink: string;
  stream_type: StreamType;
  archived: boolean;
}

/** Options for {@link Streams.create}. */
export interface CreateStreamOptions {
  name: string;
  /** URL slug; derived from `name` when omitted. */
  permalink?: string;
  /** Defaults to `transactional`. */
  stream_type?: StreamType;
}

/** Options for {@link Streams.update} — only the given fields change. */
export interface UpdateStreamOptions {
  name?: string;
  stream_type?: StreamType;
  archived?: boolean;
}

export interface StreamResponse {
  stream: Stream;
}

export interface ListStreamsResponse {
  streams: Stream[];
}
