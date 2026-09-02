# Apply ARCHITECTURE BATCH 0

Copy the `src`, `scripts`, and `docs` folders from this overlay into the repository root.

Then run:

```bash
node scripts/validate-site-architecture.mjs
```

This overlay only **adds** files. It does not overwrite existing pages, redirects, robots, sitemap, canonical logic, or content.

If the repository already contains one of these exact new paths, review before overwriting.
