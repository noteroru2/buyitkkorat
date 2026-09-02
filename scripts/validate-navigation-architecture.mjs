#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const architecture = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const navigation = JSON.parse(fs.readFileSync(path.join(root, 'src/config/navigation-architecture.json'), 'utf8'));
const brand = JSON.parse(fs.readFileSync(path.join(root, 'src/config/brand-model-series-foundation.json'), 'utf8'));
const guide = JSON.parse(fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'src/config/internal-link-recovery.json'), 'utf8'));

const live = architecture.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const byUrl = new Map(live.map((n) => [n.url, n]));
const errors = [];
const warnings = [];

if (live.length !== architecture.meta.currentRoutes) errors.push(`Navigation live count drift: ${live.length}`);
if (indexable.length !== architecture.meta.currentIndexable) errors.push(`Navigation indexable count drift: ${indexable.length}`);
if (navigation.meta.newLiveRoutes !== 5) errors.push(`navigation meta newLiveRoutes must reflect real-repo merge additions (5), got ${navigation.meta.newLiveRoutes}`);
if (navigation.meta.automaticCandidateExposure !== false) errors.push('automaticCandidateExposure must be false');
if (navigation.meta.virtualHrefAllowed !== false) errors.push('virtualHrefAllowed must be false');

if (navigation.header.primary.length > navigation.meta.primaryItemLimit) {
  errors.push(`Header primary limit exceeded: ${navigation.header.primary.length}`);
}
if (navigation.footer.columns.length > navigation.meta.footerColumnLimit) {
  errors.push(`Footer column limit exceeded: ${navigation.footer.columns.length}`);
}

const headerUrls = [];
for (const item of navigation.header.primary) {
  if (item.children.length > navigation.meta.submenuLinkLimit) {
    errors.push(`Header submenu limit exceeded: ${item.id}=${item.children.length}`);
  }
  if (item.href) headerUrls.push(item.href);
  for (const child of item.children) headerUrls.push(child.href);
}
for (const item of navigation.header.utility) headerUrls.push(item.href);

const footerUrls = [];
for (const column of navigation.footer.columns) {
  if (column.links.length > navigation.meta.footerLinksPerColumnLimit) {
    errors.push(`Footer link limit exceeded: ${column.id}=${column.links.length}`);
  }
  for (const item of column.links) footerUrls.push(item.href);
}

const homepageUrls = [
  ...navigation.discovery.homepage.primaryHubs,
  ...navigation.discovery.homepage.appleDirectOwners,
];

for (const [surface, urls] of [
  ['HEADER', headerUrls],
  ['FOOTER', footerUrls],
  ['HOMEPAGE_DISCOVERY', homepageUrls],
]) {
  for (const url of urls) {
    const node = byUrl.get(url);
    if (!node) errors.push(`${surface} links non-live URL: ${url}`);
    else if (node.indexState !== 'INDEX') errors.push(`${surface} links non-indexable URL: ${url}`);
    if (url.startsWith('virtual:')) errors.push(`${surface} emitted virtual href: ${url}`);
  }
}

const candidateUrls = new Set([
  ...brand.candidateBrands.map((c) => c.candidateUrl),
  ...brand.candidateSeries.map((c) => c.candidateUrl),
  ...guide.candidateGuides.map((c) => c.candidateUrl),
]);
const globalUrls = new Set([...headerUrls, ...footerUrls, ...homepageUrls]);
const leakedCandidates = [...candidateUrls].filter((url) => globalUrls.has(url));
if (leakedCandidates.length) errors.push(`Unreleased candidates leaked global: ${leakedCandidates.join(', ')}`);

// No virtual planned URL may leak as href.
const forbiddenVirtualFragments = [
  '/รับซื้อ-apple-โคราช',
  '/บทความ/กลุ่ม/',
];
for (const url of globalUrls) {
  for (const fragment of forbiddenVirtualFragments) {
    if (url === fragment || url.startsWith(fragment)) errors.push(`Virtual/planned href leaked: ${url}`);
  }
}

// Every Tier A indexable owner except Homepage must have at least one global discovery path.
// This intentionally includes เมืองนครราชสีมา because it is Tier A in the current registry.
const tierA = live.filter((n) => n.tier === 'A' && n.indexState === 'INDEX' && n.url !== '/');
const missingTierA = tierA.filter((n) => !globalUrls.has(n.url));
if (missingTierA.length) {
  errors.push(`Tier A routes missing global discovery: ${missingTierA.map((n)=>n.url).join(', ')}`);
}

// Hub-first rule: don't enumerate all location/article children globally.
const allLocationChildren = live.filter((n)=>n.cluster==='LOCATION' && n.url !== '/พื้นที่').map((n)=>n.url);
const allArticleChildren = live.filter((n)=>n.pageType==='Article').map((n)=>n.url);
const globalLocationChildren = allLocationChildren.filter((u)=>globalUrls.has(u));
const globalArticleChildren = allArticleChildren.filter((u)=>globalUrls.has(u));
if (globalLocationChildren.length > 4) errors.push(`Too many location children globally exposed: ${globalLocationChildren.length}`);
if (globalArticleChildren.length > 0) errors.push(`Article children should be discovered via /บทความ and contextual graph, not global nav: ${globalArticleChildren.length}`);

// Components and safety helper.
for (const rel of [
  'src/components/architecture/ArchitectureHeader.astro',
  'src/components/architecture/ArchitectureFooter.astro',
  'src/components/architecture/ArchitectureDiscoveryNav.astro',
]) {
  if (!fs.existsSync(path.join(root, rel))) errors.push(`Missing navigation component: ${rel}`);
}
const helper = fs.readFileSync(path.join(root, 'src/config/navigation-architecture.ts'), 'utf8');
for (const marker of [
  'canExposeUnreleasedNavigationCandidate(): false',
  'canEmitVirtualNavigationHref(): false',
  'return false',
]) {
  if (!helper.includes(marker)) errors.push(`Navigation safety helper missing: ${marker}`);
}

if (core.meta.navigationArchitectureState !== 'GLOBAL_NAV_CONFIG_BATCH_8') {
  errors.push('Batch 8 config installer has not updated core-hub-release.json');
}
if (recovery.meta.globalNavigationState !== 'BATCH_8') {
  errors.push('Batch 8 config installer has not updated internal-link-recovery.json');
}

// Optional real-layout integration check.
const layoutArg = process.argv.find((x)=>x.startsWith('--layout='));
if (layoutArg) {
  const rel = layoutArg.slice('--layout='.length);
  const file = path.resolve(root, rel);
  if (!fs.existsSync(file)) errors.push(`Layout not found: ${rel}`);
  else {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('<ArchitectureHeader')) errors.push(`Layout missing ArchitectureHeader: ${rel}`);
    if (!text.includes('<ArchitectureFooter')) errors.push(`Layout missing ArchitectureFooter: ${rel}`);
  }
} else {
  warnings.push('Global shell layout integration not attested in this overlay; validate with --layout in the real repository.');
}

console.log('ARCHITECTURE BATCH 8 — NAVIGATION / HEADER / FOOTER / DISCOVERY VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Header primary groups: ${navigation.header.primary.length}/${navigation.meta.primaryItemLimit}`);
console.log(`Header hrefs (with utility): ${headerUrls.length}`);
console.log(`Footer columns: ${navigation.footer.columns.length}/${navigation.meta.footerColumnLimit}`);
console.log(`Footer hrefs: ${footerUrls.length}`);
console.log(`Homepage discovery hrefs: ${homepageUrls.length}`);
console.log(`Tier A global-discovery failures: ${missingTierA.length}`);
console.log(`Unreleased candidate leaks: ${leakedCandidates.length}`);
console.log(`Global article-child links: ${globalArticleChildren.length}`);
console.log(`Global location-child links: ${globalLocationChildren.length}`);
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
