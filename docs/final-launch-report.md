# Final Launch Report — รับซื้อไอทีโคราช.com

วันที่: 2026-07-14

## 1. Executive Summary

เว็บไซต์ Astro SSG สำหรับ **WINNER IT** (บริษัท อำพล เทรดดิ้ง จำกัด) สร้างครบ ทำงานบนเครื่องแล้ว  
`npm run check`, `npm run build`, `npm run audit:all`, Playwright QA ผ่าน  
**Deploy / Domain ยังไม่ทำ** — เจ้าของจะอัป Git และ Vercel เอง

## 2–8. ข้อมูลโปรเจกต์

| รายการ | ค่า |
|--------|-----|
| Workspace | `c:\Users\User\Desktop\รวมโปรเจค\รับซื้อไอทีโคราช.com` |
| Framework | Astro 7 + TypeScript strict + Content Collections |
| Architecture | SSG, layouts/components/content clusters |
| Git Branch | `main` (ยังไม่มี commit — ไฟล์พร้อมใน working tree) |
| Commit Hash | ยังไม่มี |
| Remote | ยังไม่ได้เชื่อม |
| Production URL (ตั้งใน config) | `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com` |

## 9–11. Domain / DNS / SSL

| รายการ | สถานะ |
|--------|--------|
| Domain mapping | **BLOCKED** — ยังไม่ deploy |
| DNS | รอหลังชี้โดเมนบน Vercel |
| SSL | รอหลัง DNS ถูกต้อง |

## 12–18. ปริมาณหน้า

| เมตริก | จำนวน |
|--------|------:|
| หน้า HTML ที่ build | 89 |
| Services (money/core/condition) | 54 |
| Area pages | 11 |
| Articles | 15 |
| Sitemap URLs | 88 (ไม่รวม 404) |
| Noindex | 404 เท่านั้น |

## 19–24. Audit Results (รันจริงแล้ว)

| เมตริก | ผล |
|--------|-----|
| Money page word count ต่ำสุด | ≥ 1,500 คำไทย (audit:content critical=0) |
| Duplicate Title | 0 |
| Duplicate Description | 0 |
| Broken Internal Links | 0 |
| Claim Risk (critical) | 0 |
| Missing Alt (critical) | 0 |
| Schema errors (critical) | 0 |

## 25–28. Build / QA

| รายการ | ผล |
|--------|-----|
| Build | PASS — 89 pages |
| `astro check` | PASS — 0 errors |
| Mobile QA (Playwright 390) | PASS |
| Desktop QA (Playwright 1440) | PASS |
| Screenshots | `docs/audits/screenshots/` |
| Lighthouse | ยังไม่รันบน production (แนะนำหลัง live) |

## 29–30. Production Smoke / Blockers

- Production Smoke Test: **ยังไม่ได้รัน** (ยังไม่มี live URL)
- Blocker: **BLOCKED BY CREDENTIALS** สำหรับ Vercel CLI (`vercel whoami` ขอ device login)  
  เจ้าของจะ push Git และเชื่อม Vercel เอง

## ขั้นตอนที่คุณทำต่อได้

1. `git add .` แล้ว commit (แนะนำแยกตามงานตามบริฟ)
2. สร้าง GitHub/Git remote แล้ว `git push -u origin main`
3. Import โปรเจกต์บน Vercel → Framework Astro → Build `npm run build` → Output `dist`
4. เพิ่มโดเมน `xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com` เป็น Primary (apex)
5. ตั้ง www → apex redirect ตามค่า DNS ที่ Vercel แสดง (อย่าเดา A/CNAME)
6. ตรวจ live: `/`, hub, iPhone, notebook, robots.txt, sitemap

## 31. แนะนำ 30–90 วัน

- วัด conversion LINE จริง แล้วค่อยใส่ Measurement ID
- ขยาย Area เฉพาะอำเภอที่มี demand
- เพิ่มบทความตามคำถามลูกค้าจาก LINE
- รัน Lighthouse บน production และเก็บคะแนนใน `docs/audits/`
