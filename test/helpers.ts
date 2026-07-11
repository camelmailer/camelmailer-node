import { vi } from 'vitest';
import { CamelMailer } from '../src/index';

export interface RecordedRequest {
  url: URL;
  method: string;
  headers: Headers;
  body: unknown;
}

export interface StubResponse {
  status?: number;
  body?: unknown;
  raw?: string;
}

/** A canonical success envelope as the API returns it. */
export function envelope(data: unknown) {
  return { status: 'success', time: 0.004, data };
}

/** A canonical error envelope as the API returns it. */
export function errorEnvelope(code: string, message: string) {
  return { status: 'error', time: 0.004, error: { code, message } };
}

/**
 * Replace global fetch with a stub that records every request and plays
 * back the given responses in order (repeating the last one).
 */
export function stubFetch(...responses: StubResponse[]) {
  const requests: RecordedRequest[] = [];
  const queue = [...responses];
  const fetchMock = vi.fn(async (input: string | URL, init: RequestInit = {}) => {
    requests.push({
      url: new URL(String(input)),
      method: init.method ?? 'GET',
      headers: new Headers(init.headers),
      body: typeof init.body === 'string' ? JSON.parse(init.body) : null,
    });
    const next = (queue.length > 1 ? queue.shift() : queue[0]) ?? { body: envelope({}) };
    const text = next.raw ?? JSON.stringify(next.body ?? envelope({}));
    return new Response(text, {
      status: next.status ?? 200,
      headers: { 'content-type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { requests, fetchMock };
}

export const TEST_BASE_URL = 'https://mail.example.test';

/** A client pointed at a fake instance; combine with stubFetch(). */
export function testClient(): CamelMailer {
  return new CamelMailer('cm_test_key', { baseUrl: TEST_BASE_URL });
}
