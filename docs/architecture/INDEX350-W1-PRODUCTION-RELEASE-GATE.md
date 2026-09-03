# INDEX 350 EXPANSION — W1 Production Release Gate

## Scope

Production gate for the 40 W1 Brand/Series URLs. No new route is added by this gate.

Expected state:

- Live: **139**
- Indexable: **138**
- Noindex: **1**
- Sitemap: **138**
- W1 release: **40**
- W2: **LOCKED**

## Per-page W1 production requirements

Every W1 page must have:

- HTTP 200
- exactly one self-canonical
- exactly one `index,follow` robots meta
- exactly one H1
- at least two rendered images
- at least one visible LINE destination link
- no duplicate BreadcrumbList from the governed layer
- inclusion in production sitemap
- at least two inbound discovery sources in the inspected W1 parent/sibling graph

## Predeploy

Run after W1 source is applied to the real Git repository:

```powershell
npm run validate:architecture
npm run validate:index350:w1:prod
npm run predeploy:index350:w1
```

For the strict commit gate, commit first and run:

```powershell
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w1.mjs --dist=dist --expected-sha=$sha
```

GO requires:

```text
State: PREDEPLOY_READY
Production release allowed: true
Static validation: PASS
Build: PASS
Architecture crawl: PASS
W1 built surface: PASS
W2: LOCKED
Blockers: NONE
VERDICT: GO
```

The predeploy command builds again deliberately. It attests the exact source/commit immediately before release.

## Production verification

After deployment is Ready:

```powershell
node scripts/verify-index-350-w1-production.mjs `
  --origin=https://รับซื้อไอทีโคราช.com `
  --deployment-sha=<SHA>
```

Expected:

```text
W1 routes passed: 40/40
Parent groups passed: 10/10
Minimum W1 inbound paths: >=2
Sitemap: 138/138 — PASS
State: PRODUCTION_VERIFIED
Observation: OBSERVATION_ACTIVE
W2: LOCKED
VERDICT: PASS
```

## After production verification

Do not release W2. Production verification only starts the W1 observation period.

Observe at least 7 finalized GSC days (14 days preferred), then review:

- W1 indexing coverage
- impressions/clicks by W1 page
- Brand ↔ Series query ownership
- parent ↔ child cannibalization
- candidates for W2

No automatic merge, redirect, noindex, canonical switch, or W2 publication is permitted.
