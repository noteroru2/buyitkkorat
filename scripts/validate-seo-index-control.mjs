#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const architecture = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const control = JSON.parse(fs.readFileSync(path.join(root, 'src/config/seo-index-control.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const brand = JSON.parse(fs.readFileSync(path.join(root, 'src/config/brand-model-series-foundation.json'), 'utf8'));
const guide = JSON.parse(fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.json'), 'utf8'));

const live = architecture.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const noindex = live.filter((n) => n.indexState !== 'INDEX');
const byUrl = new Map(live.map((n) => [n.url, n]));
const profiles = new Map(control.routeProfiles.map((p) => [p.url, p]));
const errors = [];
const warnings = [];

if (live.length !== control.meta.liveRoutes) errors.push(`SEO live route count drift: ${live.length} != ${control.meta.liveRoutes}`);
if (indexable.length !== control.meta.indexableRoutes) errors.push(`SEO indexable route count drift: ${indexable.length} != ${control.meta.indexableRoutes}`);
if (noindex.length !== 1) errors.push(`Batch 9 noindex count changed: ${noindex.length}`);
if (control.sitemap.expectedUrlCount !== control.meta.indexableRoutes) errors.push(`Sitemap expected count ${control.sitemap.expectedUrlCount} != indexable ${control.meta.indexableRoutes}`);
if (control.meta.automaticDestructiveIndexChange !== false) errors.push('automaticDestructiveIndexChange must be false');

if (control.routeProfiles.length !== live.length) {
  errors.push(`Route profile coverage mismatch: ${control.routeProfiles.length} != ${live.length}`);
}

let sitemapEligible = 0;
let canonicalEligible = 0;
let webpageSchema = 0;
let breadcrumbSchema = 0;
let itemListSchema = 0;
for (const node of live) {
  const profile = profiles.get(node.url);
  if (!profile) { errors.push(`Missing SEO profile: ${node.url}`); continue; }

  if (node.indexState === 'INDEX') {
    if (profile.robots !== 'index,follow') errors.push(`Indexable robots drift: ${node.url} -> ${profile.robots}`);
    if (!profile.sitemapEligible) errors.push(`Indexable route excluded from sitemap: ${node.url}`);
    if (!profile.canonicalPath) errors.push(`Indexable route missing canonical: ${node.url}`);
    if (profile.canonicalPath !== node.canonicalOwner) errors.push(`Canonical drift: ${node.url} -> ${profile.canonicalPath}`);
    if (!byUrl.has(profile.canonicalPath)) errors.push(`Canonical owner not live: ${node.url} -> ${profile.canonicalPath}`);
    if (byUrl.get(profile.canonicalPath)?.indexState !== 'INDEX') errors.push(`Canonical points to non-indexable owner: ${node.url}`);
    if (!profile.webPageSchema) errors.push(`Indexable route missing WebPage schema profile: ${node.url}`);
    sitemapEligible += profile.sitemapEligible ? 1 : 0;
    canonicalEligible += profile.canonicalPath ? 1 : 0;
    webpageSchema += profile.webPageSchema ? 1 : 0;
    breadcrumbSchema += profile.breadcrumbSchema ? 1 : 0;
    itemListSchema += profile.itemListSchema ? 1 : 0;
  } else {
    if (profile.robots !== 'noindex,follow') errors.push(`Noindex robots drift: ${node.url}`);
    if (profile.sitemapEligible) errors.push(`Noindex leaked into sitemap: ${node.url}`);
    if (profile.canonicalPath) errors.push(`Noindex route should not auto-emit canonical: ${node.url}`);
    if (profile.webPageSchema || profile.breadcrumbSchema || profile.itemListSchema || profile.webSiteSchema) {
      errors.push(`Noindex route leaked structured-data ownership: ${node.url}`);
    }
  }
}

if (sitemapEligible !== control.sitemap.expectedUrlCount) errors.push(`Sitemap eligible profile count ${sitemapEligible} != ${control.sitemap.expectedUrlCount}`);
if (canonicalEligible !== control.meta.indexableRoutes) errors.push(`Canonical profile count ${canonicalEligible} != ${control.meta.indexableRoutes}`);
if (webpageSchema !== control.meta.indexableRoutes) errors.push(`WebPage schema profile count ${webpageSchema} != ${control.meta.indexableRoutes}`);
if (breadcrumbSchema !== control.meta.indexableRoutes - 1) errors.push(`Breadcrumb schema profile count ${breadcrumbSchema} != ${control.meta.indexableRoutes - 1}`);
const home = profiles.get('/');
if (!home?.webSiteSchema) errors.push('Homepage must own WebSite schema');
for (const [url, profile] of profiles) {
  if (url !== '/' && profile.webSiteSchema) errors.push(`WebSite schema duplicated outside homepage: ${url}`);
}

// Unreleased candidates / virtual nodes cannot appear in profiles, sitemap or canonical ownership.
const candidateUrls = new Set([
  ...brand.candidateBrands.map((c) => c.candidateUrl),
  ...brand.candidateSeries.map((c) => c.candidateUrl),
  ...guide.candidateGuides.map((c) => c.candidateUrl),
]);
for (const url of candidateUrls) {
  if (profiles.has(url)) errors.push(`Unreleased candidate has SEO route profile: ${url}`);
}
for (const node of architecture.virtualNodes ?? []) {
  if (node.url && profiles.has(node.url)) errors.push(`Virtual node has SEO profile: ${node.url}`);
  if (node.futureUrl && profiles.has(node.futureUrl)) errors.push(`Virtual future URL has SEO profile: ${node.futureUrl}`);
}

// Safe-schema contract.
for (const type of ['WebSite','WebPage','BreadcrumbList','ItemList']) {
  if (!control.schema.safeArchitectureSchemas.includes(type)) errors.push(`Missing safe schema type: ${type}`);
}
for (const key of ['Organization','LocalBusiness','FAQPage','Article']) {
  const policy = control.schema.nativeSchema[key];
  if (!policy || !String(policy).includes('REVIEW')) errors.push(`Native schema must remain review-gated: ${key}`);
}

const helper = fs.readFileSync(path.join(root, 'src/config/seo-index-control.ts'), 'utf8');
for (const marker of [
  'canAutoIndexUnreleasedArchitectureCandidate(): false',
  'canInventBusinessSchemaFacts(): false',
  'return false',
]) {
  if (!helper.includes(marker)) errors.push(`SEO safety helper missing marker: ${marker}`);
}

// Validate generated audit sitemap if present.
const sitemapAudit = path.join(root, control.sitemap.safeDefaultOutput);
if (!fs.existsSync(sitemapAudit)) {
  warnings.push(`Audit sitemap not generated yet: ${control.sitemap.safeDefaultOutput}`);
} else {
  const xml = fs.readFileSync(sitemapAudit, 'utf8');
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (locs.length !== control.sitemap.expectedUrlCount) errors.push(`Generated audit sitemap count ${locs.length} != ${control.sitemap.expectedUrlCount}`);
  if (!xml.includes('ARCHITECTURE_BATCH_9_GENERATED')) errors.push('Audit sitemap missing Batch 9 managed marker');
  if (xml.includes('<lastmod>') || xml.includes('<changefreq>') || xml.includes('<priority>')) {
    errors.push('Audit sitemap contains invented lastmod/changefreq/priority');
  }
}

// Config apply gate.
if (core.meta.seoIndexControlState !== 'ARCHITECTURE_SEO_CONTROL_BATCH_9') {
  errors.push('Batch 9 config installer has not updated core-hub-release.json');
}

const layoutArg = process.argv.find((x)=>x.startsWith('--layout='));
if (layoutArg) {
  const rel = layoutArg.slice('--layout='.length);
  const file = path.resolve(root, rel);
  if (!fs.existsSync(file)) errors.push(`Layout not found: ${rel}`);
  else {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('<ArchitectureSeoControl')) errors.push(`Layout missing ArchitectureSeoControl: ${rel}`);
  }
} else {
  warnings.push('Real SEO head integration not attested; validate with --layout in the source repository.');
}

console.log('ARCHITECTURE BATCH 9 — SITEMAP / CANONICAL / SCHEMA / INDEX CONTROL VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Noindex: ${noindex.length}`);
console.log(`Sitemap eligible: ${sitemapEligible}`);
console.log(`Canonical profiles: ${canonicalEligible}`);
console.log(`WebPage schema profiles: ${webpageSchema}`);
console.log(`Breadcrumb schema profiles: ${breadcrumbSchema}`);
console.log(`ItemList schema profiles: ${itemListSchema}`);
console.log(`Unreleased candidates with SEO profiles: ${[...candidateUrls].filter((u)=>profiles.has(u)).length}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else if (warnings.length) {
  console.log('VERDICT: PASS_WITH_SOURCE_INTEGRATION_WARNING');
} else {
  console.log('VERDICT: PASS');
}
