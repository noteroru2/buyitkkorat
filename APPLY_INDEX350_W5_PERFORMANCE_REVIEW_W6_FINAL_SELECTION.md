# Apply — INDEX 350 W5 Performance Review / W6 Final Selection

This overlay adds the W5 performance-review engine and final W6 selector. It does not add URLs or change indexability.

Run:

```powershell
npm run validate:architecture
npm run validate:index350:w5:review
```

With real W5 Observation outputs that reached `ROUND6_REVIEW_ELIGIBLE`:

```powershell
npm run review:index350:w5
npm run select:index350:w6
```

Expected safe state without Canon ownership resolution:

```text
W5 PERFORMANCE REVIEW
State: W6_CANDIDATE_REVIEW_READY

W6 FINAL CANDIDATE SELECTION
Selected: 31/32
Projected indexable: 359
350 floor met: true
Canon ownership: UNRESOLVED
State: W6_SAFE_SELECTION_READY_FOR_MANUAL_APPROVAL
Automatic W6 release: false
```

Do not create `index350-canon-eos-r-ownership-resolution.json` unless a real manual query-ownership review has been completed.
