# 12 — Security and Privacy

## Score: 66 / 100

## Proven good

| Control | Evidence |
|---------|----------|
| HTTPS | Enforced (HTTP 308 → HTTPS) |
| HSTS | `strict-transport-security: max-age=63072000` |
| No mixed content spotted | Homepage fetch HTTPS |
| No fake review schema | schema.ts has no AggregateRating |
| Privacy policy page | `/นโยบายความเป็นส่วนตัว` |
| Terms | `/ข้อกำหนดการใช้บริการ` |
| Buy / ownership policy | present |
| Secrets in HTML | None found in spot checks |
| Analytics PII leakage | N/A (no analytics sink) |

## Missing security headers (P2)

From `crawl-data/headers.json` / summary on homepage:

| Header | Value |
|--------|-------|
| Content-Security-Policy | null |
| X-Frame-Options | null |
| X-Content-Type-Options | null |
| Referrer-Policy | null |
| Permissions-Policy | null |

Recommend adding via `vercel.json` headers (report-only CSP first).

## Privacy gaps

| Item | Status |
|------|--------|
| Cookie policy | Missing |
| Consent banner | Missing (needed before GA) |
| Data retention statement detail | Partial in privacy page — deepen when forms exist |
| Form endpoint exposure | N/A |
| Source maps public | NOT PROVEN |
| Dependency vulns (`npm audit`) | NOT RUN this session (avoid blocking); mark NOT PROVEN |

## Out of scope (per brief)

No penetration testing, no exploit attempts, no credential dumping.
