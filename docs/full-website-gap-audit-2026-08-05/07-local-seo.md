# 07 — Local SEO

## Business brief vs live site (critical)

| Fact (brief) | Live site (proven) | Gap |
|--------------|--------------------|-----|
| หน้าร้านจริงที่อุบลราชธานี | ไม่พบคำว่าอุบลบน homepage HTML (0 matches) | **P1 entity mismatch** |
| จังหวัดอื่น = นัดรับ/ขนส่ง ไม่ใช่สาขา | โฟกัสโคราช + ปฏิเสธการอ้างสาขาโคราช | Partial alignment for Korat honesty; missing HQ |
| NAP consistency | Phone + LINE + legal name present; **no street address** | Incomplete NAP |
| Google Maps / GBP | `hasMaps: false` sitewide | Missing |
| LocalBusiness schema | Organization + AdministrativeArea นครราชสีมา only | Missing Store/LocalBusiness for Ubon |

## What production currently communicates

- Brand: WINNER IT  
- Legal: บริษัท อำพล เทรดดิ้ง จำกัด  
- Phone: 095-547-9408  
- LINE: @buyhub  
- Service area label: จังหวัดนครราชสีมาและพื้นที่ตามเงื่อนไขการนัดหมาย  
- About: explicitly does **not** claim a Korat store without proof  

This is ethically strong for Korat doorway avoidance, but **incomplete** relative to an Ubon physical store brief.

## Area pages assessment

| Page group | Recommendation |
|------------|----------------|
| `/พื้นที่/เมืองนครราชสีมา` | Keep as Korat service hub |
| Thin amphoe (ด่านขุนทด, บัวใหญ่, พิมาย, โนนสูง) | Improve with real logistics OR merge |
| Any future Ubon page | Only with real address, hours, maps, photos — not template |

## Doorway risk

Amphoe pages that only swap place names without unique pickup constraints are **doorway-adjacent**. Current word counts 358–386 on weakest pages → Improve/Merge.

## Sister / related web presence (context only)

Public search shows `amphontd.com` under AMPHON TRADING with pricing tables and service areas including Ubon/Korat. Treat as **related brand web**, not automatically as proof for this domain’s content. Align entities carefully to avoid conflicting NAP across properties.

## Local SEO actions (ordered)

1. Collect verified Ubon NAP + hours + Maps URL + GBP (offline)  
2. Update About/Contact with HQ facts; keep Korat as service region language  
3. Add `LocalBusiness` (or `Store`) `@id` for Ubon **only when address published on-page**  
4. Add storefront photos  
5. Do not claim “สาขาโคราช”  
6. GBP categories + services + products alignment **NOT PROVEN** (no GBP access this audit)
