# INDEX 350 — W2 Production Release Gate

This gate does **not** add new routes. It governs the 50 W2 Series/Model pages already released in source.

## Expected production surface

- Live: 189
- Indexable: 188
- Noindex: 1
- Sitemap: 188
- W2 URLs: 50 (30 Series + 20 Model)
- Release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W1 performance attested: `false`
- W3: `LOCKED`

## Local validation

```powershell
npm run validate:architecture
npm run validate:index350:w2:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w2-build
```

Expected built surface:

```text
Built governed pages: 189/189
Unreachable indexable: 0
Broken governed links: 0
Max observed crawl depth: <= 4

W2 built pages: 50/50
Sitemap URLs: 188/188
Minimum observed W2 inbound paths: >= 2
Errors: 0
VERDICT: PASS
```

## Commit and SHA-locked predeploy

```powershell
git add .
git diff --cached --check
git commit -m "feat(seo): release index350 w2 series model expansion"
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w2.mjs --dist=dist --expected-sha=$sha
```

Do not push unless the predeploy result is `VERDICT: GO` and `Expected SHA match: YES`.

## Production verification

After the production deployment is Ready:

```powershell
node scripts/verify-index-350-w2-production.mjs `
  --origin=https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com `
  --deployment-sha=$sha
```

Production verification requires all 50 W2 URLs to return 200 with one self-canonical, one index/follow robots tag, one H1, at least two images with alt text, at least one LINE CTA, at most one BreadcrumbList, inclusion in the 188-URL sitemap, and at least two internal inbound discovery paths.

A PASS starts W2 observation only. It does **not** unlock W3.
