import { describe, expect, it, vi } from 'vitest';
import { CamelMailer, CamelMailerError } from '../src/index';
import { TEST_BASE_URL, envelope, errorEnvelope, stubFetch, testClient } from './helpers';

describe('constructor', () => {
  it('throws when no API key is given and the environment has none', () => {
    vi.stubEnv('CAMELMAILER_API_KEY', undefined);
    expect(() => new CamelMailer()).toThrowError(/CAMELMAILER_API_KEY/);
  });

  it('falls back to the CAMELMAILER_API_KEY environment variable', async () => {
    vi.stubEnv('CAMELMAILER_API_KEY', 'cm_from_env');
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    const client = new CamelMailer(undefined, { baseUrl: TEST_BASE_URL });
    await client.ping();
    expect(requests[0]?.headers.get('X-Server-API-Key')).toBe('cm_from_env');
  });

  it('defaults the base URL to the CamelMailer cloud', async () => {
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    const client = new CamelMailer('cm_test_key');
    await client.ping();
    expect(requests[0]?.url.origin).toBe('https://app.camelmailer.com');
  });

  it('honours a baseUrl override for self-hosted instances', async () => {
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    await testClient().ping();
    expect(requests[0]?.url.origin).toBe(TEST_BASE_URL);
  });

  it('strips a trailing slash from the base URL', async () => {
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    const client = new CamelMailer('cm_test_key', { baseUrl: `${TEST_BASE_URL}/` });
    await client.ping();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/ping');
  });
});

describe('request headers', () => {
  it('sends the server API key, content type and user agent', async () => {
    const { requests } = stubFetch({ body: envelope({}) });
    await testClient().emails.send({ from: 'a@b.c', to: ['d@e.f'], subject: 'x' });
    const headers = requests[0]?.headers;
    expect(headers?.get('X-Server-API-Key')).toBe('cm_test_key');
    expect(headers?.get('Content-Type')).toBe('application/json');
    expect(headers?.get('User-Agent')).toMatch(/^camelmailer-node:\d+\.\d+\.\d+$/);
  });

  it('does not send a content type on GET requests', async () => {
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    await testClient().ping();
    expect(requests[0]?.headers.get('Content-Type')).toBeNull();
  });
});

describe('envelope handling', () => {
  it('unwraps the success envelope into data', async () => {
    stubFetch({ body: envelope({ pong: true, server_id: 1, server: 'acme' }) });
    const { data, error } = await testClient().ping();
    expect(error).toBeNull();
    expect(data).toEqual({ pong: true, server_id: 1, server: 'acme' });
  });

  it('returns a typed error for an error envelope without throwing', async () => {
    stubFetch({ status: 401, body: errorEnvelope('Unauthorized', 'Invalid API key') });
    const { data, error } = await testClient().ping();
    expect(data).toBeNull();
    expect(error).toBeInstanceOf(CamelMailerError);
    expect(error?.code).toBe('Unauthorized');
    expect(error?.message).toBe('Invalid API key');
    expect(error?.statusCode).toBe(401);
  });

  it('returns a NetworkError when fetch itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    const { data, error } = await testClient().ping();
    expect(data).toBeNull();
    expect(error?.code).toBe('NetworkError');
    expect(error?.cause).toBeInstanceOf(TypeError);
  });

  it('returns an InvalidResponseError for non-JSON bodies', async () => {
    stubFetch({ status: 502, raw: '<html>Bad Gateway</html>' });
    const { data, error } = await testClient().ping();
    expect(data).toBeNull();
    expect(error?.code).toBe('InvalidResponseError');
    expect(error?.statusCode).toBe(502);
  });

  it('returns an InvalidResponseError when the envelope shape is unknown', async () => {
    stubFetch({ body: { hello: 'world' } });
    const { error } = await testClient().ping();
    expect(error?.code).toBe('InvalidResponseError');
  });
});

describe('ping', () => {
  it('GETs /api/v2/server/ping', async () => {
    const { requests } = stubFetch({ body: envelope({ pong: true }) });
    await testClient().ping();
    expect(requests[0]?.method).toBe('GET');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/ping');
  });
});
