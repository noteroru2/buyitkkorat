# Final Launch Report — รับซื้อไอทีโคราช.com

วันที่: 2026-07-14 (อัปเดตหลัง Live QA)

## 1. Executive Summary

เว็บไซต์ Astro SSG ของ **WINNER IT** (บริษัท อำพล เทรดดิ้ง จำกัด) ขึ้น Production แล้ว  
โดเมน / SSL / Redirect ทำงาน และ Production Smoke Test ผ่านหลังแก้ `vercel.json` (`cleanUrls`)

## 2–8. ข้อมูลโปรเจกต์

| รายการ | ค่า |
|--------|-----|
| Workspace | `c:\Users\User\Desktop\รวมโปรเจค\รับซื้อไอทีโคราช.com` |
| Framework | Astro 7 + TypeScript strict + Content Collections |
| Architecture | SSG, layouts/components/content clusters |
| Git Branch | `main` |
| Latest relevant commit | `9599db0` (`fix: enable Vercel cleanUrls for Thai routes`) |
| Remote | https://github.com/noteroru2/buyitkkorat.git |
| Production URL | https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com |
| Thai domain | https://รับซื้อไอทีโคราช.com (Punycode apex) |

## 9–11. Domain / DNS / SSL

| รายการ | สถานะ |
|--------|--------|
| Domain mapping | PASS — Apex เชื่อมแล้ว |
| www → apex | PASS — HTTP 301 ไป `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/` |
| HTTP → HTTPS | PASS — 308 |
| SSL | PASS — HTTPS ใช้งานได้ |

## 12–18. ปริมาณหน้า

| เมตริก | จำนวน |
|--------|------:|
| หน้า HTML ที่ build | 89 |
| Services | 54 |
| Area pages | 11 |
| Articles | 15 |
| Sitemap URLs | 88 |
| Noindex | 404 |

## 19–24. Audit Results

| เมตริก | ผล |
|--------|-----|
| Money page word count | ≥ 1,500 (critical=0) |
| Duplicate Title | 0 |
| Duplicate Description | 0 |
| Broken Internal Links | 0 |
| Claim Risk | 0 |
| Missing Alt (critical) | 0 |
| Schema errors (critical) | 0 |

## 25–28. Build / QA

| รายการ | ผล |
|--------|-----|
| Build | PASS |
| `astro check` | PASS (0 errors) |
| Mobile / Desktop Playwright | PASS |
| Lighthouse | ยังไม่รันบน live (แนะนำรอบถัดไป) |

## 29. Production Smoke Test

รันด้วย `scripts/production-smoke.ts` บันทึกที่ `docs/audits/production-smoke.json`

| Path | Status |
|------|--------|
| `/` | 200 |
| `/รับซื้อสินค้าไอที` | 200 |
| `/รับซื้อ-iphone-โคราช` | 200 |
| `/รับซื้อโน๊ตบุ๊ค-โคราช` | 200 |
| `/รับซื้อคอมพิวเตอร์-โคราช` | 200 |
| `/รับซื้อการ์ดจอ-โคราช` | 200 |
| `/รับซื้อกล้อง-โคราช` | 200 |
| `/รับซื้อสินค้าไอทียกล็อต` | 200 |
| `/พื้นที่/เมืองนครราชสีมา` | 200 |
| `/พื้นที่/ปากช่อง` | 200 |
| `/เกี่ยวกับเรา` | 200 |
| `/ติดต่อ` | 200 |
| `/นโยบายความเป็นส่วนตัว` | 200 |
| `/robots.txt` | 200 |
| `/sitemap-index.xml` | 200 |
| unknown URL | 404 (custom page) |
| LINE / tel | พบบนหน้าที่ตรวจ |

### Hotfix ที่พบและแก้แล้ว

- อาการ: path ภาษาไทยได้ 404 แต่ `*.html` ได้ 200  
- สาเหตุ: Vercel ไม่ map clean URL ให้ไฟล์ Unicode  
- แก้: เพิ่ม `vercel.json` → `"cleanUrls": true`, `"trailingSlash": false` แล้ว redeploy

## 30. Blockers

ไม่มี blocker ค้างหลังแก้ cleanUrls

## 31. แนะนำ 30–90 วัน

- รัน Lighthouse บน production และเก็บคะแนน
- ใส่ Measurement ID เมื่อพร้อม แล้วผูก event hooks ที่มีอยู่
- ขยาย Area/บทความตามคำถามจาก LINE จริง
- Submit sitemap ใน Google Search Console
