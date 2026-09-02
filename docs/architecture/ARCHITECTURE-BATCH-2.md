# ARCHITECTURE BATCH 2 — Parent/Child Runtime Integration & Breadcrumb Ownership

## Objective

Move architecture ownership from audit/config only into shared runtime rendering without changing indexation or URL behavior.

## Release scope

- Add a shared runtime architecture resolver.
- Render semantic visual breadcrumbs from recommended parent ownership.
- Render bounded related-service discovery from child/peer/sibling ownership.
- Retire Batch 1 Markdown managed link blocks when the shared runtime layout is installed.
- Keep Apple and Local virtual parents non-linkable.

## Breadcrumb policy

A breadcrumb is an ownership signal, not a navigation history. The chain is generated from `recommendedParent`, stops at virtual parents, and always begins at the live homepage.

Examples:

- `/รับซื้อแรม-โคราช` → `/` → `/รับซื้อคอมพิวเตอร์-โคราช` → current.
- `/รับซื้อโทรศัพท์-samsung-โคราช` → `/` → `/รับซื้อโทรศัพท์มือถือ-โคราช` → `/รับซื้อโทรศัพท์-android-โคราช` → current.
- Apple member → `/` → current (temporary bridge state).
- Location route → `/` → current (temporary pre-Local-Hub state).

## Why Batch 1 blocks are retired

Batch 1 used managed Markdown blocks as a safe bridge when the shared rendering tree was unavailable. Once Batch 2 is integrated into the common layout, retaining those blocks would duplicate related links and weaken deterministic placement.

## Explicitly deferred

- BreadcrumbList JSON-LD: defer until existing schema implementation is inspected to avoid duplicate schema graphs.
- Real Apple Hub: separate release decision.
- Real Local Hub and district breadcrumb hierarchy: Batch 5.
- GSC-driven merges/redirects/noindex: still gated by query→page evidence.
