# APPLY — ARCHITECTURE BATCH 7

Prerequisite: Architecture Batch 0–6.

Batch 7 adds the guide authority registry and then applies a small idempotent runtime/config integration.

## 1. Copy the overlay into the repo root

Do not overwrite unrelated files.

## 2. Dry-run

```bash
node scripts/apply-guide-authority-runtime.mjs --dry-run
```

Expected:

```text
Existing live guides: 15
Virtual guide clusters: 5
VERDICT: PASS
```

## 3. Apply

```bash
node scripts/apply-guide-authority-runtime.mjs
```

Run a second time to confirm idempotence:

```bash
node scripts/apply-guide-authority-runtime.mjs
```

The second run should report `Files to change: 0`.

## 4. Validate Batch 0–7

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
node scripts/validate-local-area-architecture.mjs
node scripts/validate-brand-model-series-foundation.mjs
node scripts/validate-guide-authority-architecture.mjs
npm run build
```

Expected Batch 7:

```text
Live routes: 90
Indexable: 89
Existing live guides: 15
Virtual topical clusters: 5
Future guide candidates: 12
Guide related inbound failures: 0
Candidate URLs leaked live: 0
Automatic publishing: false
VERDICT: PASS
```

## Safety

This batch does not add/remove/rename any live route and does not change:
- canonical ownership,
- robots/noindex,
- sitemap membership,
- redirects,
- article breadcrumb parent (`/บทความ`).

It updates curated contextual link targets only.
