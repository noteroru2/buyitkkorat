# INDEX 350 — W2 Production Release Gate

## Scope

Production gate for the 50 source-released W2 Series/Model pages.

## Baseline

| Metric | Required |
|---|---:|
| Live routes | 189 |
| Indexable routes | 188 |
| Noindex routes | 1 |
| Sitemap URLs | 188 |
| W2 routes | 50 |
| Series | 30 |
| Model | 20 |

## Evidence statement

W2 was source-released under `MANUAL_APPROVAL_OVERRIDE`. Real W1 performance is **not attested**. This gate must not be described as evidence-backed by W1 GSC.

## Route checks

Each W2 URL requires HTTP 200, self-canonical, index/follow, exactly one H1, at least two images with alt text, LINE CTA, at most one BreadcrumbList, sitemap inclusion, and at least two inbound discovery paths.

## State machine

`SOURCE_RELEASED → PREDEPLOY_PENDING → PREDEPLOY_READY → PRODUCTION_PENDING → PRODUCTION_VERIFIED → OBSERVATION_ACTIVE`

Any hard failure becomes `BLOCKED`.

`PRODUCTION_VERIFIED` starts observation only. W3 remains locked and manual-review-only.
