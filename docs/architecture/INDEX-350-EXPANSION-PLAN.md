> **Current state (2026-09-02): W6 Safe Final released at source — 359 indexable; target floor 350 cleared; Canon EOS R remains the only HOLD candidate.**

# INDEX 350+ EXPANSION ARCHITECTURE

## Target

Original expansion baseline: **98 indexable routes**
Released through W6 Safe Final: **261 / 262 planned routes**
Current source target: **359 indexable routes**
Full-buffer target if Canon ownership is later resolved: **360**
Buffer above the requested 350-page floor: **10 pages**

This plan changes **zero live URLs today**. It is a governed expansion queue, not a mass-publish command.

## Structure

| Group | New pages | Running total | Purpose |
|---|---:|---:|---|
| Existing | 0 | 98 | Current production architecture |
| A — Brand | 24 | 122 | Brand-level transactional ownership |
| B — Series | 64 | 186 | Series-level commercial pages |
| C — Model | 78 | 264 | Verified used-market model families |
| D — Condition | 30 | 294 | Distinct sell-side problem intent |
| E — B2B | 20 | 314 | Company/bulk workflows |
| F — Local | 28 | 342 | Remaining districts + selected real clusters |
| G — Guide | 18 | **360** | Informational authority |

## Why 360, not exactly 350

A 10-page buffer lets the site noindex/merge a small number of weak candidates later without falling below the 350-page strategic floor.

## Release waves

1. **W1: 98 → 138** — 40 Brand/Series pages.
2. **W2: 138 → 188** — 50 Series/Model pages.
3. **W3: 188 → 238** — 50 Model pages.
4. **W4: 238 → 288** — 50 Model/Condition pages.
5. **W5: 288 → 328** — 40 Condition/B2B/Local pages.
6. **W6 Safe Final: 328 → 359** — 31 Local/Guide pages released; Canon EOS R remains HOLD. Full buffer 360 requires a separate ownership resolution.

Each wave must pass build, crawl, canonical, sitemap, internal-link and ownership checks before the next wave.

## Hard anti-doorway rules

- Never create Brand × District pages.
- Never create Series × District pages.
- Never create Model × District pages.
- Never mass-create Model × Condition permutations.
- Local pages describe actual service logistics and never invent a branch.
- Model pages require verified identity and unique valuation content.
- Similarity alone never triggers redirect/noindex/canonical consolidation.

## Internal-link minimum

Every new indexable page must have at least **2 discovery paths**. Typical pattern:

```text
Core Hub → Brand → Series → Model
      ↘ contextual service / condition / guide bridge ↗
```

Local stays separate:

```text
/พื้นที่ → District / Local Cluster
```

No model or brand pages are nested under a district.

## Sitemap/index policy

A candidate enters sitemap only after:

1. source page exists,
2. unique-intent content passes review,
3. canonical owner is self,
4. robots = index,follow,
5. at least two discovery paths exist,
6. build/crawl passes,
7. candidate is explicitly moved from `HOLD_PLANNED` to release state.

## Files

- `src/config/index-350-expansion-plan.json`
- `docs/architecture/index-350-route-matrix.csv`
- `scripts/validate-index-350-expansion-plan.mjs`
