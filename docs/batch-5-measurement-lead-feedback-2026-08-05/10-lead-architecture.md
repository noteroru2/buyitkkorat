# 10 — Lead Architecture Design

Layers (future enablement):

1. Presentation — guided checklist + external CTAs today; form UI only after gate
2. Client validation — length/required/privacy consent
3. Server validation — re-validate; never trust client
4. Anti-spam — Turnstile/CAPTCHA or equivalent
5. Rate limiting — per IP / token
6. Lead delivery — adapter (`LeadCaptureAdapter`)
7. Optional secure storage — only with retention policy
8. Notification — staff LINE/email
9. Audit logging — no secrets/PII in client logs
10. Retention/deletion — documented procedure
11. Error handling — fail closed
12. Analytics — `valuation_submit` only after server success

## Types (`src/data/leadCapture.ts`)

- `LeadCaptureAdapter`, `LeadPayload`, `LeadResult`, `LeadError`, `LeadChannel`
- Default: `UnconfiguredLeadAdapter` → always `BACKEND_NOT_CONFIGURED`
- `getLeadCaptureAdapter()` returns unconfigured until real HTTP adapter wired

## Payload fields (future)

product category, brand/model, spec summary, condition, defects, accessories, warranty, province, preferred contact method, contact value, privacyConsent, clientRequestId (non-PII).

## Hard rules

- No Production fake endpoint
- No password / Apple ID / Microsoft password fields
- Serial/IMEI avoid or mask
- File upload default **off** (`maxFiles: 0`)
- No PII in analytics
- Field length + payload byte limits defined

## Channel strategy until backend exists

LINE primary · Phone / Facebook alternatives · Checklist preparation only.
