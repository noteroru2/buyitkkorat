# 03 — Maps and Facebook

## Maps CTA

- Component: `MapsCTA.astro`
- URL: `https://maps.app.goo.gl/krv97o14jPTRrnpW8`
- Label: ดูเส้นทางหน้าร้านอุบลราชธานี
- `data-event="maps_click"`
- Placements: About, Contact, Footer
- `rel="noopener noreferrer"`

## Facebook CTA

- Component: `FacebookCTA.astro` (conditional)
- URL: `https://www.facebook.com/Amphontrading`
- `data-event="facebook_click"`
- Placements: About, Contact, Footer, Header (desktop), Mobile nav
- Not in sticky mobile bar (LINE + phone remain primary)

## Analytics

Events still go through capture-phase handler with 400ms dedupe; params allowlisted (no PII / no raw customer URLs required).
