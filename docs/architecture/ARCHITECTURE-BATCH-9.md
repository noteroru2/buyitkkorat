# ARCHITECTURE BATCH 9 — Sitemap / Canonical / Schema / Index Control Integration

## Goal

Make search-engine-facing technical signals use the same ownership model as Architecture Batches 0–8.

## Release state

- Live routes: **90**
- Indexable routes: **89**
- Noindex routes: **1**
- Sitemap-eligible URLs: **89**
- Canonical profiles: **89**
- WebPage schema profiles: **89**
- BreadcrumbList profiles: **88** (all indexable routes except homepage)
- New live routes: **0**
- Destructive index changes: **0**

## Single source of truth

`src/config/site-architecture.json` remains authoritative.

Batch 9 derives:

```text
route registry
├── index/noindex
├── canonical owner
├── sitemap membership
├── robots meta
└── architecture-safe structured data
```

No separate spreadsheet or hard-coded sitemap is allowed to become a competing owner.

## Sitemap

Exact rule:

```text
LIVE + INDEX + valid canonical owner = sitemap
```

Therefore expected sitemap membership is **89 URLs**.

Excluded:
- `/404`
- virtual Apple hub
- Brand candidates
- Series candidates
- future Guide candidates
- any future HOLD/PLANNED node

The generator deliberately omits:
- `lastmod` when no real source timestamp is available
- `changefreq`
- `priority`

This avoids manufactured freshness signals.

Safe audit generation:

```bash
node scripts/generate-architecture-sitemap.mjs
```

Production generation is explicit:

```bash
node scripts/generate-architecture-sitemap.mjs --output=public/sitemap.xml
```

The generator refuses to overwrite an unmanaged existing sitemap.

## Canonical

All 89 currently indexable URLs are self-canonical in the registry.

Canonical rules:
- strip query/hash via pathname normalization
- use one configured site origin
- only LIVE + INDEX routes auto-emit canonical
- noindex utility/error routes do not auto-emit canonical
- future candidates cannot emit canonical until released

## Robots/index control

```text
INDEX   → index,follow
NOINDEX → noindex,follow
```

Unreleased candidates and virtual nodes have no route, so they have no robots/canonical/sitemap/schema output.

## Structured data

Automatically safe from architecture:

- `WebSite` — homepage only
- `WebPage` — all indexable routes
- `BreadcrumbList` — runtime ownership chain
- `ItemList` — released hub pages with at least two direct children

Batch 9 does **not** manufacture:
- Organization
- LocalBusiness
- FAQPage
- Article

Those native schemas require real source content/business facts and existing-template review.

This is especially important for LocalBusiness: Batch 9 never invents address, phone, hours, price range, review rating or coordinates.

## Duplicate schema protection

The installer scans the selected layout for:
- canonical
- robots meta
- JSON-LD
- common existing SEO-head components

If found, it returns `PASS_WITH_REVIEW_REQUIRED` and refuses to insert a duplicate `ArchitectureSeoControl`.

The correct action is to consolidate the existing implementation around the architecture registry, not layer a second SEO system on top.

## Breadcrumb consistency

Visible breadcrumb and schema breadcrumb use the same runtime parent source:

```text
getRuntimeBreadcrumbs()
```

Examples:

```text
Home → Computer → RAM
Home → พื้นที่ → ปากช่อง
Home → บทความ → Guide
```

Apple pages remain safely flattened until a real Apple hub is released.

## Future release rule

When a Brand / Series / Model / Guide candidate becomes LIVE in a future batch:

1. add it to the route registry,
2. pass ownership/content release gate,
3. set canonical owner,
4. mark INDEX only if approved,
5. sitemap membership then derives automatically,
6. Breadcrumb/WebPage/ItemList schema can then derive automatically.

No candidate gets indexed merely because it exists in a planning registry.
