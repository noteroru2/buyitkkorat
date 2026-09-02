# APPLY — ARCHITECTURE BATCH 3

Prerequisites: ARCHITECTURE BATCH 0, 1 and 2 are already present.

## Files changed/added

- `src/config/internal-link-recovery.json` — new Batch 3 policy/bridges.
- `src/config/runtime-architecture.ts` — hub discovery, circular sibling recovery, conversion bridges.
- `src/components/architecture/ArchitectureRelatedServices.astro` — renders Discovery and Related as separate deduplicated sections.
- `scripts/validate-internal-link-graph.mjs` — graph projection quality gate.
- `docs/architecture/ARCHITECTURE-BATCH-3.md`
- `docs/architecture/internal-link-projection.csv`
- `docs/architecture/orphan-recovery-matrix.csv`

## Required checks

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
npm run build
```

Expected Batch 3 gate:

```text
Tier A/B non-TRUST/non-LOCATION inbound<2: 0
Articles inbound<2: 0
Unexpected zero contextual inbound: 0
VERDICT: PASS
```

Do not create the virtual Apple or Local hub during this batch. Do not merge/redirect/noindex cannibalization candidates without GSC query→page evidence.
