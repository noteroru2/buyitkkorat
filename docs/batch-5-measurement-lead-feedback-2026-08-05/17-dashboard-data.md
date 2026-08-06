# 17 — Dashboard-ready Data

Location: `data-templates/` (headers + `NO DATA IMPORTED` status rows only). Runtime import outputs: `data/` when GSC files provided.

| File | Purpose |
|------|---------|
| `measurement-events.csv` | Event catalog / observed counts when available |
| `conversion-map.csv` | Primary/secondary map |
| `deployment-timeline.csv` | Batch timeline export |
| `page-intent-map.csv` | Page → intent clusters |
| `gsc-import-manifest.json` | Import status |
| `gsc-query-opportunities.csv` | Scored queries |
| `gsc-page-opportunities.csv` | Scored pages |
| `search-conversion-priorities.csv` | Combined priorities |
| `open-measurement-blockers.csv` | Owner blockers |

## Column conventions

date_range, source, metric, query, page, intent, cluster, event, conversion_status, evidence_level, data_quality, recommendation, priority, owner_dependency, verification_status

## Rule

No fabricated Production metrics in these files.
