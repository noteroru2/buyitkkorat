# 09 — UX, CRO, and Accessibility

## Conversion paths tested (production)

| Path | Result | Evidence |
|------|--------|----------|
| Home → LINE | PASS | LINE links + sticky CTA; screenshots `home-390/1440` |
| Home → Phone | PASS | `tel:+66955479408` |
| Service → contact CTA | PASS | LINE/phone on service layouts |
| Area → appointment CTA | PASS | “สอบถามคิวนัดรับในโคราช” |
| Blog → service CTA | PASS | Article layout CTA |
| Mobile sticky CTA | PASS | StickyMobileCTA component + screenshots |
| Facebook CTA | **FAIL / missing** | `hasFB: false` |
| On-site valuation form | **Missing** | No form routes proven |
| Form success/error | N/A | No form |
| Maps click | **Missing** | `hasMaps: false` |

## CRO findings

### P1 — Facebook channel absent
Brief lists Facebook as a primary conversion surface. Site only pushes LINE + phone.

### P1 — Measurement cannot prove CRO
Custom `winner_cta` events fire in-browser but are not forwarded to analytics (see analytics report).

### P2 — All valuation friction pushed off-site
LINE is fine for trust/speed, but users who hesitate to open LINE lose mid-funnel. Opportunity: light form with photo upload + province + condition.

### P2 — Sticky CTA always present on mobile
Generally good for buyback; watch overlap with footer on short pages (visual QA: no major blockage in screenshots).

### P3 — Duplicate LINE CTAs
Multiple identical CTAs per page — acceptable for CRO but can feel repetitive; consolidate labels for clarity.

## Accessibility (heuristic)

| Check | Status |
|-------|--------|
| Skip link | Present in BaseLayout |
| Focus / keyboard nav | **NOT PROVEN** full audit |
| Touch targets sticky CTA | Appear adequate in mobile screenshots |
| Contrast | **NOT PROVEN** quantitatively |
| Alt text | Crawl missingAlt=0 |
| ARIA on sticky region | `role="region"` present |
| Screen reader pass | **NOT PROVEN** |

## Visual QA (screenshots/)

Captured: home, hub, iPhone, area, article, about, contact, 404 × {1440,390}.

Observations from files present:
- Layouts render; Thai fonts OK in captures  
- 404 page exists and branded  
- No obvious modal blockers in captures  
- Detailed pixel CLS measurement **NOT PROVEN**

## UX/CRO score: **64**
