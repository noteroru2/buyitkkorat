# ARCHITECTURE BATCH 4 — Cannibalization & URL Ownership Triage

## Objective

Convert the known overlap/cannibalization risk into an explicit, reviewable ownership matrix without making destructive SEO changes.

## Baseline

- Live routes: **89**
- Indexable routes: **88**
- Triage groups: **16**
- GSC-gated groups: **13**
- Merge candidates executed: **0**
- Redirect candidates executed: **0**
- Automatic execution: **OFF**

## Decision vocabulary

- `KEEP` — intents are structurally distinct; keep separate.
- `DIFFERENTIATE` — keep both/all URLs, but enforce a distinct primary intent/content contract.
- `HOLD_GSC` — do not consolidate until query→page evidence exists.
- `MERGE_CANDIDATE` — may be considered only after evidence + manual approval.
- `REDIRECT_CANDIDATE` — may be considered only after evidence + manual approval.

Batch 4 intentionally proposes **no destructive candidate for immediate execution** because the current artifact set does not include a fresh GSC query→page export.

## Highest-risk groups

1. Generic IT vs vertical money hubs.
2. Computer generic vs desktop/build/gaming/old/workstation.
3. Notebook generic/broken/specific-condition pages.
4. Mobile generic vs Android/condition.
5. Apple device pages vs old mobile ownership.
6. Tablet vs iPad.
7. Bulk/company/office liquidation pages.
8. Local-area pages.
9. Informational articles that can drift toward transactional money-page intent.

## GSC gate

Run:

```bash
node scripts/evaluate-cannibalization-gsc.mjs --input=docs/gsc/query-page.csv
```

Input columns must be:

```text
query,page,clicks,impressions,position
```

The evaluator outputs pair-level overlap evidence only. It **never** modifies redirects, canonicals, robots, sitemap or indexation.

## Destructive-change gate

Before a future MERGE/REDIRECT/NOINDEX decision, require all of:

1. Fresh GSC query→page evidence covering both URLs.
2. Manual review of shared queries and unique query sets.
3. Confirmation that the proposed survivor matches the primary intent.
4. Confirmation that useful unique content can be preserved.
5. Redirect/canonical/internal-link/sitemap migration plan.
6. Post-release index and ranking observation plan.

## Safety invariants

Batch 4 does not change:

- URL/slug
- canonical
- robots/noindex
- sitemap
- redirect
- content body
- runtime breadcrumb ownership
- runtime related/discovery graph

It adds only triage policy, evidence tooling, validation and documentation.
