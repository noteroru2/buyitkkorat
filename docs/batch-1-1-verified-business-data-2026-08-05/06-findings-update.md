# 06 — Findings Update

| Finding (from Batch 1 / gap audit) | Status | Evidence |
|------------------------------------|--------|----------|
| Full NAP / store entity | CLOSED | site.ts + About/Contact/Footer + production JSON |
| Google Maps URL | CLOSED | Maps CTA live + schema hasMap |
| Facebook CTA | CLOSED | FB links live + sameAs |
| LocalBusiness address | CLOSED | street/postal/region Ubon only |
| About/Contact entity alignment | CLOSED | production fingerprints |
| GA4 Measurement ID | BLOCKED | no gtag.js; env empty |
| GSC verification | BLOCKED | no meta; env empty |
| Valuation backend | BLOCKED | foundation only |
| Production deployment SHA | BLOCKED / PARTIAL | content verified; API SHA not attested |
| Security headers | CLOSED (no regression) | production header check |
