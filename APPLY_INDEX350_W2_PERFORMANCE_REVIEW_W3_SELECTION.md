# INDEX 350 — W2 Performance Review & W3 Candidate Selection

## Purpose

This batch reviews **real W2 observation artifacts** and prepares a **manual-only W3 shortlist**. It does **not** create, publish, index, add to sitemap, redirect, noindex, or canonicalize any W3 page.

Current governed architecture remains:

- Live routes: **189**
- Indexable: **188**
- Noindex: **1**
- W3 target after a later approved release: **238 indexable**
- W3 cap: **50 Model pages**
- W3 automatic release: **false**

## Why W3 is still locked

The package intentionally contains **no real W2 GSC or URL Inspection metrics**. The review scripts will return `WAIT_FOR_REAL_W2_OBSERVATION_DATA` until the files produced by the W2 Observation Gate exist from real finalized data.

No performance numbers are fabricated.

## Provisional W3 composition

The static shortlist contains 50 Model candidates only, matching the master INDEX 350 plan. It is diversified across product clusters:

- Notebook: 14
- Apple: 10
- Mobile: 14
- Camera: 5
- Gaming: 7

Cluster minima used by the real selector:

- Notebook >= 12
- Apple >= 9
- Mobile >= 12
- Camera >= 5
- Gaming >= 6

The remaining slots may move between clusters if real parent health requires replacements.

## Static exclusions / reserves

Eight candidates are intentionally outside the provisional 50. Important hard blocks include:

- Sony A6000 / A6400: parent `/รับซื้อกล้อง-sony-alpha-apsc-โคราช` is not live yet.
- Canon EOS R model page: static ownership risk because its wording is unusually close to the live Canon EOS R series owner.

Other reserve candidates remain available only if real W2 parent health forces substitutions.

## Run validation

```powershell
npm run validate:architecture
npm run validate:index350:w2:review
```

Expected static result:

```text
Live/indexable/noindex: 189/188/1
Remaining model pool: 58
Provisional W3 shortlist: 50/50
W3 automatic release: false
VERDICT: PASS
```

## Run the real W2 performance review

First the W2 Observation Gate must have been run with real finalized GSC + indexation inputs and reached:

```text
ROUND3_REVIEW_ELIGIBLE
```

Then run:

```powershell
npm run review:index350:w2
npm run select:index350:w3
```

The selector will only emit real `SELECT` decisions when the review state is:

```text
W3_CANDIDATE_REVIEW_READY
```

A complete selection ends at:

```text
W3_SELECTION_READY_FOR_MANUAL_APPROVAL
Selected: 50/50
Automatic W3 release: false
```

## Hard rules

- No invented GSC or indexation metrics.
- No automatic W3 release.
- Candidate parent must already be live.
- A W2 parent must be indexed before its child Model can be selected.
- A W2 parent implicated in query-ownership review blocks its child candidate.
- Static ownership-risk candidates remain blocked pending manual review.
- No automatic merge, redirect, noindex, or canonical change.
