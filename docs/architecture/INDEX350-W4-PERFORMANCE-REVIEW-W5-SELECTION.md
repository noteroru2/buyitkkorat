# INDEX 350 — W4 Performance Review & W5 Candidate Selection

## Scope

This batch **does not add or publish URLs**. Current governed surface remains **289 live / 288 indexable / 1 noindex**.

W4 Performance Review only becomes real when the W4 Observation outputs exist and report `ROUND5_REVIEW_ELIGIBLE`. Until then the packaged state is `WAIT_FOR_REAL_W4_OBSERVATION_DATA` and W5 selection emits **0/40 SELECT**.

## W5 Candidate Pool

- D_CONDITION: 5
- E_B2B: 20
- F_LOCAL: 28
- Total W5-focus pool: 53

Provisional controlled W5 composition: **5 Condition + 20 B2B + 15 Local = 40**.

The 15 Local candidates are district-first. No page may claim a physical Korat branch, fabricated address, fabricated opening hours, reviews, ratings, or coordinates.

## Deferred final wave

After a hypothetical W5 release, 32 HOLD routes remain: 13 Local + 18 Guide + 1 Canon EOS R model. The Canon model remains blocked for manual query-ownership review. If it is not resolved and no replacement route is qualified, the safe projected ceiling is **359 indexable**, still above the 350 floor but one URL below the planned 360 buffer.

## Commands

```powershell
npm run validate:architecture
npm run validate:index350:w4:review

# only after real W4 observation outputs exist:
npm run review:index350:w4
npm run select:index350:w5
```

Required state before source release work may begin:

```text
W4 Performance Review: W5_CANDIDATE_REVIEW_READY
W5 Candidate Selection: W5_SELECTION_READY_FOR_MANUAL_APPROVAL
Selected: 40/40
Automatic release: false
```

No merge, redirect, noindex, canonical switch, or W5 publishing is performed by this batch.
