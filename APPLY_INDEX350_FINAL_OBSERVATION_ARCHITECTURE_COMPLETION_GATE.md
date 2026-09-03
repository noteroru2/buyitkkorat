# INDEX 350 — Final Observation & Architecture Completion Gate

This package adds the final evidence gate only. It does **not** add or release URLs.

Source remains:
- 360 live routes
- 359 indexable routes
- 1 noindex route
- sitemap 359
- Canon EOS R model remains HOLD

## Static validation

```powershell
npm run validate:architecture
npm run validate:index350:final
```

## Final observation inputs

Real W6 production verification must exist at:
`docs/architecture/index350-w6-production-verification.json`
with `productionVerified: true` and a real `releaseDate`.

Export GSC date/query/page data and site indexation data, then run:

```powershell
node scripts/evaluate-index-350-final-observation.mjs `
  --input=docs/gsc/final-date-query-page.csv `
  --indexation=docs/gsc/final-indexation.csv
```

Objective completion eligibility requires:
- >=14 finalized days after the verified W6 release
- W6 visible >=8/31, including Local >=3/13 and Guide >=5/18
- W6 indexed >=25/31, including Local >=10/13 and Guide >=15/18
- site confirmed indexed >=350 of the 359 source-indexable URLs, with >=350 supplied indexation rows
- ownership review pairs <=3
- Canon EOS R is not confirmed indexed and remains HOLD

When state becomes `ARCHITECTURE_COMPLETION_ELIGIBLE`, copy the approval template:

```powershell
Copy-Item `
  docs/architecture/index350-final-completion-approval-template.json `
  docs/architecture/index350-final-completion-approval.json
```

Edit the copied file: set `approved` to `true`, fill `approvedBy` and `approvedAt`, and preserve both acknowledgement flags as `true`.

Then rerun:

```powershell
node scripts/evaluate-index-350-final-observation.mjs `
  --input=docs/gsc/final-date-query-page.csv `
  --indexation=docs/gsc/final-indexation.csv `
  --approval=docs/architecture/index350-final-completion-approval.json
```

Final target:

```text
State: ARCHITECTURE_COMPLETED
Site indexed: >=350/359
Canon EOS R: HOLD
Automatic further release: false
VERDICT: ARCHITECTURE_COMPLETED
```

Completion at 359 source-indexable pages is valid because the project target floor is 350. The Canon risk page is not required for completion and is never auto-released.
