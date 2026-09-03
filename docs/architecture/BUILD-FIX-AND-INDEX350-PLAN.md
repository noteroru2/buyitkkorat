# BUILD FIX + INDEX 350+ PLAN

## Build failure fixed

The V3 image/layout package imports `src/components/ContentContactAside.astro`.
The pre-UX-V2 real repository did not contain that file, so applying V3 alone caused:

```text
[UNRESOLVED_IMPORT] Could not resolve ../components/ContentContactAside.astro
```

The corrected package is self-contained and includes all shared UX V2 dependencies required by the V3 layouts.

## Retest

```powershell
npm run validate:architecture
npm run validate:index350
npm run build
npm run audit:architecture-build
```

Current production architecture remains **99 live / 98 indexable / 1 noindex** until expansion pages are actually authored and released.

## 350+ target

The governed expansion plan contains **262 new candidates** for a target of **360 indexable pages**. Candidates are not auto-published. See:

- `docs/architecture/INDEX-350-EXPANSION-PLAN.md`
- `docs/architecture/index-350-route-matrix.csv`
- `src/config/index-350-expansion-plan.json`
- `scripts/validate-index-350-expansion-plan.mjs`
