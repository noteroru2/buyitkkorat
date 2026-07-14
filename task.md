# Task Checklist — รับซื้อไอทีโคราช.com (WINNER IT)

อัปเดตล่าสุด: 2026-07-14

## Phase 1 — Preflight
- [x] ตรวจ Workspace (ว่าง)
- [x] ตรวจ Node.js / npm (v24.14.1 / 11.11.0)
- [x] ตรวจ Git (initialize แล้ว)
- [x] สร้าง `task.md`
- [x] สร้าง `docs/project-plan.md`
- [x] สร้าง `docs/content-inventory.md`
- [x] สร้าง `docs/seo-architecture.md`
- [x] สร้างโฟลเดอร์ `docs/audits/`

## Phase 2 — Foundation
- [x] Initialize Git + `.gitignore`
- [x] Initialize Astro (TypeScript strict)
- [x] ตั้ง `site` เป็น Production Punycode
- [x] Design System / CSS Tokens
- [x] Content Collections + Zod
- [x] Layouts (Base, Service, Area, Article, Trust)
- [x] Core Components
- [x] SVG Illustrations

## Phase 3 — Core Website
- [x] Homepage
- [x] Core service pages
- [x] Trust / About / Contact
- [x] Policy pages
- [x] Custom 404

## Phase 4 — SEO Clusters
- [x] Apple product pages
- [x] Mobile / Tablet pages
- [x] Notebook / Computer pages
- [x] PC Parts pages
- [x] Camera / Gaming / Audio pages
- [x] B2B / Org pages
- [x] Condition pages
- [x] Area pages

## Phase 5 — Content
- [x] Supporting articles (≥15)
- [x] Internal links via frontmatter
- [x] Breadcrumbs
- [x] Related content

## Phase 6 — Technical SEO
- [x] SeoHead / Canonical / OG
- [x] Sitemap + robots.txt
- [x] Structured Data (JSON-LD)
- [x] Favicon / Manifest / OG images

## Phase 7 — Audits
- [x] `audit:seo`
- [x] `audit:content`
- [x] `audit:links`
- [x] `audit:claims`
- [x] `audit:images`
- [x] `audit:schema`
- [x] `audit:all` ผ่าน (exit 0)

## Phase 8 — Visual QA
- [x] Playwright setup
- [x] Screenshots
- [x] Mobile / Desktop checks

## Phase 9 — Git และ Deploy
- [ ] Commits ตามงาน
- [x] `check` + `build` + `audit:all` ผ่าน
- [ ] Vercel Deploy
- [ ] Domain mapping

## Phase 10 — Live QA
- [ ] Production Smoke Test
- [ ] `docs/final-launch-report.md`
- [ ] สรุปผลตาราง Acceptance

## Blockers
- (รอผลการ deploy / credentials)
