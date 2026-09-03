# APPLY — ARCHITECTURE BATCH 4

Batch 4 is additive and non-destructive.

## Install

Copy the overlay into the repository root, preserving paths.

## Validate

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
npm run build
```

Expected Batch 4 verdict:

```text
Live routes: 89
Indexable: 88
Triage groups: 16
Destructive candidates currently proposed: 0
Automatic execution: false
VERDICT: PASS
```

## Optional GSC evidence

When a fresh query→page CSV is available:

```bash
node scripts/evaluate-cannibalization-gsc.mjs --input=docs/gsc/query-page.csv
```

Do not convert evaluator output into redirects/noindex automatically. Review first.
