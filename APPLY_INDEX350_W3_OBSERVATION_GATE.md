# INDEX 350 — W3 Observation Gate

## Scope

This gate observes the 50 W3 Model URLs after verified production release. It does not publish W4 and does not perform destructive SEO actions.

Baseline after W3:

- Live routes: 239
- Indexable routes: 238
- Noindex routes: 1
- Sitemap URLs: 238
- W3 observed URLs: 50 Model pages
- Cluster mix: Notebook 14 / Apple 10 / Mobile 14 / Camera 5 / Gaming 7
- W3 release basis: `MANUAL_APPROVAL_OVERRIDE`
- W4: `LOCKED`

## Data gates

Real production verification is required before observation begins.

GSC CSV columns:

```text
date,query,page,clicks,impressions,position
```

Optional during early observation, required before W4 review eligibility:

```text
url,indexed,status,last_crawl
```

## Eligibility thresholds

- at least 7 finalized GSC days after W3 production verification
- at least 10/50 W3 Model URLs visible in GSC
- visibility must be distributed: Notebook >=3, Apple >=2, Mobile >=3, Camera >=1, Gaming >=1
- at least 40/50 W3 URLs indexed
- indexation must be distributed: Notebook >=11, Apple >=8, Mobile >=11, Camera >=4, Gaming >=6
- no more than 5 Parent↔Model ownership pairs requiring manual review

Passing these gates creates only `ROUND4_REVIEW_ELIGIBLE`. It never auto-releases W4.

## Safety

No automatic:

- merge
- redirect
- noindex
- canonical switch
- W4 release

The W3 manual approval override remains disclosed. Observation must not rewrite the release as performance-evidence-backed.

## Validate configuration

```powershell
npm run validate:architecture
npm run validate:index350:w3:observe
```

## Run real observation

First verify W3 production and obtain:

```text
State: PRODUCTION_VERIFIED
Observation: OBSERVATION_ACTIVE
```

Then export GSC query→page data and URL indexation data:

```powershell
node scripts/evaluate-index-350-w3-observation.mjs `
  --input=docs/gsc/w3-date-query-page.csv `
  --indexation=docs/gsc/w3-indexation.csv
```

Outputs:

```text
docs/architecture/index350-w3-observation-report.json
docs/architecture/index350-w3-observation-pages.csv
docs/architecture/index350-w3-query-ownership.csv
```

## State machine

```text
WAIT_FOR_PRODUCTION_VERIFICATION
→ WAIT_FOR_FINALIZED_GSC
→ HOLD_LOW_VISIBILITY
→ REVIEW_PENDING_INDEXATION
→ OWNERSHIP_REVIEW_REQUIRED
→ ROUND4_REVIEW_ELIGIBLE
```

The intermediate hold states are selected based on which evidence gate has not passed. W4 remains locked in every state until manual candidate review and explicit approval.
