# INDEX 350 — W5 Performance Review & W6 Final Candidate Selection

This batch does **not** publish W6 pages. It reviews W5 only when real W5 Observation outputs exist and then prepares the final W6 candidate decision.

## Current architecture

- Live: 329
- Indexable: 328
- Noindex: 1
- Remaining HOLD: 32
- Target floor: 350 indexable
- Planned buffer target: 360 indexable

## Final pool

- 13 Local pages
- 18 Guide pages
- 1 Canon EOS R model page with static ownership risk

The safe plan is 31 pages (13 Local + 18 Guide), projecting 359 indexable pages. This clears the 350 floor without taking the Canon ownership risk.

Canon can join W6 only when `docs/architecture/index350-canon-eos-r-ownership-resolution.json` exists and explicitly records a real manual review with `approvedForW6: true`, `decision: APPROVE_FOR_W6`, reviewer, and evidence summary. A template is supplied but no approval is packaged.

## States

- `WAIT_FOR_REAL_W5_OBSERVATION_DATA`
- `W5_REVIEW_HOLD`
- `W6_CANDIDATE_REVIEW_READY`
- `W6_SAFE_SELECTION_READY_FOR_MANUAL_APPROVAL`
- `W6_FULL_SELECTION_READY_FOR_MANUAL_APPROVAL`
- `W6_SELECTION_INCOMPLETE_FLOOR_NOT_MET`

No state publishes pages automatically. W6 stays locked until a separate explicit source-release batch.
