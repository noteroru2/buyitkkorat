# 06 — Event Taxonomy and Dedupe

## Mapping (`Analytics.astro`)

| Raw `data-event` | Emitted event | contact_method |
|------------------|---------------|----------------|
| `line_click`, `sticky_line_click`, `hero_line_click` | `line_click` | line |
| `phone_click` | `phone_click` | phone |
| `facebook_click` | `facebook_click` | facebook |
| `maps_click` | `maps_click` | maps |
| `valuation_start` | `valuation_start` | line |
| `valuation_submit` | `valuation_submit` | form — **gated** |
| `service_cta_click`, `contact_click` | `contact_click` | line / contact |
| `evidence_view` | `evidence_view` | evidence |
| `service_process_view` | `service_process_view` | process |

## Dedupe rule

Key = `event|cta_location|page_path` · suppress repeats within **400ms**.

## `winner_cta` role

CustomEvent `winner_cta` fires for first-party listeners with `{ event, rawEvent, params }`. GA gtag send is separate and consent-gated. Not a second conversion classification.

## Surfaces covered

Header, Footer, Sticky mobile CTA, Homepage, About, Contact, Service pages, Articles, Korat hub, Valuation checklist, Maps/Facebook/LINE/Phone — via delegated `[data-event]` capture on `document` (capture phase).

## Risks checked

| Risk | Mitigation |
|------|------------|
| Bubbling double-fire | Single delegated listener + closest `[data-event]` |
| Duplicate listeners | One inline dispatcher |
| Client navigation | Path taken at click time; page_view only on consent load path |
| External app navigation | Sync track before navigation; no artificial delay |
| `valuation_submit` from CTA | Blocked unless `__WINNER_LEAD_SUBMIT_OK__` |

## Deprecated

No removal of live CTA events without dependency proof. Unknown `data-event` names are ignored (fail closed).
