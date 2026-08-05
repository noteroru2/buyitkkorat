# 03 — Structured Data

## Graph nodes

`buildGraph()` now emits:

1. Organization (`#organization`) — sameAs LINE (+ optional FB/Maps/GBP)
2. LocalBusiness (`#localbusiness`) — Ubon province address only
3. WebSite (`#website`)
4. Page-specific nodes (AboutPage, ContactPage, Service, FAQ, Article, BreadcrumbList)

## LocalBusiness rules

- addressRegion/addressLocality = อุบลราชธานี
- streetAddress/postalCode/openingHours/hasMap only if env verified
- `areaServed` may reference นครราชสีมา as service geography (not address)
- No AggregateRating / Review / Offer inventing

## Regression tests

- `scripts/audit-schema.ts` — Korat LocalBusiness address forbidden; entity mismatch checks
- `scripts/audit-batch1-protection.ts` — branch phrases + Ubon presence on About/Contact
