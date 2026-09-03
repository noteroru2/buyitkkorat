# Final Content Hygiene & Visual Placement Cleanup

## Decision

The INDEX 350 architecture is frozen at 360 live routes / 359 indexable routes / 359 sitemap URLs. This cleanup changes presentation and customer-facing copy only. `/รับซื้อ-canon-eos-r-โคราช` remains HOLD.

## Problem addressed

The rendered site contained implementation/editorial language that was useful while designing the architecture but inappropriate for customers and search-facing body copy. Examples included page-intent/ownership explanations, page-splitting rationale, internal SEO terminology, generic image-introduction copy, and raw route labels. Generic visual blocks were also repeated too high on many pages, pushing useful valuation information down the page.

## Content treatment

The cleanup preserves factual content that helps a seller make a decision: product identity, model/spec checks, condition, defects, repair history, accessories, account removal, proof of ownership, delivery/pickup process, valuation caveats, and LINE contact steps.

Internal implementation language is rewritten into customer tasks. For example, page-architecture explanations are replaced with guidance about identifying the exact model, sending the correct spec, or selecting the relevant product category. Local pages state the real service model directly rather than explaining why the URL/page exists.

## Visual treatment

The homepage, service pages, local pages, directory pages, and trust/legal layouts no longer insert large generic category covers above core content. Articles retain a compact category-relevant visual. Approved pilot workflow imagery remains on the limited service pages that explicitly use it and retains a truthful illustration disclosure. Bottom-of-page LINE CTA imagery remains because it supports a real conversion action after the user has read the content.

## Regression prevention

The static hygiene validator scans customer-visible Markdown body/display metadata and user-facing Astro/data sources. The built-surface audit scans all 359 indexable HTML pages after Astro build, validates sitemap count, verifies image alt attributes when images are present, and confirms the Canon EOS R risk URL is not in sitemap.

The W6 predeploy gate now requires the built-surface hygiene audit before `PREDEPLOY_READY` / `GO`.

## Locked architecture invariants

- 360 live
- 359 indexable
- 1 noindex
- sitemap 359
- Canon EOS R model candidate remains HOLD
- no automatic further release
