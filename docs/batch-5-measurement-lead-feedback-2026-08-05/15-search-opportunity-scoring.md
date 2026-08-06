# 15 — Search Opportunity Scoring

## Defaults (`OPPORTUNITY_SCORING_DEFAULTS`)

| Knob | Default | Meaning |
|------|---------|---------|
| minImpressions | 50 | Analysis floor — not a business KPI |
| minClicks | 3 | Analysis floor |
| evaluationWindowDays | 28 | Prefer ≥28 days before ranking conclusions |
| comparisonWindowDays | 28 | Pre/post comparison |
| positionBandLowCtr | 4–15 | High impressions + low CTR band |

Brand patterns and money-page prefixes live in `measurementConfig.ts`.

## Opportunity groups (examples)

High impressions + pos 4–15 + low CTR · High impressions + no dedicated page · Money page gaining impressions · Wrong-page ranking · Declining clicks · Strong position + weak CTA path · Newly remediated (observe) · Insufficient evidence

## Output columns (when data exists)

query/cluster, current page, recommended page, evidence, suggested action, risk, measurement plan, do-not-act-before date

## Current

**NO DATA IMPORTED** — scoring must not invent rows. Templates in `data-templates/`.

## Hard rule

Scores never auto-generate SEO pages.
