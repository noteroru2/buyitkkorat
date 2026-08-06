# 02 — Environment Status

Secrets are never printed. Status only.

| Variable | Status | Notes |
|----------|--------|-------|
| `PUBLIC_GA_MEASUREMENT_ID` | **MISSING** | Empty in `.env.example`; not set locally; not observed on Production |
| `PUBLIC_GSC_VERIFICATION` | **MISSING** | Empty in `.env.example`; no meta on Production |
| `PUBLIC_LEAD_ENDPOINT` | **MISSING** / **NOT REQUIRED** until backend exists | Documented in `.env.example` |
| Anti-spam env | **NOT PRESENT** | Required before enabling form |
| Email/Webhook provider env | **NOT PRESENT** | Required before enabling form |
| Production Vercel env | **ACCESS NOT AVAILABLE** | Cannot list Production env via this session |
| Preview / Development | Local unset | Same placeholders |

## Runtime validation

| Check | Result |
|-------|--------|
| GA ID format | `G-[A-Z0-9]{6,14}` via `isValidGa4MeasurementId` |
| Placeholder rejection | Rejects `G-XXX…`, `example`, `placeholder` |
| Type defs | `src/env.d.ts` includes GA, GSC, LEAD |
| `.env` committed | No |

## Activation gates

- GA4: report **BLOCKED: VERIFIED GA4 MEASUREMENT ID REQUIRED** until Production network shows gtag collect after Accept
- GSC: report **BLOCKED: GSC VERIFICATION TOKEN OR PROPERTY ACCESS REQUIRED** until token + property evidence
- Lead: report **BLOCKED: VERIFIED LEAD CAPTURE BACKEND REQUIRED** until adapter isConfigured with verified destination
