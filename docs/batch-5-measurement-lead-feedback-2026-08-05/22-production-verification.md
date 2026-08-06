# 22 — Production Verification

Filled after push/deploy. Pre-Batch-5 baseline: content matched Batch 4 markers; GA/GSC absent.

## Targets

Home, Contact, Valuation checklist, About, Service hub, money pages sample, articles sample, Korat hub, Cookie/Privacy policy, Sitemap, robots.txt, 404.

## Checks

HTTP status, canonical, indexability, consent runtime, GA presence/absence, CTA destinations, PII protection, GSC meta, security headers, CSP, lead state (no form), broken links/assets, console, fingerprints, `x-vercel-id`.

## Verdict template

If content matches main but SHA unknown:

`PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED`

Evidence JSON: `evidence/production-checks.json`
