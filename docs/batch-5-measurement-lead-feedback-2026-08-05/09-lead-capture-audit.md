# 09 — Lead Capture Audit

| Capability | Status |
|------------|--------|
| HTML form (Production) | **NOT PRESENT** (by design) |
| API route / serverless lead endpoint | **NOT PRESENT** |
| Webhook / email provider | **NOT PRESENT** |
| Database / object storage | **NOT PRESENT** |
| File upload | **NOT PRESENT** / disabled by default |
| Spam protection | **NOT PRESENT** (required before enable) |
| Rate limiting | **NOT PRESENT** (required before enable) |
| CAPTCHA/Turnstile | **NOT PRESENT** |
| Server validation | **FOUNDATION ONLY** (`validateLeadPayload`) |
| Privacy consent field | Designed in payload |
| Retention policy | **NOT PRESENT** (required before storage) |
| Error monitoring | Sitewide only; no lead pipeline |
| Admin notification | **NOT PRESENT** |
| Lead status workflow | **NOT PRESENT** |
| Overall | **FOUNDATION ONLY** |

## Fake submit / success

| Check | Result |
|-------|--------|
| Submit button on valuation UX | Absent |
| “ส่งสำเร็จ” copy | Audit fails if present |
| `valuation_submit` as `data-event` CTA | Audit critical |

## Verdict

`BLOCKED: VERIFIED LEAD CAPTURE BACKEND REQUIRED` for Production form enablement.
