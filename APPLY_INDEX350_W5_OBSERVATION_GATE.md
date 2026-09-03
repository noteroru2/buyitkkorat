# INDEX 350 — W5 Observation Gate

## Scope

This gate observes the 40 W5 URLs after verified production release. It does not publish W6 and does not perform destructive SEO actions.

Baseline after W5:

- Live routes: 329
- Indexable routes: 328
- Noindex routes: 1
- Sitemap URLs: 328
- W5 observed URLs: 40
- Type mix: Condition 5 / B2B 20 / Local 15
- Cluster mix: Notebook 1 / Mobile 2 / Camera 1 / Gaming 1 / B2B 20 / Location 15
- W5 release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W4 performance attested: `false`
- W6: `LOCKED`

## Data gates

Real W5 production verification is required before observation begins.

GSC CSV columns:

```text
date,query,page,clicks,impressions,position
```

Optional during early observation, required before W6 review eligibility:

```text
url,indexed,status,last_crawl
```

## Eligibility thresholds

- at least 7 finalized GSC days after W5 production verification
- at least 10/40 W5 URLs visible in GSC
- visibility type spread: Condition >=1, B2B >=5, Local >=4
- B2B visibility >=5/20 and Local visibility >=4/15
- at least 2 of 4 Condition subclusters visible: Notebook / Mobile / Camera / Gaming
- at least 32/40 W5 URLs indexed
- indexation type spread: Condition >=4, B2B >=16, Local >=12
- B2B indexed >=16/20 and Local indexed >=12/15
- at least 3 of 4 Condition subclusters represented among indexed W5 pages
- no more than 4 Parent↔Child ownership pairs requiring manual review

Passing these gates creates only `ROUND6_REVIEW_ELIGIBLE`. It never auto-releases W6.

## Local safety

W5 local pages are service-area pages only. This gate preserves the W5 rules forbidding fake branches, fake addresses, fake opening hours, fake coordinates, and fake LocalBusiness entities.

## Validate configuration

```powershell
npm run validate:architecture
npm run validate:index350:w5:observe
```

## Run real observation

First verify W5 production and obtain:

```text
State: PRODUCTION_VERIFIED
Observation: OBSERVATION_ACTIVE
```

Then export GSC query→page and indexation data:

```powershell
node scripts/evaluate-index-350-w5-observation.mjs `
  --input=docs/gsc/w5-date-query-page.csv `
  --indexation=docs/gsc/w5-indexation.csv
```

Outputs:

```text
docs/architecture/index350-w5-observation-report.json
docs/architecture/index350-w5-observation-pages.csv
docs/architecture/index350-w5-query-ownership.csv
```

## State machine

```text
WAIT_FOR_PRODUCTION_VERIFICATION
→ WAIT_FOR_FINALIZED_GSC
→ HOLD_LOW_VISIBILITY
→ REVIEW_PENDING_INDEXATION
→ OWNERSHIP_REVIEW_REQUIRED
→ ROUND6_REVIEW_ELIGIBLE
```

W6 remains locked in every state until manual performance review, final candidate selection, and explicit approval.
