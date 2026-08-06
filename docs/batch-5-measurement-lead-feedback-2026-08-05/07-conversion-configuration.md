# 07 — Conversion Configuration

## Taxonomy (code)

**Primary (when live):** `line_click`, `phone_click`, `facebook_click`, and `valuation_submit` only after backend success.

**Secondary:** `maps_click`, `valuation_start`, `contact_click`.

**Do not mark all events as Key events.**

## GA4 Admin

| Item | Status |
|------|--------|
| Property Admin access | **ACCESS NOT AVAILABLE** |
| Key events configured | **NOT PROVEN** |

## Report status

`PARTIALLY COMPLETE — EVENTS LIVE (CODE), GA4 KEY EVENT CONFIGURATION REQUIRES PROPERTY ACCESS`

## Owner checklist

1. Open GA4 Admin → Events / Key events
2. Mark Primary events only (after Measurement ID live and events observed)
3. Keep Secondary as events, not Key events, unless business decides otherwise
4. Never mark `evidence_view` / `service_process_view` as Primary conversions by default
