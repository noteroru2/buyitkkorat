# Full Website Gap Audit — Executive Summary

**Audit date:** 2026-08-05  
**Production:** https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com  
**Brand:** WINNER IT / บริษัท อำพล เทรดดิ้ง จำกัด  
**Scope:** Repository + local build + production crawl (report-only; no code fix, no deploy, no commit)

## Final verdict: **PASS WITH WARNING**

เว็บไซต์พร้อมแข่งขันทางเทคนิคในระดับพื้นฐาน (indexable, sitemap สอดคล้อง, metadata ไม่ซ้ำ, CTA LINE/โทรครบ) แต่ยังไม่พร้อมตาม brief ธุรกิจปี 2026 เรื่อง **หน้าร้านจริงอุบลราชธานี**, **Facebook conversion**, **การวัดผล**, และ **Local entity / Maps / GBP**

## Scores (0–100)

| Area | Score | Notes |
|------|------:|-------|
| **Overall** | **62** | Weighted; entity + measurement drag score |
| Technical SEO | 82 | Strong crawl/index hygiene; missing some headers |
| Content | 68 | Money pages solid; articles/areas thin |
| AEO | 72 | FAQ + how-to present; thin answers on articles |
| GEO | 52 | Brand entity incomplete vs real HQ brief |
| E-E-A-T | 48 | Honest disclaimers; weak real-world proof |
| UX/CRO | 64 | LINE/tel strong; no FB/form |
| Performance | 70 | Lab heuristics OK; Field CWV **NOT PROVEN** |
| Analytics | 22 | Custom events only; no GA4/GTM sink |
| Security | 66 | HTTPS+HSTS; other headers missing |

## Finding counts

| Severity | Count |
|----------|------:|
| P0 Critical | 0 |
| P1 High | 7 |
| P2 Medium | 13 |
| P3 Low | 8 |
| Opportunities | 18 |

## Identity snapshot

| Item | Value |
|------|-------|
| Branch | `main` |
| Local HEAD | `444c52d661d7322ff6dd1ea85a12226da42b8fbb` |
| origin/main | `23449268a080b1622c192a182c0b38de777d4950` |
| Local vs origin | **ahead 1** (docs-only commit: batch 2.2.2 reports) |
| Last proven content hotfix | `51f458967f9a43bb98598b9e1433244930791491` (ancestor of HEAD) |
| Production deployment SHA | **NOT PROVEN this session** (prior release record: `dpl_smiwGKMt…` / hotfix `51f4589`) |
| Production matches main (content) | **Likely yes for site pages** — post-hotfix commits are docs; **NOT re-proven via Vercel API** |
| Dirty worktree | `docs/audits/production-smoke.json` modified; audit scripts + this report folder untracked |
| Build pages | **89** HTML |
| Astro check | **0 errors** |
| Production crawl | 89 URLs probed; **88×200**, **1×404** (`/404` intentional probe) |
| Sitemap URLs | **88** |
| Indexable (200 + index,follow) | **88** |
| Orphans | **0** |
| Thin (heuristic &lt;400 words in `.main-content`) | **14** |
| Duplicate titles/descriptions | **0** |

## สิ่งที่เว็บไซต์ทำได้ดีแล้ว

1. **Technical hygiene สูง:** robots Allow all, sitemap ↔ crawl สอดคล้อง, canonical/OG/H1 ครบ, ไม่มี orphan  
2. **Conversion path LINE + โทรชัด:** sticky mobile CTA, `tel:` และ LINE OA `@buyhub` บนทุกหน้า 200  
3. **Claim discipline:** มี `FORBIDDEN_CLAIMS`, หน้าเกี่ยวกับเราระบุชัดว่าไม่สร้างรีวิวปลอมและไม่อ้างสาขาโคราชโดยไร้หลักฐาน  

## สิ่งที่เว็บไซต์ยังขาดมากที่สุด

1. **Entity / Local SEO ของหน้าร้านจริงอุบล** — brief ระบุมีหน้าร้านอุบล แต่ production ไม่มีที่อยู่ Maps / LocalBusiness / รูปหน้าร้าน (และยังโฟกัสโคราชเป็น service area)  
2. **ระบบวัดผล** — มี `data-event` + `winner_cta` แต่ไม่มี GA4/GTM/consent sink  
3. **Facebook CTA** — brief ต้องการ; production `hasFB=0` ทั้งไซต์  
4. **On-site valuation form** — conversion พึ่ง LINE นอกไซต์ทั้งหมด  
5. **บทความและบางหน้าพื้นที่บางเกินไป** สำหรับ AEO/topic authority  

## 10 งานที่ควรทำก่อน

1. ยืนยันและบันทึกข้อมูลหน้าร้านอุบล (ที่อยู่, เวลาเปิด, Maps, GBP) แล้วอัปเดต About / Contact / schema อย่างระมัดระวัง  
2. แยกภาษาชัด: **HQ อุบล** vs **พื้นที่บริการโคราช (นัดรับ/ส่ง)** — ห้ามใช้คำว่าสาขาหากไม่มีจริง  
3. ติดตั้ง GA4 + Consent Mode + map `winner_cta` → events (line/phone) โดยไม่ส่ง PII  
4. เพิ่ม Facebook CTA เมื่อมี URL เพจจริง  
5. ขยายบทความ thin 14 หน้า (โดยเฉพาะปัจจัยราคา / เตรียมขาย)  
6. เพิ่ม security headers (CSP light, XCTO, Referrer-Policy, Permissions-Policy, XFO)  
7. Sync local → origin และล้าง dirty smoke/vercel ก่อน deploy รอบถัดไป  
8. Verify GSC property + sitemap submission (สถานะ **NOT PROVEN**)  
9. เพิ่มหลักฐาน E-E-A-T ที่พิสูจน์ได้ (รูปหน้าร้าน/ทีม/เคสจริง) — ไม่สร้างรีวิวปลอม  
10. ออกแบบ valuation form (upload รูป + จังหวัด + สภาพ) เป็น Batch CRO  

## 10 หน้า/กลุ่มเนื้อหาที่ควรสร้างหรือปรับปรุง

1. `/เกี่ยวกับเรา` — Rewrite ให้สะท้อน HQ อุบล + บริการโคราชอย่างถูกต้อง  
2. `/ติดต่อ` — เพิ่ม Maps/เวลาทำการเมื่อยืนยันได้  
3. หน้ารับซื้อ Gaming PC / เครื่องเสีย / ส่งขนส่ง (Improve existing hubs)  
4. บทความปัจจัยประเมินราคา (Rewrite thin set)  
5. ขายขาด vs ฝากขาย (สร้างใหม่ถ้าธุรกิจมีบริการจริง)  
6. วิธีลบข้อมูลก่อนขาย (Improve)  
7. รับซื้อยกล็อต / บริษัท (Improve + case examples)  
8. FAQ hub `/คำถามที่พบบ่อย` (Improve — ปัจจุบันบาง)  
9. นโยบายคุกกี้ (สร้างเมื่อมี analytics)  
10. **ห้าม** สร้างหน้าจังหวัดอุบล/ทั่วประเทศแบบ doorway โดยไร้เนื้อหาเฉพาะพื้นที่  

## ความเสี่ยงหากไม่ดำเนินการ

- AI/Local search อ้างอิง entity ไม่ครบหรืออ้างผิดที่  
- ไม่รู้ว่า LINE/โทรมาจากหน้าใด → ตัดสินใจ SEO/CRO ตาบอด  
- คู่แข่งที่มีตารางราคาอ้างอิง + หน้าร้านชัด (เช่นไซต์เครือเดียวกัน/คู่แข่งท้องถิ่น) แย่ง trust  
- Brief ธุรกิจขัดกับข้อความบนเว็บ → ความเสี่ยงทางกฎหมาย/ความน่าเชื่อถือ  

## Quick wins / Mid / Long

**Quick (≤2 สัปดาห์):** GA4+events, Facebook link, security headers, FAQ expand, sync git  
**Mid (2–6 สัปดาห์):** Ubon entity + Maps/GBP, deepen thin articles, form MVP  
**Long (6–12 สัปดาห์):** topic clusters, real case studies, Field CWV program, review program ที่มีหลักฐาน  

## Report artifacts

- Directory: `docs/full-website-gap-audit-2026-08-05/`  
- Screenshots: `screenshots/` (16 files desktop+mobile)  
- Crawl data: `crawl-data/` (`pages.json`, `url-inventory.csv`, `sitemap-urls.json`, `headers.json`, `robots.txt`, `crawl-summary.json`)  

## Recommended next batch

**Batch 1 — Critical Protection:** entity alignment (Ubon HQ wording), analytics foundation, Facebook CTA URL confirmation, security headers, git identity cleanup — ก่อนขยายหน้าใหม่จำนวนมาก
