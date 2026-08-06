# 24 — Open Blockers

1. **GA4 Measurement ID** — set `PUBLIC_GA_MEASUREMENT_ID` on Vercel Production (verified `G-…` only)
2. **GA4 Property Admin** — configure Key events for Primary conversions
3. **GSC verification token / property access** — set `PUBLIC_GSC_VERIFICATION`, verify property, submit sitemap
4. **Verified lead capture backend** — endpoint, auth, retention, anti-spam, rate limit before any form
5. **Anti-spam / file storage credentials** — only if enabling form/uploads
6. **Production deployment SHA attestation** — Vercel deployment ↔ git SHA mapping
7. **GSC/GA4 data accumulation** — import real exports after measurement is live; do not invent rows

## Recommended next batch

- If GA4 + GSC live: **Batch 6 — Query × Page Optimization and Conversion Experiments**
- If still blocked: keep code readiness; wait for owner-supplied values; no synthetic measurement data
