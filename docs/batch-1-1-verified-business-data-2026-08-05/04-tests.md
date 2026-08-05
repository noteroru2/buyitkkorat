# 04 — Tests

| Suite | Result |
|-------|--------|
| `npm run build` | PASS — 90 pages |
| `npm run check` | PASS — 0 errors |
| `npm run audit:all` | PASS |
| `audit:batch1-protection` | PASS (address/hours/Maps/FB/schema) |
| `audit:security-headers` | PASS (config + production) |

## New assertions in batch1 protection

- Full address + hours on About/Contact
- Maps/Facebook CTAs + correct URLs + event names
- LocalBusiness postal 34000, Ubon region, hasMap, Mo-Su hours
- Organization sameAs includes Facebook
- No Korat LocalBusiness address
- GA/GSC still absent when unset
