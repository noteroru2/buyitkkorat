# 03 — GA4 Activation

## Status

`BLOCKED: VERIFIED GA4 MEASUREMENT ID REQUIRED`

## Implementation (code ready)

| Requirement | Status |
|-------------|--------|
| Env-gated script | Yes — `ANALYTICS.enabled` only if valid ID |
| No fake ID | Yes |
| Consent default denied | Yes (when script present) |
| Load gtag.js only after analytics consent | Yes |
| `send_page_view: false` + manual page_view after consent | Yes |
| Production `debug_mode` | Not enabled |
| Invalid ID rejected | Yes |

## Production runtime (current)

| Check | Result |
|-------|--------|
| Measurement ID on Production | **MISSING** |
| `gtag.js` network | **Absent** |
| GA cookies | **None expected** |
| Components error without ID | **None** (enabled=false path) |

## Owner action

1. Create GA4 web data stream for this property (Owner)
2. Copy Measurement ID (`G-…`) into Vercel Production `PUBLIC_GA_MEASUREMENT_ID`
3. Redeploy / wait for auto-deploy
4. Accept cookies on Production → confirm `gtag/js` + collect requests
5. Do **not** use test/placeholder IDs on Production
