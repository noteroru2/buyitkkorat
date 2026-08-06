# 19 — Security and Privacy

| Control | Status |
|---------|--------|
| CSP vs GA4 | Compatible when ID added (gtag origins already considered in prior batches) |
| HSTS / Referrer-Policy / Permissions-Policy / X-CTO / frame | Preserved from Batch 1 |
| API lead exposure | None |
| Rate limit / CORS / CSRF for leads | N/A until endpoint |
| Env leakage / client secrets | No secrets in bundle for GA/GSC/lead |
| PII in HTML/analytics/URLs | Forbidden by allowlist + audits |
| Cookie attributes | Consent storage first-party preference only |
| Data retention docs | Required before lead storage — open blocker |

No Production penetration testing performed.
