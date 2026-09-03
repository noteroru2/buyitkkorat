# INDEX 350 — W3 Production Release Gate

This gate does **not** add new routes. It governs the 50 W3 Model pages already released in source.

## Expected production surface

- Live: 239
- Indexable: 238
- Noindex: 1
- Sitemap: 238
- W3 URLs: 50 Model pages
- Parent groups: 32
- Release basis: `MANUAL_APPROVAL_OVERRIDE`
- Real W2 performance attested: `false`
- W4: `LOCKED`

## Local validation

```powershell
npm run validate:architecture
npm run validate:index350:w3:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w3-build
```

Expected built surface:

```text
Built governed pages: 239/239
Unreachable indexable: 0
Broken governed links: 0
Max observed crawl depth: <= 4

W3 built pages: 50/50
Sitemap URLs: 238/238
Minimum observed W3 inbound paths: >= 2
Errors: 0
VERDICT: PASS
```

## Commit and SHA-locked predeploy

```powershell
git add .
git diff --cached --check
git commit -m "feat(seo): release index350 w3 model expansion"
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w3.mjs --dist=dist --expected-sha=$sha
```

Do not push unless the predeploy result is `VERDICT: GO` and `Expected SHA match: YES`.

## Production verification

After the production deployment is Ready:

```powershell
node scripts/verify-index-350-w3-production.mjs `
  --origin=https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com `
  --deployment-sha=$sha
```

Production verification requires all 50 W3 URLs to return 200 with one self-canonical, one index/follow robots tag, one H1, at least two images with non-empty alt text, at least one LINE CTA, at most one BreadcrumbList, inclusion in the 238-URL sitemap, and at least two internal inbound discovery paths. Parent→Model discovery is verified for all 32 parent groups.

A PASS starts W3 observation only. It does **not** unlock W4.
