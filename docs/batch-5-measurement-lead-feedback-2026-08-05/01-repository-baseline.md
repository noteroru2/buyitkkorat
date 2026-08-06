# 01 — Repository Baseline

Checked before Batch 5 implementation commit (working tree dirty with unrelated article edits — **excluded from Batch 5 commit**).

| Item | Value |
|------|-------|
| Branch | `main` |
| Working tree | Dirty (Batch 5 + unrelated article/cookie-policy edits) |
| Local HEAD | `793e3f6ef8f4985db836919e82577f13a3b97f32` |
| origin/main HEAD | `793e3f6ef8f4985db836919e82577f13a3b97f32` |
| Ahead/behind | 0 / 0 |
| Untracked (Batch 5) | `scripts/audit-batch5-measurement.ts`, `scripts/import-gsc-export.ts`, `src/data/leadCapture.ts`, `src/data/measurementConfig.ts`, `src/utils/measurement.ts`, docs/batch-5… |
| Unrelated dirty (do not commit) | Several `src/content/articles/*.md`, `src/pages/นโยบายคุกกี้.astro` |
| Build routes | 94 |
| Indexable / sitemap | 93 / 93 |
| Deployment workflow | Vercel auto-deploy on push to `main` |
| Production URL | `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com` |

## Existing measurement surface (pre-Batch 5)

| Area | Status |
|------|--------|
| Analytics.astro | Present — Consent Mode default denied; CTA dispatcher |
| CookieConsent | Present |
| Event allowlist | Present (`data-event` → gtag) |
| Form / API routes | None for leads |
| Vercel functions | None for leads |
| `.env.example` | GA/GSC empty placeholders |
| GSC hooks | Meta tag when `PUBLIC_GSC_VERIFICATION` set |
| Report scripts | Batches 1–4 audits |
| GSC/GA exports in repo | None |

## Production baseline probe (pre-deploy Batch 5)

| Check | Result |
|-------|--------|
| `gtag.js` | Absent (expected — no Measurement ID) |
| GSC meta | Absent |
| Consent UI | Present |
| Sitemap in robots.txt | Present |
| Sample `x-vercel-id` | Observed (region sin1) — SHA not attested |

## Baseline states to re-verify post-deploy

- Script requests, cookies before/after consent, CTA events, duplicate events, network, dataLayer, GA/GSC presence, lead endpoint absence, security headers, CSP report-only, performance guardrails
