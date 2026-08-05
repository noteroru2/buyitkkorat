# 06 — Facebook CTA

## Status

**BLOCKED: VERIFIED FACEBOOK URL REQUIRED**

## Implementation

- `PUBLIC_FACEBOOK_URL`
- `FacebookCTA.astro` renders only when URL present
- Wired into About, Contact, Footer, Header (desktop), Mobile nav
- Not added to sticky mobile bar (avoids crowding; LINE+phone remain primary)
- `rel="noopener noreferrer"` + `data-event="facebook_click"`

## Tests

`audit-batch1-protection` fails if facebook CTA appears without configured URL.
