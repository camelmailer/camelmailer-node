# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-09-14

### Added

- `sendWithTemplate()` and `sendWithTemplateBatch()` take an idempotency
  key. The API claims all four send endpoints, so leaving it off these two
  made a template send the one thing a retry could duplicate.

## [0.2.1] - 2026-09-14

### Fixed

- `campaigns.create()` was documented as creating a draft. It posts to
  `POST /streams/{permalink}/campaigns`, which creates the campaign with
  status `sending` and expands it to the stream's subscribers before the
  call returns. Following the documentation would broadcast when you meant
  to compose.

### Added

- `campaigns.createDraft()` for the route that actually plans a campaign
  (`POST /campaigns`): it names the stream in the body and honours
  `scheduled_at` and `send_now`.
- `campaigns.createAndSend()`, the accurate name for the send-immediately
  route.

### Deprecated

- `campaigns.create()`, in favour of `campaigns.createAndSend()`. It still
  calls the same endpoint, so existing code keeps working.

## [0.2.0] - 2026-09-14

### Added

- **Broadcast campaigns** (`campaigns`): list server-wide or per stream,
  create, update, send, cancel, and read per-campaign statistics.
  Scheduling is three-valued on purpose: omit `scheduled_at` to leave a
  schedule alone, set a time to move a draft to `scheduled`, pass `null`
  to clear it and drop back to `draft`.
- **Subscribers** (`subscribers`): list, add, bulk `import`, `remove`, and
  `complaint`, which writes a stream-scoped suppression and unsubscribes
  in one idempotent call. Subscribers belong to one stream, not to a
  global contact list.
- **Layouts** (`layouts`): list, create, get, update, delete and
  `uploadLogo`. The HTML wrapper must embed the body as `{{{ content }}}`.
- **Inbound and held mail** (`inbound`): list with filters, get, `retry`
  and `bypass`.
- **Request log and tags** (`logs`): `list` with status-class and method
  filters, and `tags` with usage counts.
- **`emails.sendToStream`**: the same content to every subscriber of a
  broadcast stream, reporting `queued` against `skipped`.
- **Idempotent sending**: `emails.send` and `emails.sendBatch` take an
  optional second argument with an `idempotencyKey`, sent as the
  `Idempotency-Key` header. A retry replays the original result rather
  than queuing a second copy.
- `client.delete()` and `client.postWithHeaders()`, which the new
  resources use and which stay available as escape hatches.

### Changed

- `CamelMailerErrorCode` knows `SendLimitExceeded` (HTTP 429, raised
  before anything is stored) and `InvalidIdempotentRequest` (HTTP 409, a
  key reused for different content).

### Note

These six surfaces were missing because they were never in the OpenAPI
spec this SDK is written from, although the server has served them since
v0.5. The spec now covers all 59 server routes and CI checks it.

## [Unreleased]

## [0.1.0] - 2026-07-11

### Added

- `CamelMailer` client with `X-Server-API-Key` auth, `CAMELMAILER_API_KEY` /
  `CAMELMAILER_BASE_URL` environment fallbacks and a configurable `baseUrl`
  for self-hosted instances.
- `emails`: `send`, `sendBatch`, `sendWithTemplate`, `sendWithTemplateBatch`,
  `get`, `list`, `deliveries`, `opens`, `clicks`, `raw`.
- `templates`: `list`, `create`, `get`, `update`, `archive`, `render`.
- `streams`: `list`, `create`, `get`, `update`, `archive`.
- `stats`: `get`, `deliveries`.
- `bounces`: `list`, `get`.
- `dmarc`: `summary`, `reports`, `report`.
- `ping` and generic `get`/`post`/`patch` escape hatches.
- `{ data, error }` result envelopes with typed `CamelMailerError`
  (stable `code`, `statusCode`), no throwing on request failures.
- ESM + CJS dual build, zero runtime dependencies, Node.js >= 18.

[Unreleased]: https://github.com/camelmailer/camelmailer-node/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/camelmailer/camelmailer-node/releases/tag/v0.2.2
[0.2.1]: https://github.com/camelmailer/camelmailer-node/releases/tag/v0.2.1
[0.2.0]: https://github.com/camelmailer/camelmailer-node/releases/tag/v0.2.0
[0.1.0]: https://github.com/camelmailer/camelmailer-node/releases/tag/v0.1.0
