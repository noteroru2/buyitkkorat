# 18 — Analytics QA

## Without Measurement ID (current Production / local build)

| Scenario | Expected |
|----------|----------|
| Consent denied/accept/reject | Preference stored; **no** gtag.js |
| Page view / CTA gtag | No GA network |
| Console | No analytics errors from missing ID |

## With valid test ID (non-Production / Preview only)

| Scenario | Expected |
|----------|----------|
| Before Accept | Default denied; no collect (or no script load per implementation) |
| After Accept | One page_view; CTA events once per click (dedupe) |
| After Reject | No new GA cookies / events |
| Rapid clicks | Dedupe within 400ms |
| New tab | Independent session per browser rules |
| `valuation_submit` | Blocked without `__WINNER_LEAD_SUBMIT_OK__` |
| PII params | Stripped by allowlist / blocked regex |
| debug_mode | Off on Production builds |

## Evidence

See `evidence/` after Production probes. Do not paste full Measurement IDs in screenshots when avoidable.
