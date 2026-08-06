# 04 — Consent Mode Validation

## Mode

**Basic Consent Mode behavior for GA:** gtag.js is not injected until analytics consent is granted **and** a valid Measurement ID exists. Defaults are set to denied when the GA bootstrap script is present.

## Expected runtime matrix

| State | analytics_storage | ad_* | GA script | GA cookies | CTA → gtag |
|-------|-------------------|------|-----------|------------|------------|
| Before choice | denied | denied | Not loaded (no ID) / bootstrap only if ID | None unexpected | No gtag send |
| After Accept | granted | denied (no Ads) | Load if ID | Allowed per GA | Yes if ID+consent |
| After Reject | denied | denied | No load / no new GA cookies | None new | No |

## Preference control

- Cookie policy / preference UI present (Batch 1+)
- Accept ↔ Reject change must update state (runtime verified in Batch 1; re-check post-deploy)
- Keyboard / screen-reader labels preserved

## Verification rule

Consent Mode is **not** declared PASS from HTML-only inspection. Post-deploy evidence must include cookie jar + network + `window.__WINNER_CONSENT__` / dataLayer observations (see `18-analytics-qa.md` and `evidence/`).

## Current Production without GA ID

Consent UI still functions for preference storage. No GA network expected regardless of Accept until ID is configured — Accept must not invent measurement traffic.
