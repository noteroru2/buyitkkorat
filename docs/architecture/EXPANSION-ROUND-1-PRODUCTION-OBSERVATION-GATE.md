# EXPANSION ROUND 1 — Production Release & Observation Gate

## Purpose

Move the four evidence-backed Brand/Series pages from a static release artifact into a controlled production lifecycle.

This gate does **not** deploy automatically and does **not** unlock Round 2 automatically.

## Expected production state

- Live routes: **94**
- Indexable: **93**
- Noindex: **1**
- Sitemap: **93 URLs**
- Round 1 released URLs: **4**

Released:

- `/รับซื้อโน๊ตบุ๊ค-asus-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-dell-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช`

## State machine

```text
PREDEPLOY_PENDING
        ↓
PREDEPLOY_READY
        ↓
PRODUCTION_PENDING
        ↓
PRODUCTION_VERIFIED
        ↓
OBSERVATION_ACTIVE
        ↓
WAIT_FOR_FINALIZED_GSC
        ↓
ROUND2_REVIEW_ELIGIBLE
```

Any failed route/sitemap/SEO/build check moves the release to `BLOCKED`.

## Predeploy

Run inside the real repository:

```bash
node scripts/predeploy-expansion-round-1.mjs --dist=dist
```

Optional exact-SHA gate:

```bash
node scripts/predeploy-expansion-round-1.mjs   --dist=dist   --expected-sha=<commit-sha>
```

The gate runs:
- Round 1 validator,
- Architecture static quality gate,
- real `npm run build`,
- built-output crawl,
- optional Git SHA attestation.

The overlay itself cannot satisfy the real build/crawl gate because it is not the full website source tree.

## Production verification

After deployment:

```bash
node scripts/verify-expansion-round-1-production.mjs   --origin=https://รับซื้อไอทีโคราช.com   --deployment-id=<optional-id>   --deployment-sha=<optional-sha>
```

It checks:
- HTTP 200 for all four new pages,
- self canonical,
- `index,follow`,
- no duplicate BreadcrumbList from the architecture layer,
- Notebook → ASUS/Dell,
- ASUS → ROG,
- Dell → Latitude,
- sitemap HTTP 200,
- sitemap exactly 93 URLs,
- all four new URLs in sitemap.

Production verification creates the release date used by the observation gate.

## Observation gate

Use a fresh GSC query×page export containing:

```text
date,query,page,clicks,impressions,position
```

Then:

```bash
node scripts/evaluate-expansion-round-1-observation.mjs   --input=docs/gsc/<fresh-query-page.csv>
```

Policy:
- before 7 finalized days after verified release → `WAIT_FOR_FINALIZED_GSC`
- from 7 finalized days onward → `ROUND2_REVIEW_ELIGIBLE`
- recommended extended observation: 14 days

`ROUND2_REVIEW_ELIGIBLE` means **manual review may begin**, not that Round 2 is automatically approved.

## Query ownership

Run the existing pair observer:

```bash
node scripts/evaluate-expansion-round-1-gsc.mjs   --input=docs/gsc/<query-page.csv>
```

Review:
- Notebook ↔ ASUS
- ASUS ↔ ROG
- Notebook ↔ Dell
- Dell ↔ Latitude

No automatic merge, redirect, noindex or canonical switch.

## Round 2 lock

Round 2 remains locked until:
1. predeploy real build/crawl passes,
2. production verification passes,
3. sitemap is 93,
4. new pages are internally discoverable,
5. finalized GSC date gate passes,
6. query ownership/cannibalization is manually reviewed.

No impressions/clicks may be invented merely to unlock the gate.
