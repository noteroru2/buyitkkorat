# QA report

## Automated content QA

- Fresh build: PASS, 89 routes.
- astro check: PASS (telemetry attempted to write outside sandbox after the successful check; no project error).
- audit:all: PASS, 6 suites, critical=0, warning=0.
- Content/image generator: PASS, 89 routes / 88 indexable / 422 source images.
- Target content province mismatch (ขอนแก่น/อุบลราชธานี/อุดรธานี in main content): 0 in Browser QA.
- H1 count issues, broken images, empty rendered image alt and missing rendered intrinsic dimensions: 0 across the representative set.
- Exact source-image duplicate groups: 59; these are blocked/deduplicated in the migration plan.

The generator checks every built route for answer-first text, valuation/process/ownership coverage, CTA/LINE/phone, FAQ, contextual/related links, image use/disclosure, province-sensitive terms and deterministic hashes. Existing content, claims, links, image, schema and SEO audits cover unsupported superlatives, placeholders, contact consistency, broken assets and structured-data regressions. Baseline cannibalization/location reports remain the calibrated near-duplicate gate.

## Browser QA

PASS WITH WARNING: 21 representative pages × 4 viewports (360×800, 390×844, 768×1024, 1440×900) = 84 combinations on production. Set included homepage, main/mobile/computer hubs, Xiaomi, iPhone, notebook/broken notebook, camera, gaming, B2B, seller journey, 3 locations, 3 articles, about, contact and 404.

- H1 count: 1 on all 84 combinations.
- Horizontal overflow: 0. Broken rendered images: 0. Missing intrinsic image dimensions: 0.
- Wrong-province text in main content: 0. LINE and phone links were present and correctly formed on conversion pages.
- Mobile navigation at 390px: open button unique and visible; aria-expanded changed false→true; dialog exposed service, category, location, article, trust, LINE and phone routes; close control worked.
- No DOM/layout evidence of clipped H1 or CTA obstruction was found. Image natural dimensions and render dimensions loaded without errors.

Warning: the in-app Browser completed DOM, responsive-layout and interaction checks, but its screenshot capture command timed out twice. Therefore “no visible CLS” and subjective focal-point crop remain a final human screenshot check before any future image migration; no new image was introduced in this batch.

## Constraints

No visual safety conclusion is inferred from filenames alone. Private/real source assets remain blocked behind rights and pixel-level privacy review.
