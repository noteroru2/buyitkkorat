# APPLY — EXPANSION ROUND 1 PRODUCTION RELEASE & OBSERVATION GATE

Prerequisite: Expansion Release Round 1 applied to the real repository.

## A. Validate gate files

```bash
node scripts/validate-expansion-round-1-production-gate.mjs
```

## B. Predeploy gate

```bash
node scripts/predeploy-expansion-round-1.mjs --dist=dist
```

Do not deploy unless:

```text
State: PREDEPLOY_READY
Production release allowed: true
Build: PASS
Crawl: PASS
Blockers: NONE
VERDICT: GO
```

## C. Deploy through the repository's normal production workflow

This package does not perform deployment automatically.

Record the deployment ID/SHA if available.

## D. Verify production

```bash
node scripts/verify-expansion-round-1-production.mjs   --origin=https://รับซื้อไอทีโคราช.com   --deployment-id=<id>   --deployment-sha=<sha>
```

Required:

```text
Released routes passed: 4/4
Parent-child checks passed: 3/3
Sitemap: 93/93 — PASS
State: PRODUCTION_VERIFIED
VERDICT: PASS
```

## E. Start observation

When fresh finalized GSC query×page data exists:

```bash
node scripts/evaluate-expansion-round-1-observation.mjs   --input=docs/gsc/<date-query-page.csv>
```

Before the date gate:

```text
VERDICT: WAIT_FOR_MORE_DATA
Round 2: LOCKED
```

After at least 7 finalized days:

```text
VERDICT: REVIEW_ELIGIBLE
Round 2: MANUAL_REVIEW_ELIGIBLE
```

Then run:

```bash
node scripts/evaluate-expansion-round-1-gsc.mjs   --input=docs/gsc/<query-page.csv>
```

Review ownership manually before proposing Round 2.

## Hard rule

Do not start Round 2 solely because seven days elapsed. The date gate only permits review; it does not approve another release.
