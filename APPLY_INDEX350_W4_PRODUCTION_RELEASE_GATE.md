# INDEX 350 — W4 Production Release Gate

This gate does **not** add new routes. It governs the 50 W4 pages already released in source.

## Expected production surface

- Live: 289
- Indexable: 288
- Noindex: 1
- Sitemap: 288
- W4 URLs: 50
- Composition: 18 Series + 7 Model + 25 Condition
- Parent groups: 30
- Release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W3 performance attested: `false`
- W5: `LOCKED`

## Local validation

```powershell
npm run validate:architecture
npm run validate:index350:w4:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w4-build
```

Expected built surface:

```text
Built governed pages: 289/289
Unreachable indexable: 0
Broken governed links: 0
Max observed crawl depth: <= 4

W4 built pages: 50/50
Sitemap URLs: 288/288
Minimum observed W4 inbound paths: >= 2
Errors: 0
VERDICT: PASS
```

## Commit and SHA-locked predeploy

```powershell
git add .
git diff --cached --check
git commit -m "feat(seo): release index350 w4 series model condition expansion"
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w4.mjs --dist=dist --expected-sha=$sha
```

Do not push unless predeploy returns `VERDICT: GO` and `Expected SHA match: YES`.

## Production verification

After deployment is Ready:

```powershell
node scripts/verify-index-350-w4-production.mjs `
  --origin=https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com `
  --deployment-sha=$sha
```

A PASS starts W4 observation only. It does **not** unlock W5.
