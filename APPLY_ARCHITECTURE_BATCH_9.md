# APPLY — ARCHITECTURE BATCH 9

Prerequisite: Architecture Batch 0–8.

## 1. Copy Batch 9 incremental files into the repository root

## 2. Apply Batch 9 config state

```bash
node scripts/apply-seo-index-control.mjs --dry-run
node scripts/apply-seo-index-control.mjs
```

This does not guess the real SEO layout or overwrite an existing sitemap.

## 3. Generate the audit sitemap

```bash
node scripts/generate-architecture-sitemap.mjs
```

Expected:

```text
Wrote 89 URLs -> docs/architecture/sitemap-architecture.xml
lastmod/changefreq/priority: OMITTED
```

## 4. Inspect the real SEO implementation

Identify where the site currently emits:
- canonical
- robots meta
- JSON-LD
- shared `<head>`

Then dry-run:

```bash
node scripts/apply-seo-index-control.mjs   --dry-run   --layout=src/layouts/<actual-layout>.astro   --sitemap=public/sitemap.xml
```

### Existing canonical/robots/JSON-LD found

Expected:

```text
PASS_WITH_REVIEW_REQUIRED
```

Do not stack a second SEO component. Refactor the existing implementation to use:
- `getArchitectureCanonicalPath()`
- `getArchitectureRobots()`
- `buildArchitectureSchema()`

### No existing SEO head implementation

The installer can insert:

```astro
<ArchitectureSeoControl ... />
```

into the shared `<head>` safely.

## 5. Production sitemap

If `public/sitemap.xml` does not already exist:

```bash
node scripts/generate-architecture-sitemap.mjs   --output=public/sitemap.xml
```

If an unmanaged sitemap already exists, the generator refuses to overwrite it. Compare it against the 89-URL architecture audit and merge deliberately.

## 6. Validate Batch 0–9

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/validate-internal-link-graph.mjs
node scripts/validate-cannibalization-triage.mjs
node scripts/validate-local-area-architecture.mjs
node scripts/validate-brand-model-series-foundation.mjs
node scripts/validate-guide-authority-architecture.mjs
node scripts/validate-navigation-architecture.mjs
node scripts/validate-seo-index-control.mjs   --layout=src/layouts/<actual-layout>.astro

npm run build
```

Expected Batch 9 architecture:

```text
Live routes: 90
Indexable: 89
Noindex: 1
Sitemap eligible: 89
Canonical profiles: 89
WebPage schema profiles: 89
Breadcrumb schema profiles: 88
Unreleased candidates with SEO profiles: 0
VERDICT: PASS
```

## Production QA

After deployment:

1. `/sitemap.xml` returns 200 and contains exactly 89 canonical URLs.
2. `/404` is absent from sitemap and remains noindex.
3. Candidate/virtual URLs are absent from sitemap.
4. Every indexable page has one canonical only.
5. Every indexable non-home page has one BreadcrumbList only.
6. Homepage has one WebSite owner only.
7. No duplicate LocalBusiness/Organization/FAQPage/Article schema was introduced.
8. Search Console sitemap count matches the intended indexable architecture after recrawl.
