/**
 * Integration roundtrip against a real CamelMailer instance.
 *
 * Skipped unless both environment variables are set:
 *   CAMELMAILER_API_KEY   — a server API key
 *   CAMELMAILER_BASE_URL  — the instance URL (e.g. https://app.camelmailer.com)
 *
 * Optionally CAMELMAILER_TEST_FROM / CAMELMAILER_TEST_TO enable a real send.
 * This file is intentionally NOT part of CI.
 */
import { describe, expect, it } from 'vitest';
import { CamelMailer } from '../src/index';

const apiKey = process.env.CAMELMAILER_API_KEY;
const baseUrl = process.env.CAMELMAILER_BASE_URL;
const enabled = Boolean(apiKey && baseUrl);

describe.skipIf(!enabled)('integration', () => {
  const client = () => new CamelMailer(apiKey, { baseUrl });

  it('pings the instance', async () => {
    const { data, error } = await client().ping();
    expect(error).toBeNull();
    expect(data?.pong).toBe(true);
  });

  it('lists messages with pagination', async () => {
    const { data, error } = await client().emails.list({ per_page: 1 });
    expect(error).toBeNull();
    expect(Array.isArray(data?.messages)).toBe(true);
    expect(data?.pagination.per_page).toBe(1);
  });

  it('reads stats', async () => {
    const { data, error } = await client().stats.get();
    expect(error).toBeNull();
    expect(typeof data?.stats.total).toBe('number');
  });

  it('round-trips a template', async () => {
    const name = `sdk-it-${Date.now()}`;
    const created = await client().templates.create({
      name,
      subject: 'Hello {{ name }}',
      text_body: 'Hi {{ name }}',
    });
    expect(created.error).toBeNull();
    const permalink = created.data?.template.permalink;
    expect(permalink).toBeTruthy();

    const rendered = await client().templates.render(permalink!, { name: 'Ada' });
    expect(rendered.error).toBeNull();
    expect(rendered.data?.rendered.subject).toBe('Hello Ada');

    const archived = await client().templates.archive(permalink!);
    expect(archived.error).toBeNull();
    expect(archived.data?.template.archived).toBe(true);
  });

  it.skipIf(!process.env.CAMELMAILER_TEST_FROM || !process.env.CAMELMAILER_TEST_TO)(
    'sends a real email',
    async () => {
      const { data, error } = await client().emails.send({
        from: process.env.CAMELMAILER_TEST_FROM!,
        to: [process.env.CAMELMAILER_TEST_TO!],
        subject: 'camelmailer-node integration test',
        text_body: 'Sent by the camelmailer-node integration suite.',
        tag: 'sdk-integration',
      });
      expect(error).toBeNull();
      expect(data?.recipients[0]?.status).toBe('queued');
    },
  );
});
