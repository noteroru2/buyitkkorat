# ARCHITECTURE BATCH 8 — Navigation / Header / Footer / Discovery Architecture

## Goal

Expose the architecture built in Batches 0–7 through a bounded global navigation system without turning Header/Footer into a sitewide link dump.

## Release state

- Live routes: **90 → 90**
- Indexable routes: **89 → 89**
- Header primary groups: **6**
- Footer columns: **5**
- Brand/Series candidates exposed: **0**
- Future Guide candidates exposed: **0**
- Virtual hrefs: **0**
- New live routes: **0**

## Header

Six primary choices:

1. รับซื้อสินค้า
2. Apple
3. บริษัท / ยกล็อต
4. พื้นที่บริการ
5. วิธีขาย
6. บทความ

`Apple` is a **non-link group heading**. It links directly to live iPhone/MacBook/iPad/Apple Watch/iMac-Mac mini owners and never emits a virtual Apple hub.

## Header rules

- maximum 6 primary groups
- maximum 6 links inside one submenu
- only LIVE + INDEX hrefs
- no Brand/Series/Guide candidates
- no article-child enumeration
- one primary CTA: `/วิธีประเมินราคา`

## Footer

Five bounded columns:

1. บริการหลัก
2. Apple และอุปกรณ์
3. บริษัทและยกล็อต
4. พื้นที่และวิธีขาย
5. ข้อมูลและความน่าเชื่อถือ

The Footer intentionally does **not** list:
- all 11 location pages,
- all 15 articles,
- all computer component pages,
- future Brand/Series/Model pages.

Those remain discoverable through their proper Hub/contextual graph.

## Discovery hierarchy

```text
Global Header / Footer
        ↓
Core / Local / Guide / Journey owner
        ↓
runtime parent-child / contextual related graph
        ↓
specific child page
```

This keeps global navigation stable even if the site later grows to 150–300+ URLs.

## Tier A rule

Every current Tier A indexable route has at least one global discovery path.

The Header/Footer/Homepage do not need to expose every Tier B/C URL.

## Candidate safety

Batch 6:
- Brand candidates remain HOLD
- Series candidates remain HOLD
- Model candidates remain 0

Batch 7:
- Future Guide candidates remain HOLD

Batch 8 validator fails if any candidate URL appears in Header, Footer or Homepage discovery before its release.

## Components

- `ArchitectureHeader.astro`
- `ArchitectureFooter.astro`
- `ArchitectureDiscoveryNav.astro`

The components are intentionally style-light and use CSS variables/inherited colors so the real repository can skin them without changing navigation ownership.

## Real repository integration

Because the actual website layout source is not present in this overlay, Batch 8 does not blindly replace an existing Header/Footer.

Run:

```bash
node scripts/apply-navigation-architecture.mjs --dry-run --layout=src/layouts/<shared-layout>.astro
```

If the selected layout already has an unmanaged Header/Footer, the installer returns:

```text
PASS_WITH_REVIEW_REQUIRED
```

and refuses to duplicate/replace it automatically.

If it has no existing shell, the installer can insert the managed components safely and idempotently.

## Why this matters for future expansion

When Brand/Series/Model pages start going live, they should be discovered from:
- their parent Hub/Brand/Series,
- contextual related sections,
- relevant Guide pages,

not by continuously enlarging the global Header/Footer.

That preserves crawl clarity and UX as URL count grows.
