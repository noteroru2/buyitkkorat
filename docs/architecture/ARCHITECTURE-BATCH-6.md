# ARCHITECTURE BATCH 6 — Brand / Model / Series Architecture Foundation

## Purpose

Prepare the site for controlled growth from ~90 live routes toward 150–300+ useful URLs without creating thin pages, doorway pages or Brand/Model cannibalization.

## Release result

- Live routes: **90 → 90**
- Indexable routes: **89 → 89**
- New live Brand pages: **0**
- New live Series pages: **0**
- New live Model pages: **0**
- Live expansion anchors mapped: **12**
- Brand candidates staged: **10**
- Series candidates staged: **42**
- Exact model candidates staged: **0**
- Automatic publishing: **OFF**

Batch 6 is deliberately a foundation release, not a page-count release.

## Ownership model

```text
Core / Family Hub
└── Brand
    └── Series
        └── Exact Model
```

Examples:

```text
รับซื้อโน๊ตบุ๊ค โคราช
└── ASUS
    ├── ROG
    ├── TUF Gaming
    ├── Vivobook
    └── Zenbook
```

Existing Android brand pages already act as live Brand anchors:

```text
รับซื้อโทรศัพท์ Android
├── Samsung
├── OPPO
├── vivo
└── Xiaomi / Redmi / POCO
```

Apple remains different:

```text
virtual Apple owner
├── iPhone (LIVE family)
├── iPad (LIVE family)
└── MacBook (LIVE family)
```

Batch 6 does **not** release a real Apple hub and does not change current Apple canonical/index ownership.

## Anti-page-explosion rule

The following route multiplication is prohibited:

- Brand × Location
- Series × Location
- Model × Location
- Model × Condition at scale without independent demand

So this architecture does **not** create:

```text
/พื้นที่/ปากช่อง/รับซื้อ-iphone-...
/พื้นที่/พิมาย/รับซื้อ-asus-rog-...
```

Local intent stays in the Local cluster. Product/model intent stays in the product taxonomy.

## Brand release gate

A Brand candidate cannot go live from name substitution alone.

Required:
- live parent hub
- verified brand identity
- at least 3 meaningful brand-specific valuation factors
- uniqueness review
- internal-link plan
- query/canonical owner review
- real demand evidence from search or first-party business data

## Series release gate

Series requires:
- live Brand/Platform parent
- verified series identity
- series-specific value/condition factors
- clear differentiation from Brand parent
- query-overlap review
- evidence of demand

## Model release gate

Exact Model pages have the strictest gate.

Required:
- exact model identity
- reliable/manufacturer verification
- live parent
- model-specific configurations/value variables
- model-specific condition notes
- unique content
- query ownership review
- real demand evidence

Prohibited:
- swapping only a model name into a template
- invented price data
- unverified specs
- model × district pages
- auto-publishing from a catalog

## Seed strategy

Batch 6 seeds Brand and Series candidates only.

No exact Model candidate is seeded because exact models should be added from evidence:
- GSC query→page data
- actual leads
- purchase/transaction history
- inventory history
- verified high-value product families

This is intentional: the architecture is ready for models without manufacturing fake model pages.

## Priority bands

- **Band 1** — first expansion candidates after evidence review
- **Band 2** — second-wave candidates
- **Band 3** — hold until stronger evidence

Priority is planning only, never auto-publish authority.

## Evidence workflow

Optional evidence CSV:

```text
candidate_id,gsc_impressions_90d,leads_180d,transactions_365d,identity_verified,content_ready,ownership_review_pass
```

Run:

```bash
node scripts/score-expansion-readiness.mjs --input=docs/gsc/expansion-evidence.csv
```

Output can reach `RELEASE_REVIEW`, but never publishes a route automatically.
