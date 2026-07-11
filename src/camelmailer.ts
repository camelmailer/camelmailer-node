import { Bounces } from './bounces/bounces';
import { Dmarc } from './dmarc/dmarc';
import { Emails } from './emails/emails';
import { CamelMailerError } from './error';
import { StatsResource } from './stats/stats';
import { Streams } from './streams/streams';
import { Templates } from './templates/templates';
import type { CamelMailerResult, PingResponse } from './types';
import { VERSION } from './version';

const DEFAULT_BASE_URL = 'https://app.camelmailer.com';
const MISSING_KEY_MESSAGE =
  'Missing API key. Pass it to the constructor (`new CamelMailer("cm_...")`) ' +
  'or set the CAMELMAILER_API_KEY environment variable.';

/** Constructor options for {@link CamelMailer}. */
export interface CamelMailerOptions {
  /**
   * URL of your CamelMailer instance, e.g. `https://mail.example.com` for
   * self-hosted setups. Defaults to the `CAMELMAILER_BASE_URL` environment
   * variable, then to the CamelMailer cloud (`https://app.camelmailer.com`).
   */
  baseUrl?: string;
  /** Override the `User-Agent` header sent with every request. */
  userAgent?: string;
}

/** Query parameters; `undefined` values are omitted. */
type QueryParams = object;

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  const value = process.env[name];
  return value === undefined || value === '' ? undefined : value;
}

/**
 * The CamelMailer messaging client.
 *
 * Authenticates against `/api/v2/server/*` with a server API key
 * (`X-Server-API-Key`). All methods resolve to `{ data, error }` and never
 * throw for request failures — network problems surface as a
 * {@link CamelMailerError} with code `NetworkError`.
 *
 * ```ts
 * import { CamelMailer } from 'camelmailer';
 *
 * const camelmailer = new CamelMailer('cm_xxxx');
 * const { data, error } = await camelmailer.emails.send({
 *   from: 'billing@acme.com',
 *   to: 'ada@example.com',
 *   subject: 'Your receipt',
 *   text_body: 'Thanks for your purchase.',
 * });
 * ```
 */
export class CamelMailer {
  /** Send and read messages. */
  readonly emails = new Emails(this);
  /** Manage stored message templates. */
  readonly templates = new Templates(this);
  /** Manage message streams. */
  readonly streams = new Streams(this);
  /** Message counters and queue statistics. */
  readonly stats = new StatsResource(this);
  /** Read bounced messages. */
  readonly bounces = new Bounces(this);
  /** DMARC monitoring. */
  readonly dmarc = new Dmarc(this);

  readonly baseUrl: string;
  private readonly key: string;
  private readonly userAgent: string;

  /**
   * @param key A server API key. Falls back to `CAMELMAILER_API_KEY`.
   * @param options Base URL (self-hosted instances) and other overrides.
   * @throws Error when no API key is provided anywhere.
   */
  constructor(key?: string, options: CamelMailerOptions = {}) {
    const resolvedKey = key ?? readEnv('CAMELMAILER_API_KEY');
    if (!resolvedKey) {
      throw new Error(MISSING_KEY_MESSAGE);
    }
    this.key = resolvedKey;
    const baseUrl = options.baseUrl ?? readEnv('CAMELMAILER_BASE_URL') ?? DEFAULT_BASE_URL;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.userAgent = options.userAgent ?? `camelmailer-node:${VERSION}`;
  }

  /** Validate the API key against the instance (`GET /api/v2/server/ping`). */
  ping(): Promise<CamelMailerResult<PingResponse>> {
    return this.get<PingResponse>('/api/v2/server/ping');
  }

  /**
   * Perform a GET request against the API. Used by the resource classes;
   * handy as an escape hatch for endpoints the SDK does not wrap yet.
   */
  get<T>(path: string, query?: QueryParams): Promise<CamelMailerResult<T>> {
    return this.request<T>('GET', path, undefined, query);
  }

  /** Perform a POST request against the API (see {@link CamelMailer.get}). */
  post<T>(path: string, body?: unknown): Promise<CamelMailerResult<T>> {
    return this.request<T>('POST', path, body);
  }

  /** Perform a PATCH request against the API (see {@link CamelMailer.get}). */
  patch<T>(path: string, body?: unknown): Promise<CamelMailerResult<T>> {
    return this.request<T>('PATCH', path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    query?: QueryParams,
  ): Promise<CamelMailerResult<T>> {
    const url = new URL(this.baseUrl + path);
    for (const [name, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(name, String(value));
    }

    const headers: Record<string, string> = {
      'X-Server-API-Key': this.key,
      'User-Agent': this.userAgent,
    };
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), init);
    } catch (cause) {
      return {
        data: null,
        error: new CamelMailerError(
          `Unable to reach ${url.origin} — ${cause instanceof Error ? cause.message : String(cause)}`,
          'NetworkError',
          null,
          { cause },
        ),
      };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      return {
        data: null,
        error: new CamelMailerError(
          `The response was not valid JSON (HTTP ${response.status})`,
          'InvalidResponseError',
          response.status,
          { cause },
        ),
      };
    }

    const envelope = payload as {
      status?: string;
      data?: T;
      error?: { code?: string; message?: string };
    };

    if (envelope?.status === 'success') {
      return { data: (envelope.data ?? {}) as T, error: null };
    }
    if (envelope?.status === 'error' && envelope.error) {
      return {
        data: null,
        error: new CamelMailerError(
          envelope.error.message ?? 'Unknown API error',
          envelope.error.code ?? 'InternalServerError',
          response.status,
        ),
      };
    }
    return {
      data: null,
      error: new CamelMailerError(
        `Unexpected response envelope (HTTP ${response.status})`,
        'InvalidResponseError',
        response.status,
      ),
    };
  }
}
