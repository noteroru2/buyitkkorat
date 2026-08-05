# 06 — Internal Linking

## Current architecture

```
Home
 ├─ Service hub `/รับซื้อสินค้าไอที`
 │   ├─ Device money pages
 │   ├─ Condition pages
 │   └─ Bulk / office / ship / pickup
 ├─ Area hub (nav points to `/พื้นที่/เมืองนครราชสีมา`)
 ├─ How to sell / valuation
 ├─ Articles hub `/บทความ`
 └─ Trust: about, contact, policies
```

Crawl shows homepage `outInternal ≈ 69` — strong hub. Orphans = **0**.

## Strengths

- Footer covers services, areas, how-to, about, contact, legal  
- Money layouts include related CTA + breadcrumbs  
- Articles include service CTA  

## Gaps

| Issue | Severity | Evidence |
|-------|----------|----------|
| No Facebook outbound in IA | P1 (CRO) | `hasFB: false` all pages |
| Articles underlink to matching money pages | P2 | Many how-tos thin; contextual links sparse |
| Area pages may over-emphasize amphoe vs hubs | P2 | Doorway risk |
| Authority blog → money not systematic | P2 | Opportunity |
| data-event on service grid links | OK | Not a linking bug |

## Recommended link additions

| Source | Target | Anchor (suggested) | Placement | Why |
|--------|--------|--------------------|-----------|-----|
| `/` trust strip | `/เกี่ยวกับเรา` | เกี่ยวกับ WINNER IT และบริษัท | Below hero / trust | Entity |
| `/เกี่ยวกับเรา` | `/ติดต่อ` | ช่องทางติดต่อและนัดหมาย | Contact section | Conversion |
| `/บทความ/วิธีถ่ายรูป...` | `/วิธีประเมินราคา` | วิธีประเมินราคาเบื้องต้น | End CTA | Intent bridge |
| `/บทความ/เช็กราคา...` | `/รับซื้อสินค้าไอที` | รับซื้อสินค้าไอทีโคราช | Mid-article | Hub juice |
| `/พื้นที่/โนนสูง` (thin) | `/พื้นที่/เมืองนครราชสีมา` | พื้นที่บริการหลักในเมืองนครราชสีมา | Top note | Reduce doorway |
| `/รับซื้อคอมพิวเตอร์-โคราช` | `/รับซื้อคอมเกมมิ่ง-โคราช` | รับซื้อคอมเกมมิ่ง | Related | Cluster |
| `/รับซื้อโน๊ตบุ๊ค-โคราช` | `/รับซื้อ-macbook-โคราช` | รับซื้อ MacBook | Related | Cluster |
| All footers (future) | Facebook URL | Facebook เพจ WINNER IT | Footer | Brief CTA |
| Articles on data wipe | `/นโยบายรับซื้อสินค้า...` | เงื่อนไขยืนยันเจ้าของ | Sidebar/end | Trust |

## Depth

No evidence of pages deeper than ~3 clicks from home for money URLs. Architecture OK.
