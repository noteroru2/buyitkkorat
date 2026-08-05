# 01 — Production and Deployment

## Repository status (2026-08-05)

| Check | Result | Evidence |
|-------|--------|----------|
| Branch | `main` | `git status -sb` |
| Local HEAD | `444c52d661d7322ff6dd1ea85a12226da42b8fbb` | `chore(verification): add batch 2.2.2 production closure reports` |
| origin/main | `23449268a080b1622c192a182c0b38de777d4950` | `docs: add batch 2.2.1 production validation report` |
| Local matches origin/main? | **No** — local **ahead 1** | docs-only commit |
| Uncommitted / untracked | Yes | Modified: `docs/audits/production-smoke.json`; Untracked: `docs/full-website-gap-audit-2026-08-05/`, `scripts/gap-audit-*.ts` |
| `vercel.json` dirty? | Previously marked modified; content = `{ cleanUrls: true, trailingSlash: false }` | Inspected file; no functional drift vs intended deploy config |

## Production deployment identity

| Item | Status |
|------|--------|
| Platform | **Vercel** (`server: Vercel` on response headers) |
| Production SHA (this session) | **NOT PROVEN** — Vercel deployment API / dashboard not queried |
| Last documented production content | Hotfix `51f4589` / deployment id `dpl_smiwGKMt…` in `docs/content-intent-image-audit-2026-07/batch-2-2-2/` |
| Is `51f4589` ancestor of HEAD? | **Yes** |
| Production matches main? | **Content pages likely aligned** with post-hotfix tree; docs commits after hotfix do not change pages. Full binary equality **NOT PROVEN**. |

## Build & tooling

| Item | Value |
|------|-------|
| Framework | Astro 7 SSG + `@astrojs/sitemap` |
| Build command | `npm run build` → `astro build` |
| Check | `npm run check` → `astro check` |
| Audit suite | `npm run audit:all` (+ seo/content/links/claims/images/schema) |
| Prod validation scripts | `validate:prod`, `smoke:prod`, `qa:playwright` |
| Env vars required for public site | **None proven required** for static build (no secrets in audited public HTML). Do not invent. |

## Runtime checks (this session)

| Command / check | Result |
|-----------------|--------|
| `npm run build` | **89 pages** (prior session / prior run recorded) |
| `npm run check` | **0 errors** (hints may remain) |
| `npm run audit:all` | **PASS** critical=0 (prior session) |
| Production crawl script | 88×200 + intentional `/404` |
| HTTP→HTTPS | **308** to HTTPS apex |
| www→apex | **301** to non-www HTTPS |
| robots.txt | Allow `/` + sitemap index |

## Production vs repository drift risks

1. Local ahead of origin with untracked audit scripts → risk of forgetting to push docs-only identity.  
2. Production SHA not re-fetched → if someone redeployed from different commit, **NOT PROVEN**.  
3. No evidence of production-only redirects beyond Vercel defaults + `vercel.json` cleanUrls.  
4. Smoke JSON snippet shows sitemap `lastmod` removed from index vs older smoke — informational only.

## Secrets

No secrets, tokens, or credentials are reproduced in this audit.
