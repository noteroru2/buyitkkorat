# 03 — Indexability and Sitemaps

## robots.txt (production)

```
User-agent: *
Allow: /

Sitemap: https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/sitemap-index.xml
```

Evidence: `crawl-data/robots.txt`, `crawl-summary.json`.

| Check | Result |
|-------|--------|
| Googlebot blocked? | No (Allow all) |
| Bingbot blocked? | No |
| AI bot specific rules | **None** — neither Allow-list nor Disallow for GPTBot etc. |
| X-Robots-Tag | null on homepage headers |
| Meta robots noindex on money pages | Not found |

## Sitemap vs crawl vs build

| Source | Count | Notes |
|--------|------:|-------|
| Local build HTML | 89 | includes 404 page artifact |
| Sitemap URLs | 88 | `sitemap-urls.json` |
| Production 200 indexable | 88 | |
| Internal crawl set | 89 | includes `/404` probe → 404 |
| Orphans (in sitemap, 0 inlinks) | 0 | |

**Why 89 vs 88:** build/404 route exists and was probed; sitemap correctly excludes soft utility 404 URL. **Aligned.**

## Soft 404 / thin / duplicate

| Issue | Count | Action |
|-------|------:|--------|
| Hard 404 in sitemap | 0 | — |
| Redirecting sitemap URLs | 0 observed | — |
| Duplicate title/desc | 0 | — |
| Thin pages (wc &lt; 400 heuristic) | 14 | Improve / rewrite |
| Soft 404 | **NOT PROVEN** | no empty money pages detected |

## URL hygiene

| Topic | Result |
|-------|--------|
| HTTPS only preferred | Yes (308 from HTTP) |
| www canonicalization | Yes (301) |
| Thai path encoding | Works on production (punycode host + percent-encoded paths) |
| Case sensitivity issues | **NOT PROVEN** |
| Parameter URL sprawl | None observed |
| Redirect chains &gt;1 hop | None on apex checks |
| Legacy 404s needing redirects | **NOT PROVEN** without GSC coverage export |

## AI crawler stance (GEO note)

Open Allow-all is fine for citation if content quality is high. No accidental Disallow of AI bots. Consider documenting intentional policy later — not a blocker.

## Verdict: Indexability **PASS** with content-depth warnings
