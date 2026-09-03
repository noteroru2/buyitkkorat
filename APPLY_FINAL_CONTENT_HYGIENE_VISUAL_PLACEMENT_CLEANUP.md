# FINAL CONTENT HYGIENE & VISUAL PLACEMENT CLEANUP

Date: 2026-09-03

## Purpose

Clean customer-visible copy that accidentally described SEO architecture, page ownership, template logic, image implementation, or internal navigation strategy, and move/remove generic imagery that was pushing useful content below the fold.

## Architecture lock

This batch must not change the INDEX 350 architecture:

- Live routes: 360
- Indexable routes: 359
- Noindex routes: 1
- Sitemap URLs: 359
- Remaining HOLD: `/รับซื้อ-canon-eos-r-โคราช`
- No new URLs
- No removed URLs
- No redirects
- No canonical switches
- No noindex/index changes

## Copy cleanup

Customer-visible content was rewritten to remove internal/editorial wording such as:

- intent / ownership / owner / canonical ownership
- doorway / cannibalization / internal links
- Product×District / Model×Condition and similar architecture notation
- “ลักษณะการค้นหา” and explanations of why a page was created
- “ทำไมต้องแยกจากหน้าหลัก” / “ทำไม ... มีหน้ารุ่นแยก”
- “หน้าซีรีส์/หมวดแม่” / “แม่ของซีรีส์” / “แม่ของรุ่น”
- editorial image copy such as “ภาพหน้าปกเว็บไซต์”, “ภาพประกอบหมวดสินค้า”, and “ใช้ภาพจริงสไตล์เดียวกันทั้งเว็บ”
- raw route strings rendered as user-facing link text or body bullets

Useful product, valuation, condition, service-area, ownership-verification, privacy, shipping, and LINE-contact content remains.

## Visual placement changes

- Homepage: removed the large standalone generic cover directly after the hero.
- Service pages: removed the automatically repeated generic category cover above the main content. Existing specifically approved pilot workflow images remain only on the small number of pages that use them. Final LINE CTA imagery remains.
- Area pages: removed repeated generic pickup imagery from every district/service-area page. Local pages keep truthful no-branch language.
- Article pages: keep one compact, relevant category image near the article intro; no editorial heading/caption explaining why the image exists. Article image mapping was refined for bulk, mobile, camera, monitor/desktop, component, and notebook topics.
- Trust/legal pages: removed generic product cover/CTA imagery.
- Directory pages: removed filler editorial cover sections.

## Image quality policy

Historical “minimum 2 images per page” enforcement is removed. Images are optional and must be relevant. When an image exists, alt-text validation remains required.

Policy: `OPTIONAL_RELEVANT_ALT_REQUIRED_WHEN_PRESENT`

## Permanent regression gates

New commands:

```powershell
npm run validate:final-hygiene
npm run audit:final-hygiene-build
```

`npm run validate:architecture` now includes the final hygiene validator.

W6 SHA-locked predeploy now also runs the built HTML hygiene audit, so production release cannot return `GO` if customer-visible SEO/editorial leakage reappears.

## Validate on the real repo

Run from the project root:

```powershell
$ErrorActionPreference = "Stop"

npm run validate:architecture
npm run validate:final-hygiene
npm run build
npm run audit:architecture-build
npm run audit:index350:w6-build
npm run audit:final-hygiene-build
```

Expected hygiene result:

```text
Live/indexable/noindex: 360/359/1
Sitemap: 359
SEO/editorial findings: 0
Raw visible route lines: 0
Empty H2/H3: 0
Canon EOS R: HOLD
VERDICT: PASS
```

After the real build passes, review representative production screenshots before commit/push:

- Homepage
- Core notebook/computer/mobile/camera money pages
- One Series page
- One Model page
- One Condition page
- One B2B page
- One Local page
- One Guide article
- Privacy/terms page

Do not commit/push if the real build or built-surface hygiene audit fails.
