# INDEX350 W1 Build Status

- Static architecture validation: PASS
- W1 release validation: PASS
- Synthetic 139-route crawl: PASS
- Relative import audit: PASS
- Real `npm run build` in this container: NOT ATTESTED because dependencies are not installed in this runtime.

Run on the real Windows repository:

```powershell
npm run validate:architecture
npm run validate:index350:w1
npm run build
npm run audit:architecture-build
```

Expected build target: **139 pages**, with **138 indexable** and sitemap target **138**.
