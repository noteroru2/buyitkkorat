# ARCHITECTURE BATCH 10 — Architecture Production Quality Gate & Expansion Readiness

## Purpose

Close the architecture phase before Brand/Series/Guide expansion.

Batch 10 does **not** increase URL count. It decides whether the current 90-route architecture is ready to support controlled expansion.

## Static release state

- Live routes: **90**
- Indexable routes: **89**
- Noindex routes: **1**
- Governed unreleased candidates: **64**
  - Brand: 10
  - Series: 42
  - Model: 0
  - Guide: 12
- New live routes: **0**
- Automatic expansion: **OFF**

## Five required gates

1. **Architecture Static — 25 points**
   - Batch 0–9 validators pass
   - no candidate/virtual leaks
   - ownership graph coherent

2. **SEO Signals — 20 points**
   - sitemap 89
   - canonical/robots/schema ownership consistent
   - noindex excluded

3. **Source Integration — 20 points**
   - real shared Header/Footer integration
   - real SEO head integration
   - no duplicate shell SEO signals

4. **Build & Crawl — 25 points**
   - real repository build passes
   - governed routes render
   - broken links = 0
   - unexpected orphans = 0
   - crawl depth <= 4

5. **Expansion Evidence — 10 points**
   - at least one Band-1 candidate has real evidence
   - identity/content/ownership review is complete

All five are required for `READY_FOR_CONTROLLED_RELEASE`.

## Decision states

```text
BLOCKED
CONDITIONALLY_READY
READY_FOR_CONTROLLED_RELEASE
```

The overlay itself can only prove the static architecture portion.

A real source-tree build/crawl is required before the final GO decision.

## Controlled expansion policy

When fully READY:

- First release type: **Brand or Series**
- Initial cap: **maximum 6 URLs**
- Prefer Priority Band 1
- No Model release yet
- No mass Guide release
- No new Local expansion

Model release remains blocked until:
- Brand/Series release has been observed,
- exact model identity is verified,
- model-specific demand and content exist.

## Commands

### Static architecture gate

```bash
node scripts/run-architecture-quality-gate.mjs
```

### Real repository build

```bash
npm run build
```

### Built-site crawl

```bash
node scripts/audit-production-build-architecture.mjs --dist=dist
```

Change `--dist` if the actual build output is different.

### Evidence file

Use a real evidence export from Batch 6 or Batch 7 readiness scoring.

Then:

```bash
node scripts/finalize-expansion-readiness.mjs   --evidence=docs/architecture/<real-evidence.csv>
```

A final `GO` is allowed only when all required gates pass.

## Production gate criteria

- build exit code 0
- 90 governed built routes represented
- 89 indexable
- sitemap = 89
- canonical duplicates = 0
- robots duplicates = 0
- candidate/virtual leaks = 0
- broken governed links = 0
- governed orphans = 0
- max crawl depth <= 4
- WebSite schema owner <= 1
- Header/Footer integration verified
- SEO head integration verified
- evidence-backed expansion candidate exists

## Why the release cap is 6

The objective is to observe:
- indexing behavior,
- cannibalization,
- crawl allocation,
- internal authority flow,
- GSC query ownership

before increasing page velocity.

The site architecture is intended to support 150–300+ URLs eventually, but expansion should occur in controlled release rounds rather than one bulk publish.
