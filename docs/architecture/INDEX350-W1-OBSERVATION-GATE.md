# INDEX 350 — W1 Observation Gate

## Goal
Observe the 40 W1 Brand/Series URLs after production release without automatically opening W2.

## Inputs
Production verification report:

```text
docs/architecture/index350-w1-production-verification.json
```

Fresh GSC query×page export with:

```text
date,query,page,clicks,impressions,position
```

Optional but required for final W2 review eligibility: URL Inspection/indexation CSV:

```text
url,indexed,status,last_crawl
```

## Gates
- production must already be verified
- at least 7 finalized GSC days after release
- at least 8/40 W1 pages with impressions
- at least 32/40 W1 pages confirmed indexed
- no more than 4 parent↔child ownership-review flags

Passing these gates only creates `ROUND2_REVIEW_ELIGIBLE`. It never auto-releases W2.

## Run

```bash
npm run validate:index350:w1:observe
node scripts/evaluate-index-350-w1-observation.mjs \
  --input=docs/gsc/w1-date-query-page.csv \
  --indexation=docs/gsc/w1-indexation.csv
```

Outputs:
- `docs/architecture/index350-w1-observation-report.json`
- `docs/architecture/index350-w1-observation-pages.csv`
- `docs/architecture/index350-w1-query-ownership.csv`

## State meanings
- `WAIT_FOR_FINALIZED_GSC`: date gate not reached
- `HOLD_LOW_VISIBILITY`: fewer than 8 W1 pages have impressions
- `REVIEW_PENDING_INDEXATION`: visibility is acceptable but indexation evidence is missing/below 80%
- `OWNERSHIP_REVIEW_REQUIRED`: too many parent/child pairs share meaningful queries
- `ROUND2_REVIEW_ELIGIBLE`: manual W2 review may begin

## Hard safety rule
No merge, redirect, noindex, canonical switch, or W2 publishing is executed automatically.
