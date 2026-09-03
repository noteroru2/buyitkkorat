# UX/UI System Redesign — WINNER IT Korat

## Goal

Upgrade the visual system across the whole site without changing SEO ownership, canonical logic, route architecture, or Round 1 release policy.

## Main changes

- New professional white / navy / orange visual system with LINE green reserved for primary contact actions.
- LINE CTA is visible in the sticky header on every viewport.
- Desktop floating LINE contact dock is persistent on every page.
- Mobile bottom action bar is persistent on every page.
- Money pages, area pages, article pages and trust pages now use a wider content card plus a sticky desktop contact sidebar.
- Homepage long service-directory block is collapsed into an accessible details directory to reduce visual overload while retaining internal links in HTML.
- Desktop navigation now exposes child links in a dropdown instead of hiding them from desktop users.
- Mobile navigation puts LINE first and groups service links more clearly.
- Hero sections now explain the three-step valuation journey above the fold.
- Trust strip, business identity card, FAQ, footer and final CTA surfaces were restyled for clearer hierarchy and credibility.

## Conversion path

Primary hierarchy on every page:

1. Header `LINE @buyhub`
2. Hero `ส่งรูปประเมินทาง LINE`
3. Desktop sticky contact sidebar / mobile bottom bar
4. Desktop floating LINE dock
5. Final page CTA

## SEO / architecture protection

No route, canonical owner, index state, sitemap policy, Brand/Series candidate status, or Round 2 state was intentionally changed by this UX/UI batch.

Static architecture validation after the redesign:

- Live / indexable / noindex: 99 / 98 / 1
- Architecture validators: 10/10 PASS
- Round 1 production / observation gate foundation: PASS
- Round 2: LOCKED

## Build status in this workspace

The source was validated against all dependency-free architecture gates. A fresh `npm ci` could not complete inside the current sandbox network/runtime, so a new Astro build is **not attested in this workspace**.

The prior real repository build supplied by the owner passed 99 pages and architecture crawl 99/99 before this UX/UI-only change. Run the commands below locally before deployment:

```powershell
npm ci
npm run validate:architecture
npm run build
npm run audit:architecture-build
npm run predeploy:round1
```

Expected architecture state must remain 99 / 98 / 1 and crawl must remain 99/99.
