#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const live = registry.routes.filter((node) => node.kind === 'LIVE');
const indexable = live.filter((node) => node.indexState === 'INDEX');
const byUrl = new Map(live.map((node) => [node.url, node]));
const errors = [];
const warnings = [];

const expectedLive = registry.meta.currentRoutes ?? registry.meta.baselineRoutes;
const expectedIndexable = registry.meta.currentIndexable ?? registry.meta.baselineIndexable;
if (live.length !== expectedLive) errors.push(`Live route count changed: ${live.length} != ${expectedLive}`);
if (indexable.length !== expectedIndexable) errors.push(`Indexable route count changed: ${indexable.length} != ${expectedIndexable}`);
if (release.coreHubs.length !== 9) errors.push(`Core hub count changed: ${release.coreHubs.length} != 9`);

function liveParent(url) {
  const p = byUrl.get(url)?.recommendedParent;
  return p && !p.startsWith('virtual:') && byUrl.has(p) ? p : null;
}
function breadcrumb(url) {
  if (url === '/' || !byUrl.has(url)) return [];
  const chain = [url];
  const seen = new Set(chain);
  let cursor = url;
  while (true) {
    const p = liveParent(cursor);
    if (!p || p === '/') break;
    if (seen.has(p)) throw new Error(`Breadcrumb cycle at ${url}`);
    seen.add(p); chain.unshift(p); cursor = p;
  }
  return ['/', ...chain];
}

let breadcrumbRoutes = 0;
let deepBreadcrumbRoutes = 0;
let virtualParentRoutes = 0;
for (const node of live) {
  if (node.url === '/') continue;
  const bc = breadcrumb(node.url);
  breadcrumbRoutes += 1;
  if (bc.length >= 3) deepBreadcrumbRoutes += 1;
  if (node.recommendedParent?.startsWith('virtual:')) {
    virtualParentRoutes += 1;
    if (bc.some((url) => url.startsWith('virtual:'))) errors.push(`Virtual breadcrumb leaked for ${node.url}`);
    const futureUrls = registry.virtualNodes.map((v) => v.futureUrl).filter(Boolean);
    if (bc.some((url) => futureUrls.includes(url))) errors.push(`Planned future URL leaked into breadcrumb for ${node.url}`);
  }
  const currentCount = bc.filter((url) => url === node.url).length;
  if (currentCount !== 1) errors.push(`Current page breadcrumb ownership invalid for ${node.url}`);
}

for (const apple of release.appleBridge.members) {
  const bc = breadcrumb(apple);
  if (bc.length !== 2 || bc[0] !== '/' || bc[1] !== apple) errors.push(`Apple bridge breadcrumb must remain HOME→CURRENT: ${apple}`);
}
for (const node of live.filter((n) => n.cluster === 'LOCATION')) {
  const bc = breadcrumb(node.url);
  if (node.url === '/พื้นที่') {
    if (bc.length !== 2 || bc[0] !== '/' || bc[1] !== '/พื้นที่') errors.push('Local hub breadcrumb must be HOME→/พื้นที่');
  } else {
    if (bc.length !== 3 || bc[0] !== '/' || bc[1] !== '/พื้นที่' || bc[2] !== node.url) {
      errors.push(`Local child breadcrumb must be HOME→/พื้นที่→CURRENT: ${node.url}`);
    }
  }
}

const runtimeTs = path.join(root, 'src/config/runtime-architecture.ts');
const breadcrumbComponent = path.join(root, 'src/components/architecture/ArchitectureBreadcrumbs.astro');
const relatedComponent = path.join(root, 'src/components/architecture/ArchitectureRelatedServices.astro');
for (const file of [runtimeTs, breadcrumbComponent, relatedComponent]) {
  if (!fs.existsSync(file)) errors.push(`Missing Batch 2 runtime file: ${path.relative(root, file)}`);
}

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.isFile() && full.endsWith(ext)) out.push(full);
  }
  return out;
}

const repoLike = fs.existsSync(path.join(root, 'package.json')) && fs.existsSync(path.join(root, 'src/layouts'));
let runtimeLayouts = [];
let staleBatch1Blocks = 0;
if (repoLike) {
  runtimeLayouts = walk(path.join(root, 'src/layouts'), '.astro').filter((file) => {
    const text = fs.readFileSync(file, 'utf8');
    return text.includes('ARCHITECTURE:BATCH2:BREADCRUMBS') && text.includes('ARCHITECTURE:BATCH2:RELATED');
  });
  if (runtimeLayouts.length !== 1) {
  const realIntegrated = [
    'src/pages/[slug].astro',
    'src/pages/พื้นที่/[slug].astro',
    'src/pages/บทความ/[slug].astro',
  ].every((rel) => {
    const file = path.join(root, rel);
    return fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes('getRuntimeBreadcrumbs');
  });
  if (!realIntegrated) errors.push(`No managed Batch 2 layout and real dynamic-page runtime integration is incomplete`);
}
  for (const file of walk(path.join(root, 'src/content/services'), '.md')) {
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes('ARCHITECTURE:BATCH1:START') || text.includes('ARCHITECTURE:BATCH1:END')) staleBatch1Blocks += 1;
  }
  if (staleBatch1Blocks) errors.push(`Stale Batch 1 managed blocks remain after runtime integration: ${staleBatch1Blocks}`);
} else {
  warnings.push('Batch 2 uses direct real-source dynamic-page integration instead of a managed shared-layout marker.');
}

console.log('ARCHITECTURE BATCH 2 — VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Breadcrumb-owned routes: ${breadcrumbRoutes}`);
console.log(`Deep breadcrumb routes (HOME→PARENT→CURRENT+): ${deepBreadcrumbRoutes}`);
console.log(`Virtual-parent routes safely flattened: ${virtualParentRoutes}`);
console.log(`Runtime layouts detected: ${runtimeLayouts.length}`);
console.log(`Stale Batch 1 blocks: ${staleBatch1Blocks}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
