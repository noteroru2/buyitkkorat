# INDEX 350 — W6 Production Release Gate

This overlay configures the production gate for the W6 Safe Final release.

## Expected source surface

- Live: 360
- Indexable: 359
- Noindex: 1
- Sitemap: 359
- W6: 31 = 13 Local + 18 Guide
- Remaining HOLD: `/รับซื้อ-canon-eos-r-โคราช`
- Release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W5 performance attested: `false`
- Automatic further release: `false`

## Validate and build

```powershell
npm run validate:architecture
npm run validate:index350:w6:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w6-build
```

## SHA-locked predeploy

```powershell
git add .
git diff --cached --check
git commit -m "feat(seo): release index350 w6 safe final expansion"
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w6.mjs --dist=dist --expected-sha=$sha
```

Only `VERDICT: GO` permits push/deploy.

## Production verification

```powershell
node scripts/verify-index-350-w6-production.mjs `
  --origin=https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com `
  --deployment-sha=$sha
```

Expected final state after real production verification: `PRODUCTION_VERIFIED` + `FINAL_OBSERVATION_ACTIVE`. Canon EOS R remains HOLD and is not resolved by this gate.
