# 01 — Business Entity

## Central configuration

File: `src/data/site.ts`

| Block | Purpose |
|-------|---------|
| `STORE_LOCATION` | Ubon storefront (province verified; street/hours via env) |
| `SERVICE_AREA` | Nakhon Ratchasima service area; `isPhysicalBranch: false` |
| `CONTACT_CHANNELS` | Phone, LINE (verified); Facebook/Maps/GBP via env |
| `ANALYTICS` | GA4 + GSC tokens via env |
| `SITE` | Shared brand/URL/@id surface for components + schema |

## Verified values used

| Field | Value | Source |
|-------|-------|--------|
| Trade name | ร้านอำพล เทรดดิ้ง | Batch brief + legal alignment |
| Brand | WINNER IT | Existing `SITE.brand` |
| Legal name | บริษัท อำพล เทรดดิ้ง จำกัด | Existing production/repo |
| Store province | อุบลราชธานี | Batch business fact |
| Phone | 095-547-9408 / +66955479408 | Existing production/repo |
| LINE | @buyhub / line.me URL | Existing production/repo |
| Site URL | xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com | Existing |

## BLOCKED: VERIFIED DATA REQUIRED

| Field | Env var |
|-------|---------|
| Street address | `PUBLIC_STORE_STREET_ADDRESS` |
| Postal code | `PUBLIC_STORE_POSTAL_CODE` |
| Hours | `PUBLIC_STORE_HOURS` |
| Maps URL | `PUBLIC_GOOGLE_MAPS_URL` |
| GBP URL | `PUBLIC_GBP_URL` |
| Facebook URL | `PUBLIC_FACEBOOK_URL` |

## Wording rules enforced

- Korat = service area (ประเมิน / นัดรับ / จัดส่ง)
- Explicit denial of สาขา/หน้าร้าน/สำนักงานประจำโคราช
- Forbidden claim list extended in `site.ts` + `audit-lib.ts`
