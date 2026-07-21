# Batch 2.2.1 — Release and Production Validation

วันที่ตรวจ: 2026-07-19 (Asia/Bangkok)

## Final verdict

**PASS WITH WARNING** — Content hygiene defects ถูกแก้ครบและ Production validation ผ่านทั้งหมด ไม่มี rollback condition แต่ภาพหลักฐานเป็น local production-like screenshots เนื่องจาก Production screenshot backend timeout และยังไม่มี field data จาก Google Search Console

## Release identity

- Repository: `noteroru2/buyitkkorat`
- Safety branch: `batch-2-2-1-content-hygiene`
- Report commit: `af80200fcdaef4597ba13376e517866bbdd05af9`
- Content hotfix / final main SHA: `51f458967f9a43bb98598b9e1433244930791491`
- Deployment ID: `dpl_smiwGKMtF9P1EB4fqype8QJ3FqBH`
- Deployment URL: `https://buyitkorat-og0785alz-amphons-projects-bb1ec3bf.vercel.app`
- Production URL: `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/`
- Vercel status: `Ready` / GitHub commit status: `success`
- Rollback deployment: `dpl_7kvRmbHuT8GwiZv2YZ2vgXZrMRMY`
- Rollback URL: `https://buyitkorat-c69logwsi-amphons-projects-bb1ec3bf.vercel.app`

## Content defects and fixes

- Baseline automated scan found 226 source findings and 898 rendered duplicate/injection findings.
- Corrected homepage copy: `แล้ววนัดตามพื้นที่`, `ขายเครื่องเครื่องเดียว`, and `จอmonitor`.
- Corrected `รุ่นที่คึ้น`, unnatural title/keyword insertion, and English `onsite` wording across the affected service content.
- Replaced 155 defective or keyword-injected phrases with natural Thai copy.
- Removed 137 duplicate content blocks in the first cleanup pass and 227 remaining duplicate lines in the BOM-aware pass.
- Source content changed on 55 pages/files (homepage plus 54 service pages); fixes were mechanical hygiene changes, not a strategic rewrite.
- URLs, titles, descriptions, H1s, canonicals, search intent, CTA, schema strategy, and location-page strategy were unchanged.
- Added duplicate paragraph/sequence and keyword-injection regression checks. Updated frontmatter parsing to handle UTF-8 BOM.

## Local release gate

- `npm run build`: PASS — 89 static routes and 16 optimized images.
- `npm run check`: PASS — 0 errors, 0 warnings, 38 non-blocking hints.
- `npm run audit:all`: PASS — SEO, content, links, claims, images, and schema all critical=0/warning=0.
- `npm run audit:content-image`: PASS — 89 routes, 88 indexable URLs.
- `npm run audit:batch-2-1`: PASS.
- `npm run audit:content-hygiene`: PASS — 92 source files, 89 rendered routes, 0 source issues, 0 rendered issues.
- `npm run qa:playwright`: PASS.
- `git diff --check`: PASS.
- Metadata-diff guard: PASS — no changed `title`, `description`, `h1`, `canonical`, `slug`, or `intent` fields.
- Secret/scope scan: PASS — no credentials, tokens, environment files, customer data, browser profiles, or unrelated files.

## Manual visual closure

Captured local production-like screenshots outside the repository:

- `homepage-390.png`
- `homepage-1440.png`
- `evaluation-390.png`
- `evaluation-1440.png`
- `bulk-390.png`
- `bulk-1440.png`

All six captures passed crop, readable disclosure/caption, CTA visibility, no text overlap, no horizontal overflow, no visible layout shift, natural section continuity, and no visible duplicate/injected copy. Production DOM was validated separately after deployment.

## Production validation

- Full route validation: PASS — 89/89 routes, issues=0.
- Indexable URLs: PASS — 88 expected.
- Sitemap: PASS — 88 URLs.
- HTTP status, metadata, H1, canonical, robots, schema, internal links, assets/images, and province mismatch checks: PASS.
- Content hygiene production scan: PASS — 89 routes, 0 duplicate/injection issues.
- Production smoke suite: PASS, including HTTPS and `www` redirects plus noindex 404 behavior.
- Deployment drift: none; local `main`, `origin/main`, GitHub status SHA, and Vercel deployment SHA all resolve to `51f458967f9a43bb98598b9e1433244930791491`.

### Detailed page checks

| Page | Status | H1 | Canonical/robots/schema | Duplicate/injection | Overflow/CTA | Pilot image/disclosure |
| --- | --- | ---: | --- | --- | --- | --- |
| `/` | PASS | 1 | PASS | 0 / 0 | No overflow; 8 visible CTA links | Not applicable |
| `/วิธีประเมินราคา` | PASS | 1 | PASS | 0 / 0 | No overflow; 7 visible CTA links | 760×506 AVIF loaded; visible 15px disclosure |
| `/รับซื้อสินค้าไอทียกล็อต` | PASS | 1 | PASS | 0 / 0 | No overflow; 7 visible CTA links | 760×506 AVIF loaded; visible 15px disclosure |

The original typo strings, duplicate paragraphs, unresolved template tokens, and title/keyword insertion patterns were absent from Production.

## Rollback decision

No rollback was performed. There were no route, SEO, content, image, schema, CTA, or deployment-drift regressions. The previous known-good deployment remains available as the rollback target listed above.

## Remaining P2 / field-data items

1. Production screenshot backend remained unavailable; local 390px/1440px screenshots were paired with independent Production DOM validation.
2. Google Search Console field data was not available in this release session; monitor indexing, impressions, CTR, and query drift after release.
3. The committed `audit:content-hygiene:prod` convenience command currently points at `www.buyitkorat.com`, which does not resolve. Production hygiene was successfully completed using the correct punycode origin without changing the authorized two-commit release. Correct the tooling origin in a separately authorized follow-up commit.

## Repository state

The authorized two commits were pushed without force. The safety branch and `origin/main` both point to the final SHA. This report was created after Production validation and intentionally was not committed or pushed because the export authorization was limited to the two named commits.
