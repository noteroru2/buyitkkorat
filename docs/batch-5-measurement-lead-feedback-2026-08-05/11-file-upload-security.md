# 11 — File Upload Security Architecture

**Status:** Upload **disabled by default**. Do not enable without full stack.

## Minimum requirements before enable

| Control | Requirement |
|---------|-------------|
| Formats | Image allowlist only (e.g. JPEG/PNG/WebP) |
| MIME | Server inspect Content-Type + magic bytes |
| Signatures | File signature inspection |
| Counts / sizes | Max files, per-file size, request size |
| Processing | Recompress; strip EXIF/metadata |
| Malware | Scan only if real service exists — **do not claim** otherwise |
| Storage | Private bucket; signed short-lived URLs |
| Expiration / retention | Documented; default not permanent |
| Deletion | Documented workflow |
| URLs | No public predictable paths; no original filename exposure |
| Analytics | No image/PII capture |
| Indexing | Noindex for private objects |

## Current code

`LEAD_FIELD_LIMITS.maxFiles = 0`, `maxFileBytes = 0`, error code `UPLOAD_DISABLED`.
