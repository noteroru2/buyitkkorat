# 11 — Production Verification

**Checked:** 2026-08-05T11:23:53Z

| Item | Value |
|------|-------|
| Implementation commit | `55b176ee91859e9ffbc73bc1a97f7e420c9c05e2` |
| Merge SHA | N/A (direct push to `main`) |
| origin/main SHA | `55b176ee91859e9ffbc73bc1a97f7e420c9c05e2` |
| Production deployment ID | **NOT ATTESTED** (Vercel API / `gh` auth unavailable) |
| Production request id | `x-vercel-id: sin1::zmsqb-1785929032869-23e8d2305d62` |
| Production SHA | **NOT ATTESTED** via platform metadata |
| Production matches main | **Content fingerprints match** Batch 1 (see below) |

## Content fingerprints (production)

| Check | Result |
|-------|--------|
| Cookie banner markup | Present |
| LocalBusiness JSON-LD | Present |
| `/นโยบายคุกกี้` | HTTP 200 |
| GA gtag.js | Absent (no measurement ID) |
| facebook.com links | 0 |
| Security headers | XCTO, Referrer-Policy, XFO, Permissions-Policy, CSP-Report-Only, HSTS |
| Sitemap URL count | 89 |

Evidence file: `evidence/production-checks.json`

## Verdict line

**PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED**
