# 16 — Recommended Roadmap

## Batch 1 — Critical Protection

| Task | Files / URLs | Why | Dependencies | Risk | Test | Business impact |
|------|--------------|-----|--------------|------|------|------------------|
| Confirm Vercel production commit SHA | Vercel dashboard | Close identity gap | Access | Low | Match content hotfix lineage | Ops confidence |
| Sync git (push docs commit when approved) | repo | Local ahead origin | User approval | Low | `git status` clean tracking | Prevent drift |
| Draft Ubon NAP pack (offline) | business docs | Unblocks entity rewrite | Real address proof | High if wrong address published | Internal sign-off | Trust |
| GA4 + consent + wire `winner_cta` | BaseLayout, privacy/cookie | Measurement P1 | GA property IDs | Privacy misconfig | DebugView events | Decision quality |
| Add Facebook URL CTA | `site.ts`, header/footer/sticky | Brief conversion gap | Official FB URL | Wrong page URL | Click works + event | More leads |
| Security headers | `vercel.json` | Missing XCTO/XFO/etc | Deploy window | CSP break | Header crawl | Hardening |

**Do not** mass-publish new province pages in Batch 1.

## Batch 2 — High-impact SEO

| Task | Target | Why | Impact |
|------|--------|-----|--------|
| Rewrite About/Contact with HQ + Korat service wording | `/เกี่ยวกับเรา`, `/ติดต่อ` | Entity alignment | High |
| LocalBusiness schema matching on-page NAP | `schema.ts` | Local/GEO | High |
| GSC verify + sitemap submit + coverage export | GSC | Index ops | High |
| Twitter meta completeness | layouts | Social | Low-Med |
| Internal links articles→money | articles | Equity | Med |

## Batch 3 — Content and Intent

| Task | Target | Why |
|------|--------|-----|
| Rewrite 10+ thin articles | `/บทความ/*` | AEO depth |
| Improve/merge thin amphoe | `/พื้นที่/*` | Anti-doorway |
| Expand FAQ hub | `/คำถามที่พบบ่อย` | AEO |
| Dated price reference ranges | `/วิธีประเมินราคา` or new page | CRO vs competitors |
| Optional consign article | only if real | Intent coverage |

## Batch 4 — AEO, GEO and Trust

| Task | Why |
|------|-----|
| Storefront/team/real ops photos | E-E-A-T |
| GBP completion + review solicitation (real only) | Local |
| `sameAs` social/GBP on Organization | Entity graph |
| Case studies (anonymized) | GEO uniqueness |
| Author/reviewer where real humans exist | Experience |

## Batch 5 — Conversion and Measurement

| Task | Why |
|------|-----|
| Valuation form MVP + spam protection | Recover non-LINE users |
| Event taxonomy complete (FB/maps/form/404) | CRO learning |
| Photo example UI | Higher quality submissions |
| Post-tag CWV recheck | Protect performance |
| Scroll/outbound diagnostics | Funnel |

## Sequencing notes

1. **Entity facts before schema** — never mark LocalBusiness without visible address.  
2. **Consent before GA.**  
3. **Content expansion after measurement** so you can see which pages convert.  
4. Respect prior SEO freeze guidance if rankings are still settling; Batch 1 measurement/headers are still justified as protection.
