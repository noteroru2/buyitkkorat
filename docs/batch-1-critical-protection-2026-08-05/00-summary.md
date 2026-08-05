# Batch 1 — Critical Protection Summary

**Date:** 2026-08-05  
**Scope:** Business entity, About/Contact, schema, GA4/consent scaffolding, Facebook CTA hooks, valuation foundation, security headers, tests  
**Constraint:** No invented NAP / Facebook / GA4 / Maps / GSC tokens

## Final verdict (pre-deploy local)

**PASS WITH WARNING** — implementation complete locally; user-supplied values still blocked; production attestation pending deploy.

## Status vs audit P1 findings

| Finding | Status |
|---------|--------|
| F-001 Ubon entity / NAP | PARTIALLY CLOSED — province published; street/Maps/hours BLOCKED |
| F-002 Analytics | PARTIALLY CLOSED — GA4 env-ready + events + consent; ID BLOCKED |
| F-003 Facebook CTA | PARTIALLY CLOSED — conditional CTA; URL BLOCKED |
| F-004 LocalBusiness | PARTIALLY CLOSED — Ubon LocalBusiness (province-level); full address BLOCKED |
| F-005 About rewrite | CLOSED (province-level HQ + Korat service wording) |
| F-006 Deploy identity | NOT ADDRESSED until push/deploy |
| F-007 GSC | BLOCKED — env hook added |
| F-009 Security headers | CLOSED in `vercel.json` (CSP Report-Only) |

## Local verification

- Build: **90 pages** (+ cookie policy)
- `astro check`: **0 errors**
- `npm run audit:all`: **PASS** (includes `audit:batch1-protection`)

## Remaining user-supplied values

1. `PUBLIC_STORE_STREET_ADDRESS` (+ postal/hours)
2. `PUBLIC_GOOGLE_MAPS_URL` / `PUBLIC_GBP_URL`
3. `PUBLIC_FACEBOOK_URL`
4. `PUBLIC_GA_MEASUREMENT_ID`
5. `PUBLIC_GSC_VERIFICATION`
