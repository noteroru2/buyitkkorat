# 10 — Analytics and Conversion Tracking

## Verdict: Critical measurement gap (P1) — score 22 / 100

## What exists

In `BaseLayout.astro`, clicks on `[data-event]` dispatch window CustomEvent `winner_cta` with `{ event, cta, href }`.

Known event names in components:
- `line_click`, `sticky_line_click`, `hero_line_click`
- `phone_click`
- `service_cta_click`

## What does not exist (proven on production homepage HTML)

| Tool / signal | Present? |
|---------------|----------|
| GA4 (`gtag`, `G-` measurement ID) | No (0 matches) |
| GTM | No |
| Google Ads tags | No |
| Meta Pixel | No |
| Vercel Analytics / Speed Insights | No |
| Consent Mode / cookie banner | No |
| dataLayer push | No |
| Search Console verification meta | NOT PROVEN in this crawl |
| Form start/submit events | N/A (no form) |
| Scroll depth | No |
| 404 tracking | No |

## False positive note

Crawl script flagged `hasGA: true` on many pages. Independent HTML inspection shows no GA/GTM. Treat crawl `hasGA` as unreliable (likely regex false positive). Evidence: production homepage string checks 2026-08-05.

## Privacy

Positive: no evidence of shipping phone numbers / message bodies to analytics (because analytics sink absent). When implementing GA4:
- Do not send names, phones, free-text product descriptions as event params
- Add cookie policy + consent before non-essential tags

## GSC

Prior batch marked GSC unavailable. This session: NOT PROVEN.

## Recommended event map (future)

| UI action | Event name | Params (non-PII) |
|-----------|------------|------------------|
| LINE CTA | `contact_line` | `location`, `page_type` |
| Phone CTA | `contact_phone` | `location`, `page_type` |
| Facebook CTA | `contact_facebook` | `location` |
| Form start | `valuation_start` | `page_type` |
| Form success | `valuation_success` | `item_category` (enum) |
| Maps | `maps_click` | — |
