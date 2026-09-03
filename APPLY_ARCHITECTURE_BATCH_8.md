# APPLY — ARCHITECTURE BATCH 8

Prerequisite: Architecture Batch 0–7.

## 1. Copy Batch 8 incremental files to the repository root

## 2. Apply config state first

```bash
node scripts/apply-navigation-architecture.mjs --dry-run
node scripts/apply-navigation-architecture.mjs
```

Without `--layout`, this updates architecture metadata/config state only and intentionally warns that shell integration is pending.

## 3. Identify the real shared Astro layout

Examples only:

```text
src/layouts/BaseLayout.astro
src/layouts/Layout.astro
src/layouts/MainLayout.astro
```

Do not guess. Use the layout actually wrapping public pages.

## 4. Dry-run layout integration

```bash
node scripts/apply-navigation-architecture.mjs   --dry-run   --layout=src/layouts/<actual-shared-layout>.astro
```

### If the layout already contains an unmanaged Header/Footer

The installer will NOT replace or duplicate it automatically.

Expected:

```text
VERDICT: PASS_WITH_REVIEW_REQUIRED
```

In that case integrate `ArchitectureHeader.astro` and `ArchitectureFooter.astro` into the site's existing shell deliberately, then validate.

### If no Header/Footer exists

Apply:

```bash
node scripts/apply-navigation-architecture.mjs   --layout=src/layouts/<actual-shared-layout>.astro
```

Run it again; the second run should change 0 files.

## 5. Validate Batch 0–8

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
node scripts/validate-local-area-architecture.mjs
node scripts/validate-brand-model-series-foundation.mjs
node scripts/validate-guide-authority-architecture.mjs
node scripts/validate-navigation-architecture.mjs   --layout=src/layouts/<actual-shared-layout>.astro

npm run build
```

Expected Batch 8 architecture:

```text
Live routes: 90
Indexable: 89
Header primary groups: 6/6
Footer columns: 5/5
Tier A global-discovery failures: 0
Unreleased candidate leaks: 0
Global article-child links: 0
VERDICT: PASS
```

## Production QA

Check desktop + mobile:

1. Header has six bounded primary choices.
2. Apple heading never links to a nonexistent Apple hub.
3. Footer is five columns and does not enumerate every article/location.
4. `/พื้นที่` and `/บทความ` remain the discovery owners for their clusters.
5. Core Tier A money pages are reachable globally.
6. No duplicate legacy Header/Footer remains.
7. Keyboard navigation and `<summary>` menus remain usable.
