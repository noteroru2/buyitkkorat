# ARCHITECTURE BATCH 5 — Local Area Architecture & Korat Authority Hub Release

## Release decision

Batch 5 converts the planned local parent into one real indexable route:

- **NEW:** `/พื้นที่`
- Live routes: **89 → 90**
- Indexable routes: **88 → 89**
- Existing local-area URLs changed: **0**
- Existing local canonicals changed: **0**
- Redirects/noindex decisions: **0**
- New district expansion: **0**

## Ownership

`/พื้นที่` owns broad Korat/Nakhon Ratchasima area-discovery intent.

All 11 existing location pages now have:

```text
/ → /พื้นที่ → current area
```

No district is used as the parent of another unrelated district.

## Homepage authority flow

Before:

```text
Homepage → /พื้นที่/เมืองนครราชสีมา
```

After:

```text
Homepage → /พื้นที่ → 11 released area pages
```

This stops the Mueang page from acting as a province-wide pseudo-hub.

## Related-area graph

Local pages do not link all-to-all. Each area has 3–5 explicit related-area targets in
`src/config/local-area-release.json`.

The relationships are an internal-navigation graph only; they are not statements of exact distance.

## Index policy

The new `/พื้นที่` route is:

- INDEX
- self-canonical
- parent = Homepage
- Tier A
- LOCATION cluster

All 11 existing area pages stay indexable and self-canonical.

## GSC / cannibalization policy

Batch 5 does not merge or noindex area pages.

The `LOCAL_AREA_FAMILY` triage owner changes from `virtual:local-hub` to `/พื้นที่`, but
any consolidation still requires fresh GSC query→page evidence plus a local-content uniqueness review.

## Sitemap expectation

If the repository uses automatic Astro sitemap generation, the sitemap should increase by exactly
one indexable URL after build: `/พื้นที่`.

If sitemap generation is manual, add `/พื้นที่` only; do not remove existing area URLs in Batch 5.

## Quality gates

Run all validators through Batch 5, then build the real repository.
