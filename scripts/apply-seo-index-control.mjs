#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dryRun = process.argv.includes('--dry-run');
const layoutArg = process.argv.find((x) => x.startsWith('--layout='));
const sitemapArg = process.argv.find((x) => x.startsWith('--sitemap='));
const layoutRel = layoutArg ? layoutArg.slice('--layout='.length) : null;
const sitemapRel = sitemapArg ? sitemapArg.slice('--sitemap='.length) : null;

const required = [
  'src/config/site-architecture.json',
  'src/config/core-hub-release.json',
  'src/config/seo-index-control.json',
  'src/config/seo-index-control.ts',
  'src/components/architecture/ArchitectureSeoControl.astro',
  'scripts/generate-architecture-sitemap.mjs',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`ERROR: missing prerequisite ${rel}`);
    console.error('Apply Architecture Batch 0–8 before Batch 9.');
    process.exit(1);
  }
}

const edits = [];
const warnings = [];

function editJson(rel, updater) {
  const file = path.join(root, rel);
  const before = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(before);
  updater(data);
  const after = JSON.stringify(data, null, 2) + '\n';
  if (after !== before) edits.push({file, rel, before, after});
}

editJson('src/config/site-architecture.json', (data) => {
  const live = data.routes.filter((n) => n.kind === 'LIVE');
  const indexable = live.filter((n) => n.indexState === 'INDEX');
  if (live.length !== 90 || indexable.length !== 89) {
    throw new Error(`Batch 9 baseline mismatch: live=${live.length}, indexable=${indexable.length}`);
  }
  data.meta.currentReleaseBatch =
    'ARCHITECTURE BATCH 9 — Sitemap / Canonical / Schema / Index Control Integration';
  data.meta.currentRoutes = 90;
  data.meta.currentIndexable = 89;
  data.meta.currentNoindex = 1;
  data.meta.releasedNewRoutes = [];
  data.meta.releasePolicy =
    'Batch 9 derives sitemap/canonical/robots/architecture-safe schema from one route registry. No destructive index decision is executed.';
});

editJson('src/config/core-hub-release.json', (data) => {
  data.meta.seoIndexControlState = 'ARCHITECTURE_SEO_CONTROL_BATCH_9';
  data.meta.seoIndexPolicy =
    'Sitemap/canonical/robots/BreadcrumbList/WebPage/ItemList ownership is registry-driven. Native business/article/FAQ schema requires source review.';
});

function addImport(text, line) {
  if (text.includes(line)) return text;
  const imports = [...text.matchAll(/^import .*;$/gm)];
  if (imports.length) {
    const last = imports.at(-1);
    const end = last.index + last[0].length;
    return text.slice(0, end) + '\n' + line + text.slice(end);
  }
  if (text.startsWith('---')) {
    const second = text.indexOf('---', 3);
    if (second > 0) return text.slice(0, second) + line + '\n' + text.slice(second);
  }
  throw new Error('Unable to find Astro frontmatter import block');
}

if (layoutRel) {
  const layout = path.resolve(root, layoutRel);
  if (!layout.startsWith(root + path.sep)) throw new Error('Layout must be inside repository root');
  if (!fs.existsSync(layout)) throw new Error(`Layout not found: ${layoutRel}`);
  const before = fs.readFileSync(layout, 'utf8');
  let after = before;

  const alreadyManaged =
    after.includes('<ArchitectureSeoControl') ||
    after.includes('data-architecture-seo=');

  const conflicts = [];
  if (!alreadyManaged && /rel=["']canonical["']/i.test(after)) conflicts.push('canonical');
  if (!alreadyManaged && /name=["']robots["']/i.test(after)) conflicts.push('robots');
  if (!alreadyManaged && /application\/ld\+json/i.test(after)) conflicts.push('JSON-LD');
  if (!alreadyManaged && /<(?:SEO|Seo|BaseHead|HeadSEO|SEOHead)\b/.test(after)) conflicts.push('existing SEO head component');

  if (conflicts.length) {
    warnings.push(
      `REVIEW_REQUIRED: ${layoutRel} already contains ${conflicts.join(', ')}. ` +
      'ArchitectureSeoControl was NOT inserted to avoid duplicate canonical/robots/schema.'
    );
  } else if (!alreadyManaged) {
    after = addImport(
      after,
      "import ArchitectureSeoControl from '../components/architecture/ArchitectureSeoControl.astro';"
    );
    const headClose = after.search(/<\/head>/i);
    if (headClose < 0) throw new Error('Unable to locate </head> in selected layout');
    const tag =
      '    <ArchitectureSeoControl pathname={Astro.url.pathname} title={Astro.props.title} description={Astro.props.description} />\n';
    after = after.slice(0, headClose) + tag + after.slice(headClose);
    if (after !== before) edits.push({file: layout, rel: layoutRel, before, after});
  }
} else {
  warnings.push(
    'SEO_HEAD_INTEGRATION_PENDING: pass --layout=src/layouts/<actual-layout>.astro in the real repository. ' +
    'The installer will refuse to duplicate existing canonical/robots/JSON-LD.'
  );
}

if (sitemapRel) {
  const sitemapPath = path.resolve(root, sitemapRel);
  if (!sitemapPath.startsWith(root + path.sep)) throw new Error('Sitemap path must be inside repository root');
  if (fs.existsSync(sitemapPath)) {
    const existing = fs.readFileSync(sitemapPath, 'utf8');
    if (!existing.includes('ARCHITECTURE_BATCH_9_GENERATED')) {
      warnings.push(
        `REVIEW_REQUIRED: ${sitemapRel} already exists and is unmanaged. It was NOT overwritten. ` +
        'Generate the safe audit sitemap and compare/merge first.'
      );
    } else {
      warnings.push(
        `MANAGED_SITEMAP_PRESENT: ${sitemapRel}. Use generate-architecture-sitemap.mjs --replace-managed after validation.`
      );
    }
  } else {
    warnings.push(
      `SITEMAP_WRITE_PENDING: ${sitemapRel} does not exist. Run generate-architecture-sitemap.mjs --output=${sitemapRel} after validation.`
    );
  }
} else {
  warnings.push(
    'PRODUCTION_SITEMAP_INTEGRATION_PENDING: no --sitemap path supplied. Batch 9 will not guess or overwrite the repository sitemap.'
  );
}

console.log('ARCHITECTURE BATCH 9 — SEO INDEX CONTROL APPLY');
console.log(`Mode: ${dryRun ? 'DRY_RUN' : 'WRITE'}`);
console.log(`Files to change: ${edits.length}`);
console.log(`Layout integration: ${layoutRel ?? 'NOT_REQUESTED'}`);
console.log(`Production sitemap target: ${sitemapRel ?? 'NOT_REQUESTED'}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (!dryRun) {
  for (const edit of edits) fs.writeFileSync(edit.file, edit.after, 'utf8');
}

console.log(warnings.some((w)=>w.startsWith('REVIEW_REQUIRED'))
  ? 'VERDICT: PASS_WITH_REVIEW_REQUIRED'
  : 'VERDICT: PASS_WITH_SOURCE_INTEGRATION_WARNING');
