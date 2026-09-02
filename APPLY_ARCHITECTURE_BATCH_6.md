# APPLY — ARCHITECTURE BATCH 6

## Scope

Foundation only. This batch creates no live Brand/Series/Model route.

It adds:
- Brand/Series candidate registry
- Model URL conventions and hard release gate
- anti-doorway cross-product policy
- TypeScript planning helpers
- candidate readiness scorer
- validator and architecture matrices

## Validate

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
node scripts/validate-local-area-architecture.mjs
node scripts/validate-brand-model-series-foundation.mjs
npm run build
```

Expected Batch 6 result:

```text
Live routes: 90
Indexable: 89
Brand candidates: 10
Series candidates: 42
Exact model candidates: 0
Candidate URLs leaked live: 0
Automatic publishing: false
VERDICT: PASS
```

## Important

Do not create candidate pages merely because they exist in the registry.
The next release batch must select a small evidence-backed subset and release it through the normal URL/canonical/internal-link/schema/content quality gates.
