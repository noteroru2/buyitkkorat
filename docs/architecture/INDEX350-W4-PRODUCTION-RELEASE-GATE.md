# INDEX 350 — W4 Production Release Gate

W4 production is governed as a 50-URL cohort: 18 Series, 7 Model, and 25 Condition pages. The gate requires a real build, cumulative architecture crawl, W4 built-surface audit, exact Git SHA attestation when requested, and post-deploy verification.

Production verification requires HTTP 200, exactly one self-canonical, exactly one `index,follow` robots tag, exactly one H1, at least two images with non-empty alt text, a LINE CTA, at most one BreadcrumbList, inclusion in the 288-URL sitemap, at least two inbound internal discovery paths, and all 30 parent→child groups intact.

Release basis remains `MANUAL_APPROVAL_OVERRIDE`; no real W3 performance evidence is claimed. W5 stays locked after production verification and requires a separate observation/review cycle.
