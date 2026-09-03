# INDEX 350 — W5 Production Release Gate

W5 production is governed as a 40-URL cohort: 5 Condition, 20 B2B, and 15 Local pages. The gate requires a real build, cumulative architecture crawl, W5 built-surface audit, exact Git SHA attestation when requested, and post-deploy verification.

Production verification requires HTTP 200, exactly one self-canonical, exactly one `index,follow` robots tag, exactly one H1, at least two images with non-empty alt text, a LINE CTA, at most one BreadcrumbList, inclusion in the 328-URL sitemap, at least two inbound internal discovery paths, and all 7 parent→child groups intact. Local pages remain service-area pages and must not imply fake branches.

Release basis remains `MANUAL_APPROVAL_OVERRIDE`; no real W4 performance evidence is claimed. W6 stays locked after production verification and requires a separate observation/review cycle.
