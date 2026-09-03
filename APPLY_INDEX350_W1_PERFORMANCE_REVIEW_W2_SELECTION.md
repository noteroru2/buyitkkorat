# APPLY — INDEX 350 W1 PERFORMANCE REVIEW & W2 CANDIDATE SELECTION

## 1. Validate static selection policy

```powershell
npm run validate:index350:w1:review
```

## 2. Run W1 Observation with real finalized data first

```powershell
node scripts/evaluate-index-350-w1-observation.mjs `
  --input=docs/gsc/w1-date-query-page.csv `
  --indexation=docs/gsc/w1-indexation.csv
```

Do not continue unless the report reaches:

```text
ROUND2_REVIEW_ELIGIBLE
```

## 3. Review W1 performance

```powershell
npm run review:index350:w1
```

Expected:

```text
State: W2_CANDIDATE_REVIEW_READY
VERDICT: REVIEW_READY
```

## 4. Select W2 candidates

```powershell
npm run select:index350:w2
```

Expected only when real W1 gates pass:

```text
Selected: 50/50
Series selected: 30/30
Model selected: 20/20
State: W2_SELECTION_READY_FOR_MANUAL_APPROVAL
Automatic release: false
VERDICT: SELECTION_READY
```

## 5. Stop

Do not create or publish W2 pages in this batch. Review the output CSV/JSON manually before starting a separate W2 Source Release batch.
