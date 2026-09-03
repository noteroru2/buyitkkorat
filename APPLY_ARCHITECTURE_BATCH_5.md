# APPLY — ARCHITECTURE BATCH 5

## What this release changes

- Adds one real route: `/พื้นที่`
- Releases `/พื้นที่` as the local authority hub
- Reparents all 11 existing LOCATION routes to `/พื้นที่` in runtime architecture
- Changes homepage local discovery seed from `/พื้นที่/เมืองนครราชสีมา` to `/พื้นที่`
- Adds bounded related-area graph
- Updates Batch 0–4 validators for the intentional 89→90 route release

## What it does NOT change

- Existing location slugs
- Existing location canonical URLs
- Existing location index state
- Redirects
- Apple virtual hub
- Content expansion to new districts

## Validate

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
node scripts/validate-local-area-architecture.mjs
npm run build
```

Expected Batch 5 core result:

```text
Live routes: 90
Indexable: 89
Local authority hub: LIVE
Released local children: 11
Virtual local hub remaining: false
Homepage local seed: /พื้นที่
Local routes projected inbound<2: 0
VERDICT: PASS
```

## Production checks

After build/deploy verify:

1. `/พื้นที่` returns 200.
2. canonical is `/พื้นที่`.
3. robots is index,follow.
4. `/พื้นที่` links to all 11 released area pages.
5. Every area breadcrumb is `Home → พื้นที่ → Current`.
6. Homepage links to `/พื้นที่`.
7. Sitemap has exactly +1 indexable URL versus the pre-Batch-5 baseline.
