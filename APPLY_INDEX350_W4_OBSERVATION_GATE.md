# INDEX 350 — W4 Observation Gate

## Scope

This gate observes the 50 W4 URLs after verified production release. It does not publish W5 and does not perform destructive SEO actions.

Baseline after W4:

- Live routes: 289
- Indexable routes: 288
- Noindex routes: 1
- Sitemap URLs: 288
- W4 observed URLs: 50
- Type mix: Series 18 / Model 7 / Condition 25
- Cluster mix: Mobile 20 / Camera 9 / Notebook 9 / Apple 3 / Computer 6 / Gaming 3
- W4 release basis: `MANUAL_APPROVAL_OVERRIDE`
- W5: `LOCKED`

## Data gates

Real production verification is required before observation begins.

GSC CSV columns:

```text
date,query,page,clicks,impressions,position
```

Optional during early observation, required before W5 review eligibility:

```text
url,indexed,status,last_crawl
```

## Eligibility thresholds

- at least 7 finalized GSC days after W4 production verification
- at least 12/50 W4 URLs visible in GSC
- visibility type spread: Series >=4, Model >=2, Condition >=5
- visibility cluster spread: Mobile >=3, Camera >=2, Notebook >=2, Apple >=1, Computer >=1, Gaming >=1
- at least 40/50 W4 URLs indexed
- indexation type spread: Series >=14, Model >=6, Condition >=20
- indexation cluster spread: Mobile >=16, Camera >=7, Notebook >=7, Apple >=2, Computer >=5, Gaming >=2
- no more than 5 Parent↔Child ownership pairs requiring manual review

Passing these gates creates only `ROUND5_REVIEW_ELIGIBLE`. It never auto-releases W5.

## Safety

No automatic merge, redirect, noindex, canonical switch, or W5 release. Similarity alone is never a destructive-action trigger. The W4 manual approval override remains disclosed.

## Validate configuration

```powershell
npm run validate:architecture
npm run validate:index350:w4:observe
```

## Run real observation

First verify W4 production and obtain:

```text
State: PRODUCTION_VERIFIED
Observation: OBSERVATION_ACTIVE
```

Then export GSC query→page and indexation data:

```powershell
node scripts/evaluate-index-350-w4-observation.mjs `
  --input=docs/gsc/w4-date-query-page.csv `
  --indexation=docs/gsc/w4-indexation.csv
```

Outputs:

```text
docs/architecture/index350-w4-observation-report.json
docs/architecture/index350-w4-observation-pages.csv
docs/architecture/index350-w4-query-ownership.csv
```

## State machine

```text
WAIT_FOR_PRODUCTION_VERIFICATION
→ WAIT_FOR_FINALIZED_GSC
→ HOLD_LOW_VISIBILITY
→ REVIEW_PENDING_INDEXATION
→ OWNERSHIP_REVIEW_REQUIRED
→ ROUND5_REVIEW_ELIGIBLE
```

W5 remains locked in every state until manual performance review, candidate selection, and explicit approval.
