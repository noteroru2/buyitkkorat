# 20 — Performance Guardrails

| Rule | Status |
|------|--------|
| GA must not block render | Async load after consent when ID present |
| No Production dashboard embed | None |
| No client chart libraries added | None |
| Import/report scripts | Dev-only (`tsx` scripts) |
| Field CWV | **NOT PROVEN** without CrUX/RUM |
| Hydration / console errors | Audited via Production spot checks |
| Routes | 94 preserved |

Batch 5 adds minimal JS (taxonomy validation server-side; client dispatcher already existed).
