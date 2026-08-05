# 15 — Production Verification

**Checked at (UTC):** 2026-08-05T11:59:15Z  
**Implementation commit:** `3e924f03a1682ab2605922d389e0ce663a4bad37`  
**origin/main:** `3e924f03a1682ab2605922d389e0ce663a4bad37`  
**Production deployment SHA:** NOT ATTESTED (no Vercel deploy SHA API)  
**Content match:** Verified via unique Batch 2 markers on live HTML

## Final verdict

`PASS WITH WARNING — PRODUCTION CONTENT VERIFIED, DEPLOYMENT SHA NOT ATTESTED`

## Live checks

| Check | Result |
|-------|--------|
| Homepage 200 | PASS — Maps + Facebook + twitter:card |
| FAQ hub | PASS — 11 `<details>`, Ubon `740/8`, Q “มีหน้าร้านในโคราชหรือไม่” |
| City hub | PASS — amphoe spokes ด่านขุนทด/บัวใหญ่/พิมาย/โนนสูง + Ubon |
| Amphoe sample (ด่านขุนทด) | PASS — link theme to city hub + Ubon |
| Service hub | PASS — FAQ/city/Ubon links |
| Sitemap URL count | 89 |
| Security headers (HSTS, CSP-RO) | Present |
| GA4 / GSC when empty | Not injected (prior batch gate) |
| Forbidden claim “มีสาขาโคราช” | Absent — only negation e.g. “ไม่ใช่สาขาโคราช” |

Evidence: `evidence/production-checks.json`, `evidence/sakha-context.txt`, `screenshots/`

## Sample `x-vercel-id`

`sin1::78j5w-1785931155180-111ec09e1718` (FAQ HIT)
