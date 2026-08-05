# Batch 1.1 — Verified Business Data Activation

**Date:** 2026-08-05  
**Implementation commit:** `daebafcc0b62ea6e71babc58952030d95c1128d1`

## Final verdict

**PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED**

Verified Ubon NAP, Maps, and Facebook are live on Production. GA4/GSC remain blocked without tokens. Vercel deployment git SHA still not attested via API.

## What closed

- Full storefront address on About / Contact / Footer / LocalBusiness
- Opening hours ทุกวัน 09:00–21:00 + schema `Mo-Su 09:00-21:00`
- Google Maps CTA (`maps.app.goo.gl/krv97o14jPTRrnpW8`)
- Facebook CTA (`facebook.com/Amphontrading`)
- Organization `sameAs` includes Facebook
- LocalBusiness `hasMap` + full PostalAddress (Ubon only)

## Still blocked

- GA4 Measurement ID
- GSC verification token
- Valuation backend
- Production deployment SHA (platform API)

## Verification snapshot

- Build: 90 pages
- `astro check`: 0 errors
- `audit:all`: PASS
- Production About/Contact fingerprints: address, hours, Maps, Facebook, schema fields = true
- GA gtag.js: absent
- GSC meta: absent
- Security headers: PASS
