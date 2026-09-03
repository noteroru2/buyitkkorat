# INDEX 350 — W5 Production Release Gate

This gate does **not** add new routes. It governs the 40 W5 pages already released in source.

## Expected production surface

- Live: 329
- Indexable: 328
- Noindex: 1
- Sitemap: 328
- W5 URLs: 40
- Composition: 5 Condition + 20 B2B + 15 Local
- Parent groups: 7
- Release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W4 performance attested: `false`
- W6: `LOCKED`

## Local validation

```powershell
npm run validate:architecture
npm run validate:index350:w5:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w5-build
```

Expected built surface:

```text
Built governed pages: 329/329
Unreachable indexable: 0
Broken governed links: 0
Max observed crawl depth: <= 4

W5 built pages: 40/40
Sitemap URLs: 328/328
Minimum observed W5 inbound paths: >= 2
Errors: 0
VERDICT: PASS
```

## Commit and SHA-locked predeploy

```powershell
git add .
git diff --cached --check
git commit -m "feat(seo): release index350 w5 condition b2b local expansion"
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w5.mjs --dist=dist --expected-sha=$sha
```

Do not push unless predeploy returns `VERDICT: GO` and `Expected SHA match: YES`.

## Production verification

After deployment is Ready:

```powershell
node scripts/verify-index-350-w5-production.mjs `
  --origin=https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com `
  --deployment-sha=$sha
```

A PASS starts W5 observation only. It does **not** unlock W6.
