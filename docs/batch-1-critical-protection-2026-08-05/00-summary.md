# Batch 1 — Critical Protection Summary

**Date:** 2026-08-05  
**Scope:** Business entity, About/Contact, schema, GA4/consent scaffolding, Facebook CTA hooks, valuation foundation, security headers, tests  
**Constraint:** No invented NAP / Facebook / GA4 / Maps / GSC tokens

## Final verdict

**PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED**

Implementation shipped to `origin/main` (`55b176e`). Production content fingerprints confirm Batch 1 (cookie banner, LocalBusiness, security headers, cookie policy 200, no GA/Facebook URLs without env). Vercel deployment git SHA not attested (no Vercel/`gh` API access).

## Status vs audit P1 findings

| Finding | Status |
|---------|--------|
| F-001 Ubon entity / NAP | PARTIALLY CLOSED — province published; street/Maps/hours BLOCKED |
| F-002 Analytics | PARTIALLY CLOSED — GA4 env-ready + events + consent; ID BLOCKED |
| F-003 Facebook CTA | PARTIALLY CLOSED — conditional CTA; URL BLOCKED |
| F-004 LocalBusiness | PARTIALLY CLOSED — Ubon LocalBusiness (province-level); full address BLOCKED |
| F-005 About rewrite | CLOSED |
| F-006 Deploy identity | PARTIALLY CLOSED — content verified; deploy SHA NOT ATTESTED |
| F-007 GSC | BLOCKED — env hook added |
| F-009 Security headers | CLOSED on production |

## Local + production verification

- Build: **90 pages** (+ cookie policy)
- `astro check`: **0 errors**
- `npm run audit:all`: **PASS**
- Production headers: **PASS** (`audit-security-headers --production`)
- Screenshots: `screenshots/`
- Evidence: `evidence/production-checks.json`

## Remaining user-supplied values

1. `PUBLIC_STORE_STREET_ADDRESS` (+ postal/hours)
2. `PUBLIC_GOOGLE_MAPS_URL` / `PUBLIC_GBP_URL`
3. `PUBLIC_FACEBOOK_URL`
4. `PUBLIC_GA_MEASUREMENT_ID`
5. `PUBLIC_GSC_VERIFICATION`
