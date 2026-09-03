# INDEX 350 — W1 Performance Review & W2 Candidate Selection

## Purpose

Review the real W1 observation result and prepare the next 50-page wave without publishing any W2 route.

Current production architecture remains:

- Live: **139**
- Indexable: **138**
- Noindex: **1**
- W1 released: **40**
- W2 target after a later release: **188 indexable**

## Important state

This package contains **no real W1 GSC performance export**. Therefore the current decision is:

```text
WAIT_FOR_REAL_W1_OBSERVATION_DATA
```

No clicks, impressions, position, indexation or cannibalization metrics are invented.

## W2 provisional mix

The static shortlist contains **50 non-live candidates**:

- Series: **30**
- Model: **20**

The list is provisional. Real W1 performance can reorder or HOLD candidates before manual approval.

## Performance review

Run only after W1 Observation Gate has produced:

```text
docs/architecture/index350-w1-observation-report.json
docs/architecture/index350-w1-observation-pages.csv
docs/architecture/index350-w1-query-ownership.csv
```

Then:

```bash
npm run review:index350:w1
```

Page classes:

- `EARLY_SIGNAL`
- `VISIBLE`
- `INDEXED_NO_VISIBILITY`
- `NOT_INDEXED`
- `OWNERSHIP_RISK`

The review does not modify canonical, robots, sitemap or source routes.

## W2 selection

After the performance report is ready:

```bash
npm run select:index350:w2
```

Final `SELECT` decisions are emitted only when the source W1 observation state was:

```text
ROUND2_REVIEW_ELIGIBLE
```

Otherwise every W2 candidate remains `PROVISIONAL_ONLY` / HOLD.

## Candidate scoring

Static factors:

- P1 priority
- live parent
- Series/Model W2 fit
- provisional commercial preference

W1-derived factors when the parent was a W1 page:

- parent indexed
- parent visible in GSC
- parent ownership clear

Blocking factors:

- W1 parent not indexed
- W1 parent flagged for ownership review
- parent not LIVE

## Hard rules

- no automatic W2 publishing
- no automatic merge
- no automatic redirect
- no automatic noindex
- no canonical switch
- no Brand×District / Series×District / Model×District expansion
- this batch adds **zero live/indexable routes**

## Expected real-data flow

```text
W1 PRODUCTION VERIFIED
        ↓
W1 OBSERVATION
        ↓
ROUND2_REVIEW_ELIGIBLE
        ↓
W1 PERFORMANCE REVIEW
        ↓
W2 CANDIDATE SELECTION
        ↓
MANUAL APPROVAL
        ↓
W2 SOURCE RELEASE (separate batch)
```
