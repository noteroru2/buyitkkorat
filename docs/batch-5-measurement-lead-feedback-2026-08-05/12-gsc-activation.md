# 12 — GSC Activation

## Status

`BLOCKED: GSC VERIFICATION TOKEN OR PROPERTY ACCESS REQUIRED`

| Check | Status |
|-------|--------|
| Token in env | **MISSING** |
| Meta tag hook | Ready when `PUBLIC_GSC_VERIFICATION` set |
| Meta on Production | Absent |
| PROPERTY VERIFIED | **NOT PROVEN** |
| Property access | **ACCESS NOT AVAILABLE** |
| Sitemap submitted | **NOT PROVEN** |
| Sitemap read | **NOT PROVEN** |

## Always-on checks (no token needed)

| Check | Expected |
|-------|----------|
| Sitemap HTTP | 200 |
| robots.txt Sitemap line | Declares site sitemap |
| Canonical hostname | Punycode Production host |

## Owner action

1. Search Console → add URL-prefix or Domain property for Production host
2. Choose HTML tag verification → copy token into Vercel `PUBLIC_GSC_VERIFICATION`
3. Deploy → confirm meta present
4. Complete verification in GSC UI
5. Submit sitemap URL from robots.txt
6. Do not invent tokens; do not claim verified from meta alone
