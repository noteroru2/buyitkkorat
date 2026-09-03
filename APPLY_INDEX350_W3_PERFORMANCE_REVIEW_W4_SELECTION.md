# INDEX 350 — W3 Performance Review & W4 Candidate Selection

This batch does **not** publish W4 pages. It only reviews real W3 observation outputs and selects a manual-review shortlist from the 56 remaining W4-focus candidates.

## Baseline
- Live: 239
- Indexable: 238
- Noindex: 1
- W4 target after a future source release: 288 indexable
- W4 automatic release: false

## Candidate pool
- B_SERIES: 18
- C_MODEL: 8
- D_CONDITION: 30
- Total: 56

Provisional shortlist: 50 = 18 Series + 7 non-risk Model + 25 Condition. Six candidates remain reserve/blocked. `/รับซื้อ-canon-eos-r-โคราช` is blocked for static ownership review. Sony A6000/A6400 are allowed only when their same-wave parent `/รับซื้อกล้อง-sony-alpha-apsc-โคราช` is selected first.

## Real-data workflow
```powershell
npm run validate:index350:w3:review
npm run review:index350:w3
npm run select:index350:w4
```

Without real W3 Observation outputs the correct result is `WAIT_FOR_REAL_W3_OBSERVATION_DATA` and `Selected: 0/50`.

A real W3 observation must first reach `ROUND4_REVIEW_ELIGIBLE`. Even then, `W4_SELECTION_READY_FOR_MANUAL_APPROVAL` is **not** a publish command. Manual approval and a separate W4 source-release batch are still required.
