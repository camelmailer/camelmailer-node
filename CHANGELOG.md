# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[Unreleased]: https://github.com/camelmailer/camelmailer-node/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/camelmailer/camelmailer-node/releases/tag/v0.1.0
