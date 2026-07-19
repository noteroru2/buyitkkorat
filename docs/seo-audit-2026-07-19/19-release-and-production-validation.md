# Batch 1.2 — Release and Production Validation

## Final verdict

**PASS WITH WARNING** — Production ตรงกับ source release SHA และผ่าน automated/visual validation ทั้งหมด แต่ยังไม่มี GSC query ownership, indexing field data และ conversion baseline สำหรับการตัดสิน cannibalization/location pages

## Release identity

| รายการ | ค่า |
|---|---|
| Safety branch | `batch-1-2-seo-release` |
| Production fix commit | `0edf393` — `fix(seo): correct sitemap freshness and restore Xiaomi discovery` |
| Audit/report commit | `f5ff5e6` — `chore(seo-audit): add deterministic URL-level audit deliverables` |
| Main/release source SHA | `f5ff5e6d3e6df2ce15823827df28d1d57ecdbea0` |
| Deployment ID | `dpl_AdZeTJwHb49pdRimSvESkCJHYUAM` |
| Deployment URL | `https://buyitkorat-5zctgo310-amphons-projects-bb1ec3bf.vercel.app` |
| Production URL | `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com` |
| Previous known-good / rollback target | `https://buyitkorat-5evi7ij1m-amphons-projects-bb1ec3bf.vercel.app` |
| Previous source baseline | `0a86d18` |
| Deploy workflow | Vercel Git integration จาก `main`; deployment เกิดอัตโนมัติหลัง push |

## Local release gate

- `npm run check`: PASS — 0 errors, 37 non-blocking hints
- `npm run build`: PASS — 89 routes
- `npm run audit:all`: PASS — 6 suites, critical=0, warning=0
- `npm run audit:report`: PASS — รันซ้ำแล้ว SHA-256 ของ generated files ตรงกัน
- Playwright local QA: PASS
- `git diff --check`: PASS
- ไม่พบ temporary, secret, credentials หรือ unrelated changes

## Production full-route validation

รัน `npm run validate:prod` เมื่อ 2026-07-19 11:37 น. Asia/Bangkok โดยเปรียบเทียบ Production กับ `02-route-inventory.csv`

| การตรวจ | ผล |
|---|---|
| Routes | PASS — 89/89 |
| Indexable URLs | PASS — 88 หน้าตอบ 200 |
| Error route | PASS — unknown route ตอบ 404, noindex |
| HTML/placeholder | PASS |
| HTML title | PASS — ตรง source inventory |
| Meta description | PASS — ตรง source inventory |
| H1 | PASS — ทุกหน้าตรง expected count |
| Canonical | PASS — ตรง production domain/path |
| Robots meta | PASS — ไม่มี accidental noindex |
| Structured data | PASS — JSON-LD parse ผ่านทุก route |
| Xiaomi discovery | PASS — Mobile Hub มี internal link จริง |
| Deployment drift | ไม่พบ |

Static assets `favicon.svg`, `favicon.ico`, `og/default.png`, `apple-touch-icon.png` และ `site.webmanifest` ตอบ 200

## Sitemap and robots

- `robots.txt`: 200 และอ้างถึง production sitemap-index
- Sitemap XML: parse ผ่าน, 88 canonical URLs
- ไม่มี `/404`, redirect URL หรือ noindex URL
- ไม่มี fabricated `<lastmod>`, bulk `<changefreq>` หรือ bulk `<priority>`

## Production browser QA

ตรวจ 14 หน้าสำคัญที่ mobile 390px และ desktop 1440px รวม 28 checks

- ไม่มี horizontal overflow หรือ H1 overflow
- LINE และ phone CTA ปรากฏครบ
- Mobile navigation เปิดได้
- ไม่มี broken rendered images
- Sticky CTA แสดงเฉพามือถือและไม่พบ layout regression
- Schema ไม่แสดงเป็นข้อความ
- Visual inspection หน้าแรก mobile/desktop: PASS; ไม่พบ CLS หรือ UX regression ที่มองเห็นได้

## Reporting calibration

- `/404`: UTILITY / Error recovery / Support / noindex / excluded from sitemap
- แยก raw และ boilerplate-adjusted body similarity
- แยก Intent Relationship, Candidate Type, entity overlap, query evidence, eligibility และ review priority
- Candidates eligible for immediate structural action: **0**

| Candidate Type | จำนวน |
|---|---:|
| Potential cannibalization | 14 |
| Parent-child overlap | 23 |
| Template similarity | 1 |
| Location template similarity | 55 |
| Informational-service overlap | 15 |
| Internal-link overlap | 30 |
| Low relevance similarity | 43 |
| **Total** | **181** |

## Location page warning

Location pages 11 หน้ายังคงไว้ทั้งหมด หลายหน้ามี template similarity สูง และ contextual inbound links ต่ำ ห้าม merge, redirect หรือ noindex ก่อนมีข้อมูลอย่างน้อย 28 วัน และต้องมีทั้ง GSC และ operational evidence

## GSC and remaining risks

- GSC access: ไม่มีใน environment นี้
- Baseline template: `17-gsc-baseline-template.csv`
- Monitoring plan: `18-post-deploy-monitoring.md`
- Review รอบแรก: หลังมีข้อมูลอย่างน้อย 28 วัน
- Remaining risks: index coverage, query ownership, field CWV/CLS และ conversion attribution ยังไม่มี field data

## Rollback readiness

ไม่พบ rollback condition จึงไม่ rollback และเก็บ previous known-good deployment `buyitkorat-5evi7ij1m-amphons-projects-bb1ec3bf.vercel.app` เป็น rollback target

## Git status

หลัง release source merge: local `main` และ `origin/main` ตรงกันที่ `f5ff5e6`; working tree clean ก่อนสร้างรายงานฉบับนี้
