# INDEX 350 — W2 Observation Gate

## Scope

This gate observes the 50 W2 Series/Model URLs after verified production release. It does not publish W3 and does not perform destructive SEO actions.

Baseline after W2:

- Live routes: 189
- Indexable routes: 188
- Noindex routes: 1
- Sitemap URLs: 188
- W2 observed URLs: 50 = 30 Series + 20 Model
- W2 release basis: `MANUAL_APPROVAL_OVERRIDE`
- W3: `LOCKED`

## Data gates

Real production verification is required before observation begins.

GSC CSV columns:

```text
date,query,page,clicks,impressions,position
```

Optional during early observation, required before W3 review eligibility:

```text
url,indexed,status,last_crawl
```

## Eligibility thresholds

- at least 7 finalized GSC days after W2 production verification
- at least 10/50 W2 URLs visible in GSC
- Series visibility at least 6/30
- Model visibility at least 4/20
- at least 40/50 W2 URLs indexed
- Series indexation at least 24/30
- Model indexation at least 16/20
- no more than 5 parent↔child ownership pairs requiring manual review

Passing these gates creates only `ROUND3_REVIEW_ELIGIBLE`. It never auto-releases W3.

## Safety

No automatic:

- merge
- redirect
- noindex
- canonical switch
- W3 release

The W2 manual approval override remains disclosed. Observation must not rewrite the release as performance-evidence-backed.

## Validate configuration

```powershell
npm run validate:architecture
npm run validate:index350:w2:observe
```

## Run real observation

First verify W2 production and obtain:

```text
State: PRODUCTION_VERIFIED
Observation: OBSERVATION_ACTIVE
```

Then export GSC query→page data and URL indexation data:

```powershell
node scripts/evaluate-index-350-w2-observation.mjs `
  --input=docs/gsc/w2-date-query-page.csv `
  --indexation=docs/gsc/w2-indexation.csv
```

Outputs:

```text
docs/architecture/index350-w2-observation-report.json
docs/architecture/index350-w2-observation-pages.csv
docs/architecture/index350-w2-query-ownership.csv
```

## State machine

```text
WAIT_FOR_PRODUCTION_VERIFICATION
→ WAIT_FOR_FINALIZED_GSC
→ HOLD_LOW_VISIBILITY
→ REVIEW_PENDING_INDEXATION
→ OWNERSHIP_REVIEW_REQUIRED
→ ROUND3_REVIEW_ELIGIBLE
```

The intermediate hold states are selected based on which evidence gate has not passed. W3 remains locked in every state until manual candidate review and explicit approval.
