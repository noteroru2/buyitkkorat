# KORAT K1 — Page-One CTR + Local Winner Push

Date: 2026-09-09 (Asia/Bangkok)
Base main SHA: `a36e1d2da0973fd463814718d3c0ba812319e22b`
K0 baseline latest finalized GSC date: `2026-09-06`

## Verdict

`TARGETED_PUSH / EXACT_SLUG_ONLY / OWNERSHIP_PRESERVED`

K1 applies SEO title/description overrides only to exact GSC-backed slugs. H1, body content, URLs, canonicals, redirects, robots, sitemap, indexability and runtime architecture remain unchanged.

## K0 evidence used

Sitewide 28d baseline (2026-08-10 → 2026-09-06):
- 16 clicks
- 233 impressions
- CTR 6.87%
- Average position 7.4893

Previous 28-day period returned no rows, so no momentum percentage is inferred.

## Local targets

- `/พื้นที่/ปักธงชัย` — 0 clicks / 26 impressions / position 6.54 — Priority 1
- `/พื้นที่/ด่านขุนทด` — 0 / 13 / 5.46 — Priority 2
- `/พื้นที่/โชคชัย` — 1 / 18 / 7.11; query `ไอทีโชคชัย` 10 impressions / 0 clicks / position 7.4
- `/พื้นที่/มหาวิทยาลัยเทคโนโลยีสุรนารี` — 1 / 18 / 7.28
- `/พื้นที่/สีคิ้ว` — 0 / 5 / 7.20 — low-data CTR opportunity

## Service targets

- `/รับซื้อกล้อง-โคราช` — 0 / 14 / position 8.00 — Priority 3
- `/รับซื้อลำโพง-โคราช` — 0 / 6 / 5.50 — low-data page-one CTR opportunity; source title also contained the typo `ลำโพงบluetooth`
- `/รับซื้อโน๊ตบุ๊ค-โคราช` — 0 / 6 / 10.00 — near-page-one recovery; description-only intent strengthened while H1 remains unchanged
- `/รับซื้อโทรศัพท์จอแตก-โคราช` — 0 / 6 / 9.83 — near-page-one recovery; snippet now makes the commercial question `ยังขายได้` explicit without quoting or guaranteeing a price

## Protected winners

No K1 SEO override is applied to:
- `/รับซื้อเครื่องปริ้น-โคราช` — strongest current commercial winner
- `/พื้นที่/บัวใหญ่`
- `/พื้นที่/โนนสูง`
- `/รับซื้ออุปกรณ์คอมพิวเตอร์-โคราช`
- Homepage beyond its existing metadata

## Implementation

K1 uses exact-slug SEO override maps inside:
- `src/pages/[slug].astro`
- `src/pages/พื้นที่/[slug].astro`

This avoids rewriting long content entries and keeps rollback limited to two rendering files.

For targeted pages only:
- `<title>` uses the K1 title override;
- meta description uses the K1 description override;
- WebPage schema name/description follows the same snippet copy;
- Service schema description follows the override;
- H1 remains `entry.data.h1`;
- canonical remains `entry.data.canonical ?? path`;
- page body and related-link architecture remain untouched.

## Guardrails

- No new indexable pages.
- No route or slug changes.
- No canonical or redirect changes.
- No broad architecture rewrite.
- No changes to printer/Bua Yai/Non Sung winners.
- No destructive consolidation.
- K0 baseline remains frozen for later observation.

## Next gate

After merge/deploy, production must be verified before starting a new GSC observation clock. Do not infer live deployment from source merge alone.