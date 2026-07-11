# Contributing

## Setup

```bash
npm install
```

Node.js >= 18 required (the SDK uses native `fetch`).

## Commands

```bash
npm test            # unit tests (vitest, mocked fetch — no network)
npm run test:watch  # watch mode
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run build       # tsup → dist/ (ESM + CJS + d.ts)
```

To run the integration suite against a real instance:

```bash
CAMELMAILER_API_KEY=cm_xxx CAMELMAILER_BASE_URL=https://mail.example.com npm test
```

## Conventions

- Test-driven: new behaviour lands with tests against the mocked HTTP layer.
- The API wire format is snake_case; the SDK exposes it 1:1 — no field renaming.
- Zero runtime dependencies; keep it that way.
- Every public method carries JSDoc.
- Response/request types derive from the CamelMailer OpenAPI spec.
- Bump `src/version.ts` together with `package.json`, and keep
  `CHANGELOG.md` (Keep a Changelog) up to date.
