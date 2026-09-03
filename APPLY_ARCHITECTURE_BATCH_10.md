# APPLY — ARCHITECTURE BATCH 10

Prerequisite: Architecture Batch 0–9.

## 1. Copy Batch 10 files into the repository

## 2. Run static gate

```bash
node scripts/validate-architecture-quality-gate.mjs
node scripts/run-architecture-quality-gate.mjs
```

Expected in an overlay:

```text
Static architecture gate: PASS
Production integration gate: UNATTESTED_IN_OVERLAY
Expansion decision: CONDITIONALLY_READY
VERDICT: PASS_WITH_PRODUCTION_ATTESTATION_REQUIRED
```

This is intentional. Do not declare production GO from the overlay alone.

## 3. Complete Batch 8 and 9 real layout integration

Validate the actual shared layout:

```bash
node scripts/validate-navigation-architecture.mjs   --layout=src/layouts/<actual-layout>.astro

node scripts/validate-seo-index-control.mjs   --layout=src/layouts/<actual-layout>.astro
```

## 4. Build the real repository

```bash
npm run build
```

## 5. Crawl the built output

For Astro static build:

```bash
node scripts/audit-production-build-architecture.mjs --dist=dist
```

Expected GO-quality result:

```text
Built governed pages: 90/90
Unreachable indexable: 0
Broken governed links: 0
Max observed crawl depth: <=4
Pages beyond depth policy: 0
Errors: 0
VERDICT: PASS
```

## 6. Provide real expansion evidence

Use a real evidence CSV from Batch 6/7 scoring. Do not fabricate GSC impressions, leads, transactions or demand.

## 7. Finalize expansion decision

```bash
node scripts/finalize-expansion-readiness.mjs   --evidence=docs/architecture/<real-evidence.csv>
```

Only this state unlocks release:

```text
READY_FOR_CONTROLLED_RELEASE
Score: 100/100
VERDICT: GO
```

## Controlled Release Round 1

When GO:
- maximum 6 new URLs,
- Priority Band 1,
- Brand/Series first,
- no Model pages,
- no mass Guide pages,
- no Local expansion.

After release, observe GSC/index/cannibalization before Round 2.
