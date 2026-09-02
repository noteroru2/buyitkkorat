# EXPANSION RELEASE ROUND 1 — Evidence-Backed Brand / Series Release

## Decision

Release **4 URLs**, below the Batch 10 cap of 6.

Released:

1. `/รับซื้อโน๊ตบุ๊ค-asus-โคราช`
2. `/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช`
3. `/รับซื้อโน๊ตบุ๊ค-dell-โคราช`
4. `/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช`

## Evidence policy

No raw Korat GSC query→page export was available for this round.

Therefore no GSC clicks/impressions/position values were fabricated.

Round 1 uses:
- first-party customer/corporate sell-side demand already present in the project,
- manufacturer verification of the Brand/Series identity,
- controlled release size,
- post-release GSC observation.

## Why these four

### ASUS → ROG

A recent first-party valuation enquiry involved an ASUS ROG Zephyrus gaming notebook, providing direct business evidence for both:
- ASUS brand intent,
- ROG family intent.

ASUS official sources confirm ROG as the gaming laptop family and identify Flow, Zephyrus and Strix families.

### Dell → Latitude

A recent corporate sell-side enquiry involved a Dell Latitude 7440 and proceeded into a formal buy-offer workflow.

Dell official Support documentation verifies Latitude 7440 and provides its service/setup documentation.

## Why the rest remain HOLD

Acer, Lenovo, HP, MSI and remaining Series candidates remain in `HOLD_FOUNDATION` because Round 1 does not have equally strong attested evidence packages for them.

This is deliberate. Priority Band 1 is not sufficient by itself.

## Architecture after release

```text
รับซื้อโน๊ตบุ๊ค โคราช
├── ASUS
│   └── ROG
└── Dell
    └── Latitude
```

Existing notebook condition pages remain independent children of the Notebook hub.

## Route counts

- Live: **90 → 94**
- Indexable: **89 → 93**
- Noindex: **1**
- Sitemap target: **89 → 93**

## Round 2 lock

Round 2 stays locked until:
- production build/crawl passes with 94 routes,
- sitemap has exactly 93 canonical indexable URLs,
- all four new URLs are 200/self-canonical,
- new pages are internally discoverable,
- indexation/GSC observation is available,
- cannibalization/query ownership is reviewed.

## No Model release

Exact Model candidates remain **0**.

Do not create ROG G14 / Latitude 7440 model pages from this release alone. The evidence proves Brand/Series demand, not enough standalone model-query demand.

## Contextual inbound

Each released Series page has at least two intended discovery paths:

- ROG: ASUS parent + Notebook Gaming contextual bridge.
- Latitude: Dell parent + Company Computer contextual bridge.

This prevents a newly released Series page from depending on a single parent link.

## Post-release GSC observer

When a fresh query×page export exists:

```bash
node scripts/evaluate-expansion-round-1-gsc.mjs \
  --input=docs/gsc/query-page.csv
```

It compares four parent/child ownership pairs and never executes merge/noindex/canonical/redirect actions automatically.
