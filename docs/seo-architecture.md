# SEO Architecture — WINNER IT Korat

## Production Domain

- Canonical host: `https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com`
- Thai display: `https://รับซื้อไอทีโคราช.com`
- Apex เป็นหลัก, www redirect → apex
- ไม่มี `.html`, trailing slash ตาม Astro config เดียวกันทั้งไซต์

## URL Clusters

```
/ (Home)
├── Hub: /รับซื้อสินค้าไอที
├── Core services (pickup, ship-in, bulk, office, closing)
├── Product money pages (Apple / Mobile / Notebook / PC / Parts / Camera / Gaming / Org)
├── Condition + selling intent pages
├── /พื้นที่/* (local areas)
├── /บทความ/* (supporting articles)
└── Trust + Policy (about, contact, FAQ, privacy, terms, buy policy)
```

## Internal Linking Rules

| From | To |
|------|----|
| Home | Hub, category hubs, areas, articles, trust |
| Money page | Hub, related products, 1–2 condition, 2–4 articles, 1–2 areas |
| Area page | 4–6 key services + related articles (no link farm) |
| Article | 2–4 money + 2–3 sibling articles |

Related links กำหนดใน frontmatter เท่านั้น ห้ามสุ่ม

## On-page Requirements

ทุกหน้า indexable:
- Unique title + meta description
- Single H1
- Canonical = production URL
- OG + Twitter Card
- Breadcrumb
- FAQ visible + matching FAQPage schema (เมื่อมี FAQ)
- updatedDate

## Structured Data

- Organization (`@id` คงที่) + WebSite
- WebPage / Service / AboutPage / ContactPage ตามประเภท
- BreadcrumbList
- FAQPage (ตรง FAQ ที่แสดง)
- Article สำหรับบทความ
- ห้าม: fake LocalBusiness address, AggregateRating, Review, invented PriceRange/OpeningHours/Geo

## Keywords (ใช้แบบธรรมชาติ)

- รับซื้อสินค้าไอทีโคราช
- รับซื้อไอทีโคราช
- รับซื้อคอมโคราช
- รับซื้อโน๊ตบุ๊คโคราช
- รับซื้อโทรศัพท์โคราช
- รับซื้อถึงที่โคราช
- ขายสินค้าไอทีมือสองโคราช
- ประเมินสินค้าไอทีผ่าน LINE

## Claim Policy

ต้องมี disclaimer:
> ราคาประเมินเบื้องต้นจากรูปและข้อมูลอาจเปลี่ยนแปลงได้หลังตรวจสอบสินค้าจริง

ห้าม: อันดับ 1, ดีที่สุด, ราคาสูงที่สุด, รับซื้อทุกสภาพ/ทุกรุ่น, เงินสดทันทีทุกกรณี, แม่นยำ 100%, สาขาในโคราช, ทีมทุกอำเภอ, ฯลฯ

## Indexability

- Sitemap: เฉพาะหน้า indexable
- robots.txt: Allow public, Sitemap = production URL
- 404 ไม่ใส่ sitemap
- Draft / preview / localhost ห้ามอยู่ใน metadata หรือ sitemap
