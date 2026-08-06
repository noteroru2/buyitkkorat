# 22 — Production Verification

Checked after push of `99f2333` (2026-08-06).

## Targets verified

| Page | Status | Notes |
|------|--------|-------|
| Home | 200 | Consent UI; no gtag; leadGate+content_cluster live |
| Contact | 200 | No form / no fake success |
| About | 200 | |
| Korat hub `/พื้นที่/เมืองนครราชสีมา/` | 200 | |
| `/วิธีประเมินราคา/` | 200 | |
| Cookie / Privacy policy | 200 | |
| robots.txt | 200 | Declares sitemap-index.xml |
| sitemap-0.xml | 200 | 93 locs |
| Sample `x-vercel-id` | sin1::… | SHA not attested |

## Measurement runtime

| Check | Result |
|-------|--------|
| GA Measurement ID | MISSING |
| gtag.js | Absent |
| GSC meta | Absent |
| `__WINNER_LEAD_SUBMIT_OK__` gate in HTML | Present |
| Fake form / success | Absent |
| Security headers (HSTS, XCTO, CSP-RO, Referrer, Permissions, XFO) | Present |

## Screenshots

`screenshots/*.png` — desktop/mobile consent, contact, checklist, cookie policy.

## Verdict

`PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED`

Evidence: `evidence/production-checks.json`
