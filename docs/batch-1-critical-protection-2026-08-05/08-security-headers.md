# 08 — Security Headers

## `vercel.json` headers

| Header | Value |
|--------|-------|
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| X-Frame-Options | SAMEORIGIN |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=() |
| Content-Security-Policy-Report-Only | allows self + inline + GA domains |

## Why CSP Report-Only

Site uses inline scripts for consent/analytics bootstrapping. Enforced CSP without careful nonces would break production. Report-Only enables observation first.

## HSTS

Still expected from Vercel platform defaults (verified historically).

## Test

`npx tsx scripts/audit-security-headers.ts`  
`npx tsx scripts/audit-security-headers.ts --production` (after deploy)
