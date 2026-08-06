# 23 — Findings Update

| Finding ID | Severity | Category | Status | Notes |
|------------|----------|----------|--------|-------|
| B5-GA4-ID | High | Measurement | **BLOCKED** | Owner must supply Measurement ID |
| B5-GA4-ADMIN | Medium | Measurement | **BLOCKED** | Key events need Admin |
| B5-GSC-TOKEN | High | Search | **BLOCKED** | Token/property access |
| B5-LEAD-BACKEND | High | Lead | **BLOCKED** | No verified backend |
| B5-DEPLOY-SHA | Low | Ops | **PARTIALLY CLOSED** | Content verified; SHA not attested |
| B5-EVENT-TAXONOMY | Medium | Measurement | **CLOSED** | Code taxonomy + allowlist |
| B5-CONSENT-FOUNDATION | Medium | Privacy | **CLOSED** | Runtime foundation from Batch 1; re-verified gates |
| B5-FAKE-FORM | Critical | Trust | **CLOSED** | Still no fake submit/success |
| B5-GSC-PIPELINE | Medium | Search | **CLOSED** | Offline import ready; no data |
| B5-VALUATION-SUBMIT-GATE | High | Measurement | **CLOSED** | Backend flag required |

## Separation

| Layer | State |
|-------|-------|
| Code ready | Yes |
| Environment configured | No (GA/GSC/Lead) |
| Production live (Batch 5 code) | After deploy |
| Runtime verified (GA) | N/A until ID |
| Property/admin configured | No |
| Business outcome measurable | Not yet |
