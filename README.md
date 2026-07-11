# CamelMailer Node.js SDK

[![CI](https://github.com/camelmailer/camelmailer-node/actions/workflows/ci.yml/badge.svg)](https://github.com/camelmailer/camelmailer-node/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/camelmailer.svg)](https://www.npmjs.com/package/camelmailer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Node.js SDK for [CamelMailer](https://camelmailer.com) — the open-source transactional email platform. Works with the CamelMailer cloud and any self-hosted instance.

- TypeScript-first, fully typed request and response shapes
- Zero runtime dependencies (native `fetch`, Node.js 18+)
- ESM and CommonJS

## Install

```bash
npm install camelmailer
```

## Quickstart

Grab a server API key from your CamelMailer dashboard.

```ts
import { CamelMailer } from 'camelmailer';

const camelmailer = new CamelMailer('cm_xxxx');

const { data, error } = await camelmailer.emails.send({
  from: 'billing@acme.com',
  to: 'ada@example.com',
  subject: 'Your receipt',
  html_body: '<p>Thanks for your purchase.</p>',
});
```

The key can also come from the `CAMELMAILER_API_KEY` environment variable:

```ts
const camelmailer = new CamelMailer();
```

## Self-hosted instances

Point the client at your own instance (defaults to `https://app.camelmailer.com`, or the `CAMELMAILER_BASE_URL` environment variable):

```ts
const camelmailer = new CamelMailer('cm_xxxx', { baseUrl: 'https://mail.example.com' });
```

## Error handling

Every method resolves to `{ data, error }` — nothing throws for request failures. `error` is a `CamelMailerError` with a stable `code` (`Unauthorized`, `NotFound`, `ValidationError`, `ParameterMissing`, …), the API message, and the HTTP `statusCode`. Network failures use the code `NetworkError`.

```ts
const { data, error } = await camelmailer.emails.send({ /* … */ });

if (error) {
  switch (error.code) {
    case 'ValidationError':
      console.error('Rejected:', error.message);
      break;
    case 'NetworkError':
      console.error('Instance unreachable:', error.message);
      break;
    default:
      console.error(error.code, error.message);
  }
  return;
}

console.log('Queued', data.message_id);
```

## Emails

```ts
// Send with attachments, tags, metadata and custom headers
await camelmailer.emails.send({
  from: { email: 'billing@acme.com', name: 'Acme Billing' },
  to: ['ada@example.com'],
  subject: 'Invoice #42',
  html_body: '<p>See attached.</p>',
  attachments: [{ name: 'invoice.pdf', content_type: 'application/pdf', data_base64: '…' }],
  tag: 'invoice',
  metadata: { order_id: 42 },
});

// Batch: one request, per-message results
const { data } = await camelmailer.emails.sendBatch([
  { from: 'a@acme.com', to: 'x@example.com', subject: 'One', text_body: '…' },
  { from: 'a@acme.com', to: 'y@example.com', subject: 'Two', text_body: '…' },
]);
data?.messages.forEach((entry) =>
  entry.status === 'success' ? console.log(entry.data.message_id) : console.warn(entry.error.code),
);

// Read messages back
await camelmailer.emails.get(42);                       // message + delivery attempts
await camelmailer.emails.list({ status: 'Sent', tag: 'invoice', per_page: 50 });
await camelmailer.emails.deliveries(42);
await camelmailer.emails.opens(42);
await camelmailer.emails.clicks(42);
await camelmailer.emails.raw(42);                       // base64 RFC 5322 source
```

## Templates

```ts
await camelmailer.templates.create({
  name: 'Welcome',
  subject: 'Welcome, {{ name }}!',
  html_body: '<p>Hi {{ name }}, thanks for joining {{ product }}.</p>',
});

// Send with a stored template
await camelmailer.emails.sendWithTemplate({
  from: 'hello@acme.com',
  to: 'ada@example.com',
  template: 'welcome',
  template_model: { name: 'Ada', product: 'Acme' },
});

// …or to many recipients at once
await camelmailer.emails.sendWithTemplateBatch([
  { from: 'hello@acme.com', to: 'ada@example.com', template: 'welcome', template_model: { name: 'Ada' } },
  { from: 'hello@acme.com', to: 'grace@example.com', template: 'welcome', template_model: { name: 'Grace' } },
]);

await camelmailer.templates.list();
await camelmailer.templates.get('welcome');
await camelmailer.templates.update('welcome', { subject: 'Hey {{ name }}!' });
await camelmailer.templates.render('welcome', { name: 'Ada' }); // dry-run preview
await camelmailer.templates.archive('welcome');
```

## Streams

```ts
await camelmailer.streams.create({ name: 'Broadcasts', stream_type: 'broadcast' });
await camelmailer.streams.list();
await camelmailer.streams.get('broadcasts');
await camelmailer.streams.update('broadcasts', { name: 'Newsletter' });
await camelmailer.streams.archive('broadcasts');

// Send into a specific stream
await camelmailer.emails.send({ from: 'a@acme.com', to: 'x@example.com', subject: 'News', stream: 'broadcasts' });
```

## Stats and bounces

```ts
await camelmailer.stats.get({ from: '2026-01-01T00:00:00Z' }); // counters
await camelmailer.stats.deliveries();                          // outbound queue depth

await camelmailer.bounces.list({ tag: 'invoice' });
await camelmailer.bounces.get(42);
```

## DMARC monitoring

```ts
await camelmailer.dmarc.summary({ domain: 'acme.com' }); // pass rate + top sources
await camelmailer.dmarc.reports({ page: 1 });            // stored aggregate reports
await camelmailer.dmarc.report(9);                       // one report with records
```

## Docs

Full API reference: [camelmailer.com/docs](https://camelmailer.com/docs)

## License

MIT
