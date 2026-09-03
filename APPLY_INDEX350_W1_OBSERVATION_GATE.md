# APPLY — INDEX 350 W1 OBSERVATION GATE

1. Apply files after W1 Production Gate.
2. Validate:

```powershell
npm run validate:index350:w1:observe
```

3. Confirm production report exists and is `PRODUCTION_VERIFIED`.
4. Export fresh GSC query×page data with `date,query,page,clicks,impressions,position`.
5. Export URL Inspection/indexation data if available with `url,indexed,status,last_crawl`.
6. Run:

```powershell
node scripts/evaluate-index-350-w1-observation.mjs `
  --input=docs/gsc/w1-date-query-page.csv `
  --indexation=docs/gsc/w1-indexation.csv
```

Do not start W2 unless the output reaches `ROUND2_REVIEW_ELIGIBLE`, then perform manual W2 candidate review.
