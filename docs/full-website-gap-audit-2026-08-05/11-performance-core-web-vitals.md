# 11 — Performance and Core Web Vitals

## Score: 70 / 100 (lab heuristics; Field CWV NOT PROVEN)

## Proven positives

- Static SSG on Vercel — low server complexity
- Responsive image pipeline (`ResponsiveImage.astro`) with AVIF/WebP, width/height, lazy/async patterns (prior batch verified)
- Crawl: missing image dimensions sum = 0
- HSTS enabled
- Prior batch 2.2.2: no broken images on audited routes

## Not proven this session

| Metric | Status |
|--------|--------|
| LCP (field) | NOT PROVEN — PSI API returned 429 |
| INP (field) | NOT PROVEN |
| CLS (field) | NOT PROVEN |
| TTFB distribution | NOT PROVEN |
| CrUX / GSC CWV | NOT PROVEN (GSC access unavailable historically) |

## Observations / risks

| Topic | Notes |
|-------|-------|
| Cache-Control | `public, max-age=0, must-revalidate` on HTML — normal for Vercel SSR/SSG HTML; assets may differ |
| Render-blocking | Inline CTA script is tiny; full JS budget not profiled |
| LCP element | Homepage may rely on CSS illustration / text; confirm with Lighthouse locally |
| Third parties | Currently minimal (good for performance) — adding GA/FB pixel will cost INP/LCP budget |

## Recommendations

1. Run authenticated PageSpeed / local Lighthouse desktop+mobile after any tag install
2. Keep third-party tags behind consent
3. Preconnect only to required origins (LINE is navigational, not resource)
4. Re-check Field CWV in GSC after SEO freeze window

## Prior evidence

`docs/content-intent-image-audit-2026-07/batch-2-2-2/10-performance-observation.md`
