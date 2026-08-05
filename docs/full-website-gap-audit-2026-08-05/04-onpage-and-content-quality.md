# 04 — On-page SEO and Content Quality

## Page inventory (content collections + core)

| Type | Approx count | Notes |
|------|-------------:|-------|
| Homepage | 1 | Strong CTA + FAQ schema |
| Service / money | ~54–56 | Korat-focused buyback intents |
| Areas | 11 | Amphoe/university in Nakhon Ratchasima |
| Articles | 15 | Mostly how-to; many thin |
| Trust / legal / contact / FAQ | several | Privacy, terms, buy policy, about, contact, FAQ |

## Money pages

Crawl heuristic word counts on service-like paths: median ~**1318**, max ~**2224**. Source markdown audits historically required ≥1500 Thai words via Segmenter — crawl `.main-content` counts can differ; treat as directional.

**Keep:** core hubs — `/รับซื้อสินค้าไอที`, iPhone, notebook, computer, MacBook, GPU, camera, bulk, pickup, ship-in, valuation method.

**Improve:** condition-specific pages (broken screen, won't boot, no accessories) — ensure unique intent paragraphs, not only template swaps.

## Articles — thin set (P2)

| Path | Approx words | Action |
|------|-------------:|--------|
| `/บทความ/ปัจจัยที่ทำให้ราคาการ์ดจอมือสองแตกต่างกัน` | 265 | Rewrite |
| `/บทความ/ssd-และข้อมูลส่วนตัว...` | 282 | Improve |
| camera lenses tips | 316 | Improve |
| Android Google account exit | 326 | Improve |
| company docs | 328 | Improve |
| box/accessories pricing | 336 | Improve |
| ship safely | 345 | Improve |
| bulk list prep | 356 | Improve |
| photo tips | 376 | Improve |
| won't power on | 316 | Improve |

Stronger articles (~400–639): prepare notebook, check price before sell, iCloud exit, check specs.

## Area pages

| Pattern | Risk | Recommendation |
|---------|------|----------------|
| Amphoe templates with wc 358–386 | Thin / doorway risk if only name-swap | **Improve** with real pickup logistics notes OR **merge** weakest into hub |
| `/พื้นที่/เมืองนครราชสีมา` (864) | Stronger hub | **Keep** + link out |
| Claims of branch in amphoe | Avoided in policy | Continue |

**Do not** mass-generate other provinces.

## Search intent & cannibalization

| Risk | Assessment |
|------|------------|
| Multiple phone brand pages | Acceptable if each brand has unique models/conditions; watch overlap Android vs brand |
| Notebook vs gaming notebook vs broken notebook | Intent split OK if intros differ |
| “โคราช” suffix on nearly all money URLs | Brand/geo alignment for this domain; conflicts with Ubon HQ narrative unless clarified |

## Action groups (summary)

| Group | Examples | Reason |
|-------|----------|--------|
| Keep | Hub, top devices, how-to sell, privacy | Solid intent + CTA |
| Improve | Thin articles, thin amphoe, FAQ hub (219 words) | Depth / AEO |
| Rewrite | About (entity), GPU pricing article | Misaligned or too thin |
| Merge | Weakest amphoe into city hub if cannot localize | Reduce doorway risk |
| Redirect | None proven needed | — |
| Noindex | Utility only if created | — |
| Delete | None without GSC proof of zero value | — |

## Forbidden / overclaim scan

Site maintains `FORBIDDEN_CLAIMS` list. Production about page explicitly rejects fake reviews and unverified Korat store claims. **Good.**

Competitor-style phrases like “ราคาดีที่สุด / ทั่วประเทศ / มีสาขา” appear on **other** sites — do not copy.
