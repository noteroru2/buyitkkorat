# 05 — Measurement Plan

Business: WINNER IT / ร้านอำพล เทรดดิ้ง — lead intent via LINE, phone, Facebook; store verification via Maps; valuation prep via checklist; web lead only after backend.

| Business question | Event | Trigger | Allowed params | Conversion | Tier | Consent | Dedupe | Validation | Reporting use |
|-------------------|-------|---------|----------------|------------|------|---------|--------|------------|---------------|
| Did user start LINE chat? | `line_click` | LINE CTA click | page_path, page_type, cta_location, contact_method, … | Primary | primary | analytics | 400ms same key | Network + custom event | Lead volume |
| Did user call? | `phone_click` | tel: click | same | Primary | primary | analytics | same | same | Lead volume |
| Did user open Facebook? | `facebook_click` | FB CTA | same | Primary | primary | analytics | same | same | Lead volume |
| Did user open Maps? | `maps_click` | Maps CTA | same | Secondary | secondary | analytics | same | same | Visit intent |
| Did user start valuation prep? | `valuation_start` | Checklist / prep CTA | same | Secondary | secondary | analytics | same | same | Funnel |
| Did user go to contact? | `contact_click` | Contact / service CTA map | same | Secondary | secondary | analytics | same | same | Funnel |
| Did backend accept lead? | `valuation_submit` | Server success flag only | same | Primary (future) | future_backend | analytics | once per success | Must not fire from LINE | True leads |
| Evidence engagement? | `evidence_view` | Gallery (optional) | + evidence_type | Supporting | supporting | analytics | same | Use sparingly | Trust UX |
| Process engagement? | `service_process_view` | Process UI (optional) | + component_name | Supporting | supporting | analytics | same | Use sparingly | Trust UX |

## Forbidden parameters (never send)

name, phone, email, LINE ID, Facebook account, product free-text, typed model, Serial, IMEI, exact address, images, customer filenames, PII URLs, non-allowlisted query strings, user-generated text.
