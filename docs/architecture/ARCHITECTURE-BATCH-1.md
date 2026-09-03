# ARCHITECTURE BATCH 1 — Core Hub Architecture Release

## Verdict

**READY FOR SAFE RUNTIME APPLY**

Batch 1 turns the Batch 0 ownership registry into deterministic, contextual hub/spoke links without changing URLs, canonicals, robots, sitemap membership, metadata, or frontmatter schema.

## Immutable SEO controls

- Live route baseline remains **89**.
- Indexable route baseline remains **88**.
- `/404` remains the only `NOINDEX` route in the Batch 0 registry.
- No redirect is created.
- No cross-canonical is created.
- No slug is renamed.
- No planned/virtual URL is emitted as a hyperlink.
- Cannibalization consolidation remains GSC-gated.

## Eight live release pillars

1. `/รับซื้อสินค้าไอที` — catalog / other-product hub
2. `/รับซื้อโน๊ตบุ๊ค-โคราช` — notebook hub
3. `/รับซื้อคอมพิวเตอร์-โคราช` — computer hub
4. `/รับซื้อโทรศัพท์มือถือ-โคราช` — mobile hub
5. `/รับซื้อกล้อง-โคราช` — camera hub
6. `/รับซื้อเครื่องเกม-โคราช` — gaming hub
7. `/รับซื้อสินค้าไอทียกล็อต` — B2B / bulk hub
8. `/วิธีขายสินค้า` — seller-journey hub

The release gives each hub a deterministic child set and a small, curated peer set. It does **not** build an all-to-all link mesh.

## Runtime behavior

`node scripts/apply-core-hub-architecture.mjs` inserts an idempotent managed block at the end of eligible service Markdown files:

```text
<!-- ARCHITECTURE:BATCH1:START -->
...
<!-- ARCHITECTURE:BATCH1:END -->
```

The block can contain:

- Parent → child discovery links on hubs.
- Child → parent ownership links.
- Up to 3–4 sibling/peer discovery links.
- Apple-family bridge links while the real Apple hub is not live.

Running the installer again replaces the previous managed block instead of duplicating links.

## Notebook correction

The four notebook condition pages now receive their contextual ownership link from the Notebook hub:

- `/รับซื้อโน๊ตบุ๊คจอแตก-โคราช`
- `/รับซื้อโน๊ตบุ๊คเกมมิ่ง-โคราช`
- `/รับซื้อโน๊ตบุ๊คเปิดไม่ติด-โคราช`
- `/รับซื้อโน๊ตบุ๊คเสีย-โคราช`

This fixes the old architecture where those pages were effectively grouped under the generic IT hub.

## Mobile correction

The runtime hierarchy is:

```text
รับซื้อโทรศัพท์มือถือ
├─ รับซื้อโทรศัพท์ Android
│  ├─ OPPO
│  ├─ Samsung
│  ├─ vivo
│  └─ Xiaomi / Redmi / POCO
├─ รับซื้อแท็บเล็ต
└─ รับซื้อโทรศัพท์จอแตก
```

Apple is deliberately not placed under Mobile ownership.

## Apple bridge — no fake hub release

Batch 0 planned `virtual:apple-hub` with future URL `/รับซื้อ-apple-โคราช`. Batch 1 still does **not** emit that URL because the audited route inventory did not contain a live Apple hub.

Instead these five live Apple pages form a controlled family bridge:

- `/รับซื้อ-iphone-โคราช`
- `/รับซื้อ-macbook-โคราช`
- `/รับซื้อ-ipad-โคราช`
- `/รับซื้อ-imac-mac-mini-โคราช`
- `/รับซื้อ-apple-watch-โคราช`

This removes Mobile as the semantic parent without introducing a broken/planned URL.

## Local hub state

`virtual:local-hub` remains **DEFERRED_TO_BATCH_5**.

Batch 1 does not make `/พื้นที่/เมืองนครราชสีมา` the parent of unrelated districts and does not invent a `/พื้นที่` route without seeing the real area routing/layout schema.

## Apply

From repository root, after Batch 0 files are present:

```bash
node scripts/validate-site-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
node scripts/apply-core-hub-architecture.mjs --dry-run
node scripts/apply-core-hub-architecture.mjs
node scripts/validate-core-hub-architecture.mjs
npm run build
```

The apply command is intentionally blocking when an audited source file is missing. A source-tree mismatch must be investigated rather than silently skipped.

## Acceptance criteria

- Batch 0 registry validation: PASS.
- Batch 1 core validator: PASS.
- 8 live release pillars exist and remain self-canonical/indexable.
- No `virtual:*` href is emitted.
- `/รับซื้อ-apple-โคราช` is not emitted until a real route is released.
- Managed blocks are idempotent.
- No missing managed service source files.
- Production build passes after runtime apply.
- Final crawl must show no new broken internal links and no links to noindex routes.

## Files

- `src/config/core-hub-release.json`
- `src/config/core-hub-architecture.ts`
- `scripts/apply-core-hub-architecture.mjs`
- `scripts/validate-core-hub-architecture.mjs`
- `docs/architecture/core-hub-release-matrix.csv`
- `docs/architecture/ARCHITECTURE-BATCH-1.md`
