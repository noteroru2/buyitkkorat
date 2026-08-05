# 02 — Technical SEO

## Summary

Technical foundation is **strong for a local/service SSG site**: unique titles/descriptions, single H1, absolute canonicals, OG tags, Thai `lang`, sitemap coverage, no orphan pages. Gaps are mostly **measurement**, **security headers**, **entity schema depth**, and **Field CWV proof**.

## Per-check results (production crawl 2026-08-05)

| Check | Status | Evidence |
|-------|--------|----------|
| Unique titles | PASS | `dupTitleCount: 0` |
| Unique meta descriptions | PASS | `dupDescCount: 0` |
| Single H1 | PASS | `multiH1: 0` on 200 pages |
| Absolute canonical | PASS | present on all 200 pages |
| robots meta | PASS | `index, follow` on indexables |
| Open Graph | PASS | title/desc/image/url on samples |
| Twitter cards | PARTIAL / **NOT PROVEN** sitewide | not systematically asserted in crawl schema |
| BreadcrumbList | PASS on service/area/article layouts | schema types include BreadcrumbList |
| Favicon / manifest | PARTIAL | favicon expected via layout; PWA manifest **NOT PROVEN** |
| `lang="th"` | PASS | crawl `lang: th` |
| Viewport | PASS (layout) | BaseLayout pattern |
| Image alt / dimensions | PASS heuristic | `missingAltSum: 0` in crawl |
| Trailing slash / clean URLs | PASS | `vercel.json` cleanUrls + trailingSlash false |
| www / http normalization | PASS | 301/308 chains observed |
| Structured data graph | PASS types | Organization, WebSite, WebPage, Service, FAQPage, Article, BreadcrumbList |
| LocalBusiness / Store | **MISSING** | intentional historically (no Korat store claim); conflicts with Ubon HQ brief |
| Review / AggregateRating | **ABSENT (good)** | no fake ratings |

## Issues

### P2 — Missing modern security-adjacent headers
See `12-security-privacy.md`. Affects trust signals more than rankings directly.

### P2 — Homepage canonical without trailing path nuance
Homepage canonical: `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com` (no trailing slash). Consistent with trailingSlash false. OK if GSC preferred matches.

### P2 — Hero / page imagery sparse on some templates
Crawl recorded `imgCount: 0` on homepage HTML parse of content images (may exclude CSS/illustration). Visual QA shows illustrations — verify LCP element separately.

### Opportunity — Twitter/X metadata completeness
Add `twitter:card` consistently if social sharing matters.

## Device coverage

Screenshots captured at **1440** and **390** for home, hub, iPhone service, area, article, about, contact, 404. Tablet mid-size visual pass **NOT PROVEN** this session (no 768 capture).

## Verdict (Technical SEO): **82 / 100**
