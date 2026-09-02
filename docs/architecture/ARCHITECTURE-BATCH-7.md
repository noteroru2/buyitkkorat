# ARCHITECTURE BATCH 7 — Guide / Informational Authority Architecture

## Objective

Turn the existing guide library into a controlled informational-authority graph that supports money pages without competing with them.

## Release result

- Live routes: **90 → 90**
- Indexable routes: **89 → 89**
- Existing live guides governed: **15**
- Virtual topical guide clusters: **5**
- New live guide routes: **0**
- Future guide candidates staged: **12**
- Maximum commercial targets per guide: **3**
- Maximum same-cluster related guides per guide: **3**
- Automatic publishing: **OFF**

## URL ownership stays simple

All live guides remain:

```text
Home → /บทความ → current guide
```

The five topical clusters are conceptual/virtual organization only. They do not become URL paths, canonical owners or breadcrumbs in Batch 7.

## Five guide clusters

1. `SELLER_PREPARATION`
   - general valuation preparation
   - accessories/box
   - product photography
   - shipping
   - checking price factors

2. `DATA_SECURITY`
   - SSD/privacy
   - computer data deletion
   - iCloud / Find My
   - Google account / Android preparation

3. `NOTEBOOK_PREPARATION`
   - checking specifications
   - preparing a notebook
   - valuation when a device will not boot

4. `B2B_BULK`
   - multi-computer asset-list preparation
   - company documentation / ownership process

5. `DEVICE_VALUATION`
   - camera/lens valuation factors
   - graphics-card valuation factors

## Runtime graph

Article related-link order becomes:

```text
Guide
├── 1–3 intent-matched commercial/journey targets
├── up to 3 same-cluster guide links
└── generic article sibling fallback only if room remains
```

Same-cluster guide links use circular rotation rather than a fixed first-three list.

## Intent ownership contract

Guides own informational intent:

- วิธี...
- ต้องเตรียมอะไร
- มีผลต่อราคาอย่างไร
- ข้อควรรู้
- ปัจจัยที่ทำให้ราคาแตกต่าง

Money pages own transactional/local intent:

- รับซื้อ...
- ร้านรับซื้อ...
- ขาย ... โคราช
- รับซื้อใกล้ฉัน
- immediate valuation/sale intent

A guide must not disguise itself as a local money page merely to capture the same query.

## Cannibalization safety

The existing risk around privacy/preparation content is retained, not ignored.

Examples requiring overlap review:
- SSD/data privacy vs computer data deletion
- prepare notebook vs check notebook specs
- general price checking vs device-specific valuation
- general preparation vs product photography/shipping

Batch 7 organizes these pages but does not merge, redirect or noindex any guide.

## Expansion gate

A future guide candidate needs:

1. defined informational intent,
2. exactly one primary guide cluster,
3. one primary commercial owner,
4. search-demand or first-party question/lead evidence,
5. uniqueness review,
6. overlap review against existing guides,
7. transactional cannibalization review,
8. at least two planned discovery paths,
9. contextual link to its commercial owner,
10. documented source/experience basis where claims require it.

## Prohibited expansion

- Guide × district pages
- duplicate city versions of the same informational article
- Brand/Model permutations without separate informational demand
- current-price claims without evidence
- mass publishing from the candidate registry

## Batch 6 interaction

Brand/Series/Model candidates remain non-live. Guide candidates may support future Brand/Series releases, but a candidate Brand/Series URL must never be linked before that commercial page itself is released.

Therefore Batch 7 commercial targets point only to **currently live** URLs.
