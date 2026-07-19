# Batch 2.2 — Release and Production Validation

## Verdict

**WARNING** — Release/Production structural validation ผ่าน แต่ Production screenshots จับไม่ได้ จึง Visual QA ไม่ครบตาม gate

## Release

- Safety branch pushed: `batch-2-2-safe-image-release` @ `2b1da09dca4276bdc908b3b9125493ac1799ac21`
- Main pushed fast-forward: `5c264bc..2b1da09`; no force push
- Local main = origin/main: `2b1da09dca4276bdc908b3b9125493ac1799ac21`
- Deployment: `dpl_7kvRmbHuT8GwiZv2YZ2vgXZrMRMY` (https://buyitkorat-c69logwsi-amphons-projects-bb1ec3bf.vercel.app)
- Production: https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com
- Rollback target: https://buyitkorat-5zctgo310-amphons-projects-bb1ec3bf.vercel.app

## Production validation

- Routes 89/89; indexable 88; unknown route 404/noindex
- Sitemap 88 canonical URLs; robots reference correct; no fabricated lastmod/changefreq/priority
- Metadata, H1, canonical, robots and JSON-LD: PASS
- ResponsiveImage usages 2/2: PASS; generated image URLs all respond 200
- Pilot images 2/2 and disclosure 2/2: PASS
- AEO answer-first pages 3/3: PASS
- Browser DOM checks 56/56: PASS
- Production screenshots 0/12: WARNING (capture backend timeout)
- Deployment drift: none
- Rollback: not triggered

## Monitoring

- GSC access is not available in this environment; query ownership, field CWV/CLS and conversion attribution remain monitoring items
- Remaining transactional P2: 4 pages; article summary P2: 15 pages
