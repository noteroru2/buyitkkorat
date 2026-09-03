# APPLY — EXPANSION RELEASE ROUND 1

Prerequisite: Architecture Batch 0–10 fully applied.

## Released URLs

- `/รับซื้อโน๊ตบุ๊ค-asus-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-dell-โคราช`
- `/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช`

## Expected route state

```text
Live: 94
Indexable: 93
Noindex: 1
Sitemap: 93
Models released: 0
Round 2: LOCKED
```

## Validate

```bash
node scripts/validate-expansion-release-round-1.mjs
node scripts/run-architecture-quality-gate.mjs
node scripts/generate-architecture-sitemap.mjs --replace-managed
npm run build
node scripts/audit-production-build-architecture.mjs --dist=dist
```

Then verify production:
- all 4 new URLs HTTP 200,
- self-canonical,
- `index,follow`,
- in sitemap,
- breadcrumb parent chain correct,
- Notebook hub links to ASUS and Dell,
- ASUS links to ROG,
- Dell links to Latitude.

## Observation

Do not start Round 2 immediately after deployment.

Collect:
- indexation status,
- GSC query/page impressions,
- brand vs parent Notebook query ownership,
- ROG/Latitude vs Brand parent overlap,
- conversion/lead quality if available.

No invented GSC metrics.
