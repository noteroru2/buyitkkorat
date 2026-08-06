# 13 — GSC Import Pipeline

## Script

`npm run import:gsc` → `scripts/import-gsc-export.ts`

```text
npx tsx scripts/import-gsc-export.ts --input path/to/export.csv --type queries|pages|dates|query-page --out docs/batch-5-.../data
```

Without `--input`: writes `gsc-import-manifest.json` with `NO_DATA_IMPORTED`.

## Validations

Encoding (BOM strip), column names, date range, filter metadata, filename/type mismatch, empty sheets, duplicate rows, totals, missing dimensions, privacy threshold notes, pre/post deployment classification hooks via deployment timeline config.

## Hard rule

**Do not** invent Query × Page by joining separate Queries and Pages aggregates. Native `query-page` export only.

## Outputs (when data present)

- `gsc-queries.csv` / `gsc-pages.csv` / `gsc-dates.csv` / `gsc-query-page.csv` (native only)
- `gsc-import-manifest.json`
- `gsc-data-quality-report.md`

## Current

`NO DATA IMPORTED` — no GSC exports in repository.
