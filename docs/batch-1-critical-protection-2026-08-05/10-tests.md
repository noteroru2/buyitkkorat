# 10 — Tests

## Commands run (local)

| Command | Result |
|---------|--------|
| `npm run build` | PASS — 90 pages |
| `npm run check` | PASS — 0 errors |
| `npm run audit:all` | PASS |
| `npx tsx scripts/audit-security-headers.ts` | (run at closeout) |

## New / updated suites

- `scripts/audit-batch1-protection.ts`
- `scripts/audit-schema.ts` (LocalBusiness Ubon rules)
- `scripts/audit-claims.ts` / `audit-lib.ts` forbidden phrases
- `scripts/audit-security-headers.ts`

## Coverage highlights

- No สาขาโคราช / หน้าร้านโคราช / สำนักงานโคราช (non-negated)
- No Korat LocalBusiness address
- About/Contact include Ubon + Korat service wording
- Cookie policy route built
- Facebook CTA absent without URL
- GA absent without measurement ID
- No PII param keys in shipped JS
