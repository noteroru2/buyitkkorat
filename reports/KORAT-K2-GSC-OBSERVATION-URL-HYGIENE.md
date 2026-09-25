# KORAT K2 — GSC Observation + URL Hygiene

Date: 2026-09-25 (Asia/Bangkok)
Latest finalized GSC date used: 2026-09-22

## Verdict

`PROTECT_WINNERS / NO_NEW_PAGES / URL_HYGIENE_ONLY`

## Site movement

Latest 7 days (2026-09-16 → 2026-09-22):
- 25 clicks
- 274 impressions
- CTR 9.12%
- Avg position 6.38

Previous 7 days (2026-09-09 → 2026-09-15):
- 14 clicks
- 214 impressions
- CTR 6.54%
- Avg position 7.14

Latest 28 days (2026-08-26 → 2026-09-22):
- 54 clicks
- 707 impressions
- CTR 7.64%
- Avg position 6.95

Previous 28 days (2026-07-29 → 2026-08-25):
- 3 clicks
- 56 impressions
- CTR 5.36%
- Avg position 7.48

The site is in a strong discovery/ranking expansion phase. Production sitemap contains 358 indexable URLs, so no further page expansion is justified.

## K1 post-deploy observation

Comparison: 2026-09-10 → 2026-09-22 vs 2026-08-28 → 2026-09-09.

- Camera Korat: 0 / 12 / 0% / pos 8.17 → 4 / 58 / 6.90% / pos 6.14.
- Speaker Korat: 0 / 5 / 0% / pos 5.80 → 4 / 25 / 16.0% / pos 4.88.
- Dan Khun Thot: 0 / 12 / 0% / pos 6.08 → 1 / 14 / 7.14% / pos 6.36.
- Suranaree University: 0 / 20 / 0% / pos 9.10 → 1 / 22 / 4.55% / pos 8.45.
- Pak Thong Chai: 0 / 26 / 0% / pos 6.88 → 0 / 28 / 0% / pos 6.61.
- Chok Chai: 1 / 16 / 6.25% / pos 7.31 → 1 / 37 / 2.70% / pos 7.57.
- Sikhio: 0 / 3 / 0% / pos 5.33 → 0 / 10 / 0% / pos 4.60.
- Notebook Korat: 0 / 8 / 0% / pos 12.38 → 0 / 14 / 0% / pos 10.00.
- Printer Korat remains a protected historical winner; post window is 1 / 22 / 4.55% / pos 5.09.

Decision: do not rewrite K1 metadata again in K2. The domain and most K1 targets are improving. Persistent CTR gaps remain on Pak Thong Chai, Chok Chai, Sikhio and notebook, but another finalized observation window is required before a second snippet rewrite.

## URL hygiene

GSC still contains malformed legacy URLs from earlier Thai-route migration. K2 adds Vercel permanent redirects only where the canonical owner is unambiguous. Raw percent-encoded source paths are used to avoid Unicode normalization mismatch.

Recovered clusters:
- malformed Sikhio area paths → /พื้นที่/สีคิ้ว
- malformed CPU paths → /รับซื้อ-cpu-โคราช
- malformed printer paths → /รับซื้อเครื่องปริ้น-โคราช
- malformed About paths → /เกี่ยวกับเรา
- malformed office-equipment path → /รับซื้ออุปกรณ์สำนักงาน
- malformed computer-equipment paths → /รับซื้ออุปกรณ์คอมพิวเตอร์-โคราช

Ambiguous garbage URLs remain 404 and are not redirected speculatively.

## Guardrails

- no new indexable pages
- no K1 title/description rewrite
- no H1/body edits
- no canonical changes
- no sitemap expansion
- no ownership consolidation
- no redirect for ambiguous malformed URLs

## Next measurement

Use finalized GSC through at least 2026-09-29 for the next sanity review. Reconsider CTR-only K2.1 changes only if Pak Thong Chai / Chok Chai / Sikhio / notebook remain page-one or near-page-one with persistent zero/low CTR.
