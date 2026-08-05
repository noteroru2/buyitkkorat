# 17 — Audit Evidence Index

## Scope controls honored

- Report-only: no production code fixes, no deploy, no commit/push of fixes
- Only created audit artifacts under `docs/full-website-gap-audit-2026-08-05/` (+ helper scripts untracked)
- Secrets not printed
- Unproven items marked **NOT PROVEN**

## Evidence files

| Artifact | Path |
|----------|------|
| Crawl summary | `crawl-data/crawl-summary.json` |
| Per-URL crawl | `crawl-data/pages.json` |
| URL inventory CSV | `crawl-data/url-inventory.csv` |
| Sitemap URL list | `crawl-data/sitemap-urls.json` |
| Headers sample | `crawl-data/headers.json` |
| robots.txt snapshot | `crawl-data/robots.txt` |
| Screenshots (16) | `screenshots/*-{1440,390}.png` |
| Page action matrix | `14-page-action-matrix.csv` |
| Findings register | `15-findings.csv` |
| Helper crawl script | `scripts/gap-audit-crawl.ts` (untracked) |
| Screenshot script | `scripts/gap-audit-screenshots.ts` (untracked) |

## Commands / checks referenced

| Check | Result summary |
|-------|----------------|
| `git rev-parse HEAD` | `444c52d…` |
| `git rev-parse origin/main` | `2344926…` |
| `git status` | ahead 1; dirty smoke + untracked audit files |
| `npm run build` | 89 pages (session/prior) |
| `npm run check` | 0 errors |
| `npm run audit:all` | PASS critical 0 (prior in session) |
| Production crawl | 88×200 + `/404` |
| Homepage tag grep | no gtag/GTM/FB/Maps/Ubon |
| PageSpeed API | 429 — NOT PROVEN |
| Prior batch 2.2.2 | PASS WITH WARNING; hotfix `51f4589` |

## Screenshot list

- `home-1440.png`, `home-390.png`
- `hub-1440.png`, `hub-390.png`
- `iphone-1440.png`, `iphone-390.png`
- `area-1440.png`, `area-390.png`
- `article-1440.png`, `article-390.png`
- `about-1440.png`, `about-390.png`
- `contact-1440.png`, `contact-390.png`
- `404-1440.png`, `404-390.png`

## NOT PROVEN list (explicit)

1. Live Vercel deployment SHA via API this session  
2. Field Core Web Vitals / CrUX  
3. Google Search Console coverage & verification state  
4. Google Business Profile completeness  
5. Exact Ubon street address (not invented; awaiting business proof)  
6. Full WCAG audit  
7. `npm audit` vulnerability inventory  
8. Tablet (768) visual QA  
9. Twitter card presence on every template  
10. Form conversion paths (no form exists)

## Related prior audits

- `docs/content-intent-image-audit-2026-07/batch-2-2-2/`
- `docs/seo-audit-2026-07-19/` (if present)
