# 04 — Analytics Events

## Design

- `PUBLIC_GA_MEASUREMENT_ID` optional
- No ID ⇒ no gtag.js load, site still builds
- Consent Mode defaults: analytics/ad storages **denied**
- GA script loads only after consent accept (`winner_analytics_ready`)
- Click handling centralized in `Analytics.astro` (capture phase, 400ms dedupe)
- Legacy `winner_cta` CustomEvent retained with mapped `detail.event` + sanitized `params`

## Event map

| UI `data-event` | GA4 event | contact_method |
|-----------------|-----------|----------------|
| phone_click | phone_click | phone |
| line_click / sticky_line_click / hero_line_click | line_click | line |
| facebook_click | facebook_click | facebook |
| maps_click | maps_click | maps |
| valuation_start | valuation_start | line |
| valuation_submit | valuation_submit | form |
| service_cta_click / contact_click | contact_click | line/contact |

## Allowed params

`page_path`, `page_type`, `cta_location`, `contact_method`, `service_category`

## Forbidden

phone numbers, names, messages, serials, exact addresses, customer image URLs as params

## Status

**BLOCKED: VERIFIED GA4 MEASUREMENT ID REQUIRED** to activate collection in production.
