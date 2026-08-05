# 15 — Production Verification

Filled after deploy. See also `evidence/` for HTTP samples and fingerprints.

| Check | Expected |
|-------|----------|
| Homepage 200 | Content includes Ubon NAP where applicable |
| FAQ hub | Ubon address + Korat service wording |
| City hub | Amphoe spokes + Ubon note |
| Thin article sample | Expanded sections + LINE |
| Amphoe sample | Link to city hub |
| Maps/Facebook CTA | Still present |
| Security headers | Still present |
| GA4 when ID empty | Not loaded |
| Routes | 90 / sitemap 89 |

Verdict template: `PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED` if SHA not attest-able.
