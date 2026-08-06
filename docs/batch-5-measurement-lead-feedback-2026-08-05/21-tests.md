# 21 — Tests

## Automated

| Suite | Result |
|-------|--------|
| `npm run build` | Pass — 94 pages |
| `npm run check` | 0 errors |
| `npm run audit:all` | Pass (includes `audit:batch5`) |
| `audit:batch1`–`batch4` | Pass (regression) |

## `audit:batch5` coverage

- Invalid GA enablement inconsistency
- Lead adapter fail-closed / productionForm false
- privacyConsent validation
- taxonomy includes `valuation_submit`
- No gtag.js in HTML when disabled
- No GSC meta when token missing
- No fake success copy / no `valuation_submit` CTA markup
- Route count floor
- Backend gate string present in Analytics dispatcher

## Manual / fixture

- `test-fixtures/ga-id-cases.json` — valid/invalid ID cases for documentation
- GSC import with no input → `NO_DATA_IMPORTED`
