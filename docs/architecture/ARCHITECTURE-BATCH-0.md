# ARCHITECTURE BATCH 0 — URL Ownership & Site Architecture Baseline

## Status

**IMPLEMENTED AS A SAFE ARCHITECTURE REGISTRY / OVERLAY**

This batch deliberately does **not** change live URLs, canonical tags, robots, sitemap inclusion, redirects, or page copy. It creates the source of truth needed before those changes are made.

## Immutable baseline

- Live routes: **89**
- Indexable routes: **88**
- Noindex routes: **1** (`/404`)
- Pages with exactly one inbound link in the prior audit: **36**
- Pages with zero contextual inbound links in the prior audit: **40**
- Cannibalization decisions: **GSC query→page evidence required**

## What Batch 0 changes architecturally

### 1. Core commercial hubs become first-class Homepage children

The recommended ownership tree treats Notebook, Computer, Mobile, Camera, Gaming and B2B/bulk as primary commercial hubs rather than hiding all authority under `/รับซื้อสินค้าไอที`.

### 2. Apple is removed from Mobile ownership

The following live routes now point to the **virtual Apple hub** in the registry:

- `/รับซื้อ-iphone-โคราช`
- `/รับซื้อ-ipad-โคราช`
- `/รับซื้อ-macbook-โคราช`
- `/รับซื้อ-imac-mac-mini-โคราช`
- `/รับซื้อ-apple-watch-โคราช`

The virtual hub has future URL `/รับซื้อ-apple-โคราช`, but **Batch 0 never emits a live link to it**.

### 3. Local geography gets a province/local parent

All district/location pages point to `virtual:local-hub` instead of treating `/พื้นที่/เมืองนครราชสีมา` as the parent of unrelated districts. The future route is `/พื้นที่`.

### 4. Notebook condition pages belong to Notebook

- `/รับซื้อโน๊ตบุ๊คจอแตก-โคราช`
- `/รับซื้อโน๊ตบุ๊คเกมมิ่ง-โคราช`
- `/รับซื้อโน๊ตบุ๊คเปิดไม่ติด-โคราช`
- `/รับซื้อโน๊ตบุ๊คเสีย-โคราช`

Recommended parent: `/รับซื้อโน๊ตบุ๊ค-โคราช`.

### 5. Android brand hierarchy is no longer flat

OPPO, Samsung, vivo and Xiaomi/Redmi/POCO roll up through `/รับซื้อโทรศัพท์-android-โคราช`, then to `/รับซื้อโทรศัพท์มือถือ-โคราช`.

### 6. Seller journey gets its own path

`/วิธีขายสินค้า` becomes the ownership parent for:

- `/วิธีประเมินราคา`
- `/ส่งสินค้าไอทีมาประเมิน`
- `/บริการรับซื้อถึงที่โคราช`

## Migration queue

There are **35** parent/ownership differences between the audited structure and the recommended structure. They are **recorded only**, not executed.

By cluster:

- APPLE: 5
- B2B: 1
- CAMERA: 1
- COMPUTER: 1
- GAMING: 1
- LOCATION: 11
- MOBILE: 5
- NOTEBOOK: 5
- SELLER-JOURNEY: 4
- UTILITY: 1

## Files added

- `src/config/site-architecture.json` — canonical machine-readable registry
- `src/config/site-architecture.ts` — typed Astro/TypeScript accessors
- `scripts/validate-site-architecture.mjs` — architecture invariant validator
- `docs/architecture/url-ownership-baseline.csv` — human-reviewable ownership table
- `docs/architecture/parent-migration-queue.csv` — 35 queued parent changes; none executed in Batch 0
- `docs/architecture/ARCHITECTURE-BATCH-0.md` — this report

## Strict rules for Batch 1+

1. Do not make redirects, noindex or cross-canonical changes from similarity alone.
2. Do not link to `virtual:*` nodes until the corresponding real route exists and passes release gates.
3. Every new model/condition/local page must have exactly one primary ownership parent.
4. Every new indexable page must have at least two planned internal discovery paths.
5. District pages must never use another unrelated district as their semantic parent.
6. Apple device pages must not use the generic Mobile hub as their primary semantic parent.
7. GSC-gated routes require query→page evidence before consolidation.

## Validation

Run from repository root:

```bash
node scripts/validate-site-architecture.mjs
```

Expected Batch 0 invariant:

```text
Live routes: 89
Indexable: 88
Noindex: 1
VERDICT: PASS
```

Source-path warnings are advisory because some Astro routes may be generated indirectly. Architecture invariant errors are blocking.
