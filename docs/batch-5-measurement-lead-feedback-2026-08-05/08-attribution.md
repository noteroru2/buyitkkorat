# 08 — Attribution Handling

## Current stance

Minimal attribution. No custom client ID, no fingerprinting, no cross-device stitching.

## Allowed campaign params (if present in URL for first-party use later)

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` — allowlist only; **not** currently forwarded wholesale into analytics params.

## Prohibitions enforced by design

- No full query-string capture into events
- No user-typed fields in URLs for tracking
- No UTM appended to `tel:` links
- No unnecessary tracking params on LINE/Facebook outbound
- Consent respected before any GA send
- No new attribution system added in Batch 5 (not required for business)

## If GA4 becomes live

Rely on GA4 session/campaign attribution with Consent Mode. Referral exclusions for payment or self-referral hosts can be configured in GA4 Admin (Owner) — **NOT PROVEN** here.
