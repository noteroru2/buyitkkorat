# KORAT K0 — GSC Query×Page Ownership Audit

Date: 2026-09-09 (Asia/Bangkok)
Base main SHA: `12cf8dadf9c5e0780fb822f736f2a5c78ff9ff3d`
Latest finalized GSC date: `2026-09-06`

## Verdict

`AUDIT_PASS / BASELINE_FROZEN / PRODUCTION_UNCHANGED / LOW_DATA_HISTORY`

K0 is audit-only. No production route, title, H1, canonical, redirect, schema, robots, sitemap, or customer-facing content is changed by this batch.

## Sitewide baseline

Current 28-day period: 2026-08-10 → 2026-09-06
- Clicks: 16
- Impressions: 233
- CTR: 6.87%
- Average position: 7.4893

Previous 28-day period: 2026-07-13 → 2026-08-09
- Search Console returned no rows for the property in this period.
- Do not infer growth/decline percentages from a missing comparison period.

Recent finalized daily data is available through 2026-09-06. The site already averages page-one visibility, so broad architecture rebuild is not justified by current evidence.

## Page ownership classification

### PROTECT

- `/รับซื้อเครื่องปริ้น-โคราช` — 6 clicks / 22 impressions / CTR 27.27% / position 6.59
  - Strongest proven commercial winner in the current window.
- `/พื้นที่/บัวใหญ่` — 2 / 17 / 11.76% / 7.18
- `/รับซื้ออุปกรณ์คอมพิวเตอร์-โคราช` — 2 / 4 / 50.0% / 5.25 (`PROTECT_LOW_DATA`)
- `/พื้นที่/โนนสูง` — 1 / 9 / 11.11% / 5.67

### PROTECT_AND_PUSH

- `/` — 2 / 19 / 10.53% / 8.05
- `/พื้นที่/มหาวิทยาลัยเทคโนโลยีสุรนารี` — 1 / 18 / 5.56% / 7.28
- `/พื้นที่/โชคชัย` — 1 / 18 / 5.56% / 7.11
  - Exposed query `ไอทีโชคชัย` → this page — 10 impressions / 0 clicks / position 7.4.

### PUSH_CTR

Highest-priority page-one opportunities:

1. `/พื้นที่/ปักธงชัย` — 0 / 26 / CTR 0% / position 6.54 → `PUSH_CTR_PRIORITY_1`
2. `/พื้นที่/ด่านขุนทด` — 0 / 13 / 0% / 5.46 → `PUSH_CTR_PRIORITY_2`
3. `/รับซื้อกล้อง-โคราช` — 0 / 14 / 0% / 8.00 → `PUSH_CTR_PRIORITY_3`
4. `/พื้นที่/สีคิ้ว` — 0 / 5 / 0% / 7.20 → `PUSH_CTR_LOW_DATA`
5. `/รับซื้อลำโพง-โคราช` — 0 / 6 / 0% / 5.50 → `PUSH_CTR_LOW_DATA`

### RECOVER_NEAR_PAGE_ONE

- `/รับซื้อโทรศัพท์จอแตก-โคราช` — 0 / 6 / 0% / 9.83
- `/รับซื้อโน๊ตบุ๊ค-โคราช` — 0 / 6 / 0% / 10.00
- `/พื้นที่/พิมาย` — 0 / 7 / 0% / 10.57
- `/พื้นที่/เมืองนครราชสีมา` — 0 / 6 / 0% / 11.33
- `/รับซื้อสินค้าไอที` — 0 / 4 / 0% / 12.50
- `/รับซื้อเลนส์กล้อง-โคราช` — 0 / 5 / 0% / 12.40

### HOLD_INFORMATIONAL

- `/บทความ/ขายคอมหลายเครื่องควรเตรียมรายการอย่างไร` — 0 / 3 / 0% / 14.33
- `/บทความ/วิธีลบข้อมูลก่อนขายคอมพิวเตอร์` — 0 / 8 / 0% / 12.88
- `/บทความ/วิธีออกจาก-icloud-ก่อนขาย-iphone-หรือ-ipad` — 0 / 4 / 0% / 9.25; page-one informational visibility but too little evidence for a rewrite in K0.

## Query×Page ownership

Search Console exposes very few query rows for this property in the current 28-day window, so ownership decisions must remain conservative.

Confirmed examples:
- `ไอทีโชคชัย` → `/พื้นที่/โชคชัย` — correct local owner, position 7.4, CTR opportunity.
- `winner it` appears across `/ติดต่อ`, `/เกี่ยวกับเรา`, and one office-equipment service page at very low volume.

Brand-query classification:

`LOW_VOLUME_BRAND_OVERLAP / HOLD`

There is not enough evidence to consolidate these pages based on a 3-impression brand query.

## Cannibalization decision

`NO_CONFIRMED_DESTRUCTIVE_CANNIBALIZATION`

- Local intent is distributed to matching district/location pages.
- Current query disclosure is sparse.
- No query family shows two meaningful commercial owners competing at material volume.
- No redirect, canonical consolidation, mass noindex, or route retirement is justified by K0 data.

## Strategic interpretation

The site already has an average position around 7.5 with only 233 impressions in the measured 28-day period. This is a low-volume but healthy early-ranking profile, not a rebuild case.

The best next move is to improve CTR and local-commercial relevance on pages already ranking positions 5–8 rather than publish a new large expansion wave.

## K1 recommended scope

`KORAT K1 — Page-One CTR + Local Winner Push`

Priority order:
1. ปักธงชัย
2. ด่านขุนทด
3. กล้องโคราช
4. โชคชัย
5. มหาวิทยาลัยเทคโนโลยีสุรนารี
6. สีคิ้ว / ลำโพงโคราช only if source copy has a clear low-risk snippet opportunity
7. Notebook / broken-phone pages as near-page-one recovery, without broad model expansion

Guardrails:
- protect printer winner;
- protect Bua Yai / Non Sung local winners;
- no broad architecture rewrite;
- no new indexable expansion during K1;
- no destructive consolidation without new Query×Page evidence;
- preserve existing canonical ownership and URL structure.
