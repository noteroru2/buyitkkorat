# ARCHITECTURE BATCH 2 — Parent/Child Runtime Integration & Breadcrumb Ownership

This batch converts the Batch 0 ownership registry and Batch 1 hub graph into runtime UI behavior.

## Strict safety rules

- No URL rename.
- No redirect change.
- No canonical change.
- No robots/noindex change.
- No sitemap change.
- No Markdown frontmatter mutation.
- Never emit virtual Apple or Local hub URLs.
- Retire Batch 1 Markdown managed blocks only after the runtime layout integration is ready, preventing duplicate related-link sections.

## Apply

Batch 0 and Batch 1 must already exist in the repository.

Copy the files in this overlay to the repository root, then run:

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/validate-parent-child-runtime.mjs
node scripts/apply-parent-child-runtime.mjs --dry-run
node scripts/apply-parent-child-runtime.mjs
node scripts/validate-parent-child-runtime.mjs
npm run build
```

The installer auto-detects a shared Astro layout only when exactly one safe candidate contains one `<main>` and a `<slot>`. If the repository has multiple layouts, do not guess; pass the actual shared content layout explicitly:

```bash
node scripts/apply-parent-child-runtime.mjs --dry-run --layout=src/layouts/BaseLayout.astro
node scripts/apply-parent-child-runtime.mjs --layout=src/layouts/BaseLayout.astro
```

## Runtime ownership behavior

- Core/support route: `HOME → live parent(s) → current`.
- Article: `HOME → /บทความ → article`.
- Apple member: `HOME → current` until the real Apple hub is released.
- Location: `HOME → current` until the real Local hub is released in Batch 5.
- Unknown/utility routes not present in the architecture registry render no Batch 2 breadcrumb/related block.

## Related links

Priority is deterministic and capped:

1. direct children,
2. core-hub peer links or Apple family bridge,
3. siblings under the same live parent.

This deliberately avoids all-to-all internal linking.
