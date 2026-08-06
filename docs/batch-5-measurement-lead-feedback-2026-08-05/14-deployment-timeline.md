# 14 — Deployment and Change Timeline

Source of truth for scoring windows: `src/data/measurementConfig.ts` → `DEPLOYMENT_TIMELINE`.

| Batch | Implementation commit | Final main SHA | First observed Production | Attestation | Measurement start | Earliest evaluation |
|-------|----------------------|----------------|---------------------------|-------------|-------------------|---------------------|
| batch-1 | 55b176e | 55b176e | 2026-08-05 | CONTENT_VERIFIED_SHA_NOT_ATTESTED | 2026-08-05 | 2026-08-19 |
| batch-1.1 | daebafc | fba8a60 | 2026-08-05 | CONTENT_VERIFIED_SHA_NOT_ATTESTED | 2026-08-05 | 2026-08-19 |
| batch-2 | 3e924f0 | 2cbb825 | 2026-08-05 | CONTENT_VERIFIED_SHA_NOT_ATTESTED | 2026-08-05 | 2026-08-19 |
| batch-3 | 5035c5f | e7b413d | 2026-08-05 | CONTENT_VERIFIED_SHA_NOT_ATTESTED | 2026-08-05 | 2026-08-19 |
| batch-4 | 5df40c8 | 793e3f6 | 2026-08-05 | CONTENT_VERIFIED_SHA_NOT_ATTESTED | 2026-08-05 | 2026-08-19 |
| batch-5 | *(this commit)* | *(after push)* | *(first observed post-deploy)* | CONTENT_VERIFIED_SHA_NOT_ATTESTED until attested | post-deploy date | +14 days default |

## Rules

- Git commit date ≠ Production deploy date unless attested
- Record `x-vercel-id`, content fingerprint, Main SHA when SHA unknown
- Never use pre-change GSC/GA windows as post-change outcomes
