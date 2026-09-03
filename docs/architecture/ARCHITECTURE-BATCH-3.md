# ARCHITECTURE BATCH 3 — Internal Link Graph Consolidation & Orphan Recovery

## Objective

Repair the architecture-projected orphan/near-orphan pattern left after Batch 2 without creating new URLs or changing indexation.

## Baseline diagnosis

Batch 2 bounded related links to six and always selected the first children/siblings in source order. That kept the graph controlled, but large hubs could leave later children underlinked. The Batch 2 projected graph had **28 routes with zero runtime contextual inbound** and **31 routes with inbound <= 1** before considering unrelated static/footer links in the real site.

## Release behavior

1. **Hub Discovery:** homepage and live parent hubs expose controlled discovery lists. Direct children are no longer truncated at six; discovery is capped at 16.
2. **Sibling Rotation:** child/article related links rotate around the current node instead of using fixed-first-six ordering.
3. **Article → Money Page bridges:** all 15 articles receive intent-matched commercial/journey targets before sibling articles.
4. **Root sibling suppression:** routes whose parent is `/` do not automatically cross-link across unrelated clusters. Cross-cluster flow must come from explicit core-hub peers or homepage discovery.
5. **Apple remains bridge-only:** no `/รับซื้อ-apple-โคราช` href is emitted.
6. **Local remains deferred:** only `/พื้นที่/เมืองนครราชสีมา` is a controlled homepage entry point. Other districts remain deferred until Batch 5 builds the real Local Hub.

## Projected gate after Batch 3

- Live routes: **89**
- Indexable: **88**
- Homepage discovery seeds: **12**
- Article conversion bridge sources: **15**
- Max discovery links/page: **15**
- Max related links/page: **6**
- Tier A/B non-TRUST/non-LOCATION routes with projected inbound < 2: **0**
- Articles with projected inbound < 2: **0**
- Unexpected projected zero contextual inbound outside TRUST/LOCATION: **0**
- Intentionally deferred zero contextual inbound: TRUST + LOCATION only.

## Safety invariants

Batch 3 does **not** change URL, slug, canonical, robots, sitemap, noindex, redirect, Markdown frontmatter, or GSC-gated ownership decisions. It changes only the deterministic runtime internal-link graph and its rendering component.
