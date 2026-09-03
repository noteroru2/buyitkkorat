# UX/UI V3 — Realistic Image Integration

## Scope

Integrated the generated realistic image set into the website source through shared layouts and page-type routing.

## Visual mapping

- General IT / homepage / trust pages → mixed IT devices scene
- Notebook / MacBook / ASUS / ROG / Dell / Latitude → notebook scene
- Desktop / workstation / monitor → desktop PC scene
- iPhone / iPad / Android / phone / tablet / Apple Watch → mobile-device scene
- GPU / CPU / RAM / SSD / motherboard → component scene
- Camera / lens / shutter-related content → camera scene
- PlayStation / Nintendo / gaming / headphone / speaker → gaming scene
- Bulk / office / corporate / server / printer / POS → bulk IT scene
- Area / pickup / shipping / valuation-flow pages → pickup-and-delivery scene
- Sitewide final CTA → LINE valuation scene

## Coverage

The visual system is injected through shared page layouts, so the current 99 governed routes receive a relevant visual treatment without adding new URLs.

- Services: 58 content pages
- Areas: 11 content pages
- Articles: 19 content pages
- Homepage / directory / trust / policy / 404 pages: shared visual integration

## SEO / architecture safety

No URL ownership, canonical, robots, sitemap, schema ownership, or Round 2 release state was changed.

Validation after integration:

```text
Live/indexable/noindex: 99/98/1
Architecture validators: 10/10 PASS
Sitemap target: 98
Round 2: LOCKED
```

## Build note

`npm run build` could not be attested in this sandbox because the Astro package is not installed and npm cache/network installation was unavailable. Architecture validation is PASS; run the real build in the user's Git checkout after applying this package.
