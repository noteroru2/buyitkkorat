# REAL REPO MERGE REPORT

Status: **SOURCE MERGE COMPLETE / STATIC QUALITY PASS / ASTRO BUILD NOT ATTESTED IN SANDBOX**

## Final source state

- Real repository preserved as base
- Live routes: **99**
- Indexable routes: **98**
- Noindex: **1**
- Content files validated: **88**
- Route registry matches real source inventory: **True**
- Architecture validators: **PASS**
- Frontmatter required-field errors: **0**
- Architecture sitemap audit: **98 URLs**
- Round 1 released Brand/Series pages: **4**
- Local authority hub `/พื้นที่`: **LIVE**
- Round 2: **LOCKED**

## Preserved newer routes from the real repository

The uploaded repo already contained five routes that the earlier overlay did not:

- `/นโยบายคุกกี้`
- `/บทความ/cycle-count-และ-activation-lock-ก่อนขาย-macbook`
- `/บทความ/shutter-count-คืออะไรก่อนขายกล้องดิจิทัล`
- `/บทความ/ราคาประเมินจากรูปกับราคาหลังตรวจต่างกันอย่างไร`
- `/บทความ/วิธีเช็กสุขภาพแบตเตอรี่ก่อนขายมือถือและโน้ตบุ๊ก`

They were preserved and reconciled into the architecture registry. Overlapping future Guide candidates for battery-health and shutter-count were retired rather than duplicated.

## Real-source integration completed

- `src/pages/[slug].astro` uses runtime architecture breadcrumbs/discovery/related links.
- `src/pages/พื้นที่/[slug].astro` uses `/พื้นที่` as the real local parent.
- `src/pages/บทความ/[slug].astro` uses guide authority related links.
- `src/pages/พื้นที่/index.astro` added using the repository's existing BaseLayout/Breadcrumbs/schema system.
- Header/Footer area links now point to `/พื้นที่`.
- Existing `SeoHead.astro` retained; no duplicate SEO head component was layered on top.
- Noindex policy changed to `noindex, follow`.
- `WebSite` schema now belongs to homepage only.
- Production crawl auditor supports Astro `build.format: file`.
- Production verifier supports `/sitemap-index.xml` and child sitemap counting.

## Build attestation limitation

`npm ci` could not complete inside this ChatGPT sandbox because outbound npm registry access/cache is unavailable. Therefore I did **not** claim that `npm run build` executed successfully here.

The source-level gate was tested instead:

- all architecture validators exit 0,
- all custom `.mjs` scripts pass Node syntax checking,
- real source routes exactly match registry (99/99),
- all 88 Markdown/MDX content files satisfy required frontmatter fields,
- synthetic Astro file-format crawl: 99/99, orphan 0, broken 0, max depth 4, WebSite owner 1,
- synthetic production verifier: 4/4 released routes, 3/3 parent-child checks, sitemap-index 98/98.

## Run after extracting

```bash
npm ci
npm run validate:architecture
npm run build
npm run audit:architecture-build
```

Then, before production deployment:

```bash
npm run predeploy:round1
```
