# Apply ARCHITECTURE BATCH 1

Prerequisite: ARCHITECTURE BATCH 0 is already present in the repository.

Copy/merge the Batch 1 overlay into the repository root, then run:

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/apply-core-hub-architecture.mjs --dry-run
node scripts/apply-core-hub-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
npm run build
```

Important: the runtime installer edits only audited `src/content/services/*.md` files by adding/replacing a managed Markdown block. It does not edit frontmatter, canonical logic, robots, sitemap, redirects, route slugs, or the local-area pages.
