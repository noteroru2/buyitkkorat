# 03 — Evidence Governance

Source of truth: `src/data/evidence.ts`

Publish gates: `publish && verified && consent && privacyReviewed && status===VERIFIED_FIRST_PARTY`

`EvidenceGallery` renders only `getPublishablePhotoEvidence()` — currently empty.
AI assets remain available only via `pilotImages` with disclosure captions on specific service pages.
