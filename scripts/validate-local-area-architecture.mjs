#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const local = JSON.parse(fs.readFileSync(path.join(root, 'src/config/local-area-release.json'), 'utf8'));
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'src/config/internal-link-recovery.json'), 'utf8'));
const triage = JSON.parse(fs.readFileSync(path.join(root, 'src/config/cannibalization-triage.json'), 'utf8'));

const live = registry.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const byUrl = new Map(live.map((n) => [n.url, n]));
const errors = [];
const warnings = [];

if (live.length !== registry.meta.currentRoutes) errors.push(`Current live route count drift: ${live.length}`);
if (indexable.length !== registry.meta.currentIndexable) errors.push(`Current indexable route count drift: ${indexable.length}`);
if (registry.meta.baselineRoutes !== 89 || registry.meta.baselineIndexable !== 88) errors.push('Immutable Batch 0 baseline was altered');
if (registry.meta.currentRoutes < 90 || registry.meta.currentIndexable < 89) errors.push('Current release counters regressed below Batch 5 baseline');

const hub = byUrl.get('/พื้นที่');
if (!hub) errors.push('Missing live /พื้นที่ route');
else {
  if (hub.pageType !== 'Local authority hub') errors.push(`Unexpected /พื้นที่ pageType: ${hub.pageType}`);
  if (hub.cluster !== 'LOCATION' || hub.tier !== 'A') errors.push('/พื้นที่ must be LOCATION tier A');
  if (hub.indexState !== 'INDEX' || hub.canonicalOwner !== '/พื้นที่') errors.push('/พื้นที่ must be indexable and self-canonical');
  if (hub.recommendedParent !== '/') errors.push('/พื้นที่ must be a child of homepage');
}
if (registry.virtualNodes.some((n) => n.id === 'virtual:local-hub')) errors.push('virtual:local-hub still exists after release');
if (!registry.virtualNodes.some((n) => n.id === 'virtual:apple-hub')) errors.push('Apple virtual hub was accidentally removed');

const children = local.hub.children;
const expectedLocalChildren = local.meta.currentAreaRoutes ?? local.meta.existingAreaRoutes ?? 11;
if (children.length !== expectedLocalChildren) errors.push(`Expected ${expectedLocalChildren} governed local children; got ${children.length}`);
if (new Set(children).size !== children.length) errors.push('Duplicate local children');
for (const url of children) {
  const node = byUrl.get(url);
  if (!node) { errors.push(`Local child missing: ${url}`); continue; }
  if (node.cluster !== 'LOCATION') errors.push(`Local child has wrong cluster: ${url}`);
  if (node.indexState !== 'INDEX' || node.canonicalOwner !== url) errors.push(`Local child lost self-canonical/index state: ${url}`);
  if (node.recommendedParent !== '/พื้นที่') errors.push(`Local parent not released: ${url} -> ${node.recommendedParent}`);
}
const extraLocal = live.filter((n) => n.cluster === 'LOCATION' && n.url !== '/พื้นที่' && !children.includes(n.url));
if (extraLocal.length) errors.push(`Ungoverned local routes outside local-area-release.json: ${extraLocal.map((n)=>n.url).join(', ')}`);

const releaseHub = release.coreHubs.find((h) => h.url === '/พื้นที่');
if (!releaseHub || releaseHub.role !== 'LOCAL_HUB') errors.push('/พื้นที่ is not released as LOCAL_HUB');
if (release.coreHubs.length !== 9) errors.push(`Expected 9 core/live pillars; got ${release.coreHubs.length}`);
if (release.meta.localHubState !== 'RELEASED_BATCH_5') errors.push(`Bad localHubState: ${release.meta.localHubState}`);
if (!release.homepagePrimaryHubs.includes('/พื้นที่')) errors.push('/พื้นที่ missing from homepagePrimaryHubs');
if (!recovery.homepageDiscovery.includes('/พื้นที่')) errors.push('/พื้นที่ missing from homepage discovery');
if (recovery.homepageDiscovery.includes('/พื้นที่/เมืองนครราชสีมา')) errors.push('Homepage still bypasses the local hub via เมืองนครราชสีมา seed');

const localUrls = new Set(children);
for (const area of local.areas) {
  if (!localUrls.has(area.url)) errors.push(`Unknown local-area definition: ${area.url}`);
  if (area.parent !== '/พื้นที่') errors.push(`Invalid local area parent: ${area.url}`);
  if (area.related.length < 2 || area.related.length > local.meta.maxRelatedAreas) {
    errors.push(`Related-area count out of bounds for ${area.url}: ${area.related.length}`);
  }
  if (new Set(area.related).size !== area.related.length) errors.push(`Duplicate related areas for ${area.url}`);
  for (const target of area.related) {
    if (!localUrls.has(target)) errors.push(`Invalid related-area target ${area.url} -> ${target}`);
    if (target === area.url) errors.push(`Self-related local area: ${area.url}`);
  }
}

// Verify every local page has at least two projected contextual inbound sources:
// hub discovery + explicit related-area links (or child breadcrumbs into hub).
const inbound = new Map(['/พื้นที่', ...children].map((u) => [u, new Set()]));
for (const child of children) inbound.get('/พื้นที่').add(`breadcrumb:${child}`);
inbound.get('/พื้นที่').add('homepage');
for (const area of local.areas) {
  inbound.get(area.url).add('/พื้นที่');
  for (const target of area.related) inbound.get(target)?.add(area.url);
}
const low = [...inbound.entries()].filter(([,sources]) => sources.size < 2);
if (low.length) errors.push(`Local projected inbound<2: ${low.map(([u,s])=>`${u}(${s.size})`).join(', ')}`);

const localGroup = triage.groups.find((g) => g.id === 'LOCAL_AREA_FAMILY');
if (!localGroup) errors.push('LOCAL_AREA_FAMILY triage group missing');
else {
  if (localGroup.owner !== '/พื้นที่') errors.push(`Local triage owner must be /พื้นที่, got ${localGroup.owner}`);
  if (!localGroup.urls.includes('/พื้นที่')) errors.push('Local triage group must include released hub');
}

const page = path.join(root, 'src/pages/พื้นที่/index.astro');
if (!fs.existsSync(page)) errors.push('Missing src/pages/พื้นที่/index.astro');
else {
  const text = fs.readFileSync(page, 'utf8');
  for (const marker of ['พื้นที่ให้บริการรับซื้อไอทีในโคราช', 'canonical="/พื้นที่"', 'Breadcrumbs', 'BaseLayout']) {
    if (!text.includes(marker)) errors.push(`Local hub page missing real-source marker: ${marker}`);
  }
}

const runtime = fs.readFileSync(path.join(root, 'src/config/runtime-architecture.ts'), 'utf8');
for (const marker of ["local-area-release.json", "LOCAL_RELATED", "localRelatedAreas.get(current)", "current === '/พื้นที่'"]) {
  if (!runtime.includes(marker)) errors.push(`Runtime missing local-release marker: ${marker}`);
}

console.log('ARCHITECTURE BATCH 5 — LOCAL AREA ARCHITECTURE VALIDATION');
console.log(`Live routes: ${live.length} (Batch 5 local baseline preserved; later releases allowed)`);
console.log(`Indexable: ${indexable.length} (Batch 5 local baseline preserved; later releases allowed)`);
console.log(`Local authority hub: ${hub ? 'LIVE' : 'MISSING'}`);
console.log(`Released local children: ${children.length}`);
console.log(`Virtual local hub remaining: ${registry.virtualNodes.some((n)=>n.id==='virtual:local-hub')}`);
console.log(`Homepage local seed: ${recovery.homepageDiscovery.includes('/พื้นที่') ? '/พื้นที่' : 'MISSING'}`);
console.log(`Local routes projected inbound<2: ${low.length}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
