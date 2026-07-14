# Project Plan — รับซื้อไอทีโคราช.com

## ภาพรวม

เว็บไซต์ Static (Astro SSG) สำหรับธุรกิจรับซื้อสินค้าไอทีมือสองในจังหวัดนครราชสีมา แบรนด์ **WINNER IT** ดำเนินงานโดย **บริษัท อำพล เทรดดิ้ง จำกัด**

| รายการ | ค่า |
|--------|-----|
| Brand | WINNER IT |
| Legal | บริษัท อำพล เทรดดิ้ง จำกัด |
| Domain (Thai) | https://รับซื้อไอทีโคราช.com |
| Domain (Punycode / Production) | https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com |
| LINE | @buyhub |
| Phone | 095-547-9408 / tel:+66955479408 |
| Area | จังหวัดนครราชสีมา (โคราช) ตามเงื่อนไขนัดหมาย |

## เป้าหมายธุรกิจ

1. ให้ลูกค้าในโคราชส่งรูป/ข้อมูลประเมินผ่าน LINE ได้ทันที
2. อธิบายบริการถึงที่ / ส่งมาประเมิน / ยกล็อต อย่างโปร่งใส
3. จัดอันดับ Local SEO ด้วย Money Pages + Area Pages + Articles
4. แปลงทราฟฟิกเป็นคลิก LINE เป็นหลัก โทรเป็นรอง

## Tech Stack

- Astro (stable) + TypeScript strict
- Content Collections + Zod
- SSG เป็นหลัก
- CSS Design Tokens (cute professional)
- Playwright สำหรับ Browser QA
- Audit scripts (Node/TS) สำหรับ SEO/Content/Links/Claims/Images/Schema

## Architecture

```
src/
  components/     # UI + SEO components
  layouts/        # Base, Service, Area, Article, Trust
  pages/          # File-based routes (Thai slugs)
  content/        # services, areas, articles collections
  data/           # site config, nav, claims denylist
  styles/         # design tokens + global
  utils/          # seo, schema, word-count helpers
public/
  images/ icons/ og/
scripts/          # audit + qa scripts
docs/             # plans, inventories, audits, launch report
```

## Content Strategy

1. **Hub / Core** — บริการหลัก + trust + policy
2. **Money Pages** — หมวดสินค้า (Apple, Mobile, Notebook, Parts, Camera, Gaming, B2B)
3. **Condition Pages** — intent ตามสภาพ/สถานการณ์ขาย
4. **Area Pages** — อำเภอ/จุดสำคัญในโคราช (เนื้อหาเฉพาะพื้นที่จริง)
5. **Articles** — คู่มือขาย ≥15 บทความ เชื่อม Money Pages

กฎสำคัญ:
- Money Page main content ≥ 1,500 คำไทย (Intl.Segmenter word-like)
- ห้าม doorway / thin / template เดียวกันเปลี่ยนชื่อ
- ห้ามอ้างสาขา ที่อยู่ รีวิว จำนวนลูกค้าที่ไม่มีจริง
- ราคาประเมินเบื้องต้นอาจเปลี่ยนหลังตรวจของจริง

## Conversion

- Primary CTA: LINE @buyhub
- Secondary CTA: tel:+66955479408
- Sticky mobile CTA + Hero + mid-page + final CTA
- Event hooks: line_click, phone_click, hero_line_click, sticky_line_click, service_cta_click
- ไม่ใส่ GA จนกว่าจะมี Measurement ID

## SEO / Schema

- Canonical / OG / Sitemap ใช้ Production Punycode เท่านั้น
- Schema: Organization, WebSite, WebPage, Service, BreadcrumbList, FAQPage, Article, AboutPage, ContactPage
- ห้าม LocalBusiness + ที่อยู่ปลอม, AggregateRating, Review ปลอม

## Deploy

- Vercel Production
- Apex: xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com
- www → apex redirect
- หากติด credentials รายงาน BLOCKED BY CREDENTIALS

## Acceptance

ดูรายการ 30 ข้อในบริฟหลัก — ต้องผ่าน `npm run check`, `build`, `audit:all` และมี `docs/final-launch-report.md`
