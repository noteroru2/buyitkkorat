#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registryPath = path.join(root, 'src', 'config', 'site-architecture.json');
const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const nodes = [...data.virtualNodes, ...data.routes];
const byId = new Map();
const byUrl = new Map();
const errors = [];
const warnings = [];

for (const node of nodes) {
  if (!node.id) errors.push('Node without id');
  if (byId.has(node.id)) errors.push(`Duplicate id: ${node.id}`);
  byId.set(node.id, node);
  if (node.url) {
    if (byUrl.has(node.url)) errors.push(`Duplicate URL: ${node.url}`);
    byUrl.set(node.url, node);
  }
}

for (const node of nodes) {
  if (node.kind === 'LIVE' && !node.url) errors.push(`LIVE node missing URL: ${node.id}`);
  if (node.kind === 'VIRTUAL' && node.indexState !== 'PLANNED') {
    errors.push(`VIRTUAL node must be PLANNED: ${node.id}`);
  }
  if (node.indexState === 'INDEX' && node.canonicalOwner !== node.url) {
    errors.push(`Batch 0 forbids canonical ownership switches: ${node.id}`);
  }
  if (node.recommendedParent && !byId.has(node.recommendedParent) && !byUrl.has(node.recommendedParent)) {
    errors.push(`Unknown recommended parent ${node.recommendedParent} for ${node.id}`);
  }
  if (node.recommendedParent === node.id || (node.url && node.recommendedParent === node.url)) {
    errors.push(`Recommended self-parent is forbidden: ${node.id}`);
  }
}

// Detect recommended-parent cycles.
for (const start of nodes) {
  const seen = new Set();
  let cursor = start;
  while (cursor?.recommendedParent) {
    const key = cursor.id;
    if (seen.has(key)) {
      errors.push(`Recommended-parent cycle detected from ${start.id}`);
      break;
    }
    seen.add(key);
    cursor = byId.get(cursor.recommendedParent) ?? byUrl.get(cursor.recommendedParent);
  }
}

const live = data.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const noindex = live.filter((n) => n.indexState === 'NOINDEX');
const migrations = live.filter((n) => n.currentParent !== n.recommendedParent);
const gscRequired = live.filter((n) => n.ownershipStatus === 'GSC_REQUIRED');
const virtualParentChildren = live.filter((n) => n.recommendedParent?.startsWith('virtual:'));

const expectedLive = data.meta.currentRoutes ?? data.meta.baselineRoutes;
const expectedIndexable = data.meta.currentIndexable ?? data.meta.baselineIndexable;
const expectedNoindex = data.meta.currentNoindex ?? data.meta.baselineNoindex;
if (live.length !== expectedLive) errors.push(`Live route count ${live.length} != current expected ${expectedLive}`);
if (indexable.length !== expectedIndexable) errors.push(`Indexable count ${indexable.length} != current expected ${expectedIndexable}`);
if (noindex.length !== expectedNoindex) errors.push(`Noindex count ${noindex.length} != current expected ${expectedNoindex}`);

// Source hints are advisory because Astro routes may be generated indirectly.
// Only run filesystem checks when this overlay is actually inside a repository.
const repoLike = fs.existsSync(path.join(root, 'package.json')) && fs.existsSync(path.join(root, 'src'));
if (repoLike) for (const node of live) {
  const hint = node.sourceHint || '';
  if (!hint || hint.includes('(verify actual router)')) continue;
  if (!fs.existsSync(path.join(root, hint))) warnings.push(`Source hint not found (verify router): ${node.url} -> ${hint}`);
}

console.log('ARCHITECTURE BATCH 0 — VALIDATION');
console.log(`Baseline live/indexable: ${data.meta.baselineRoutes}/${data.meta.baselineIndexable}`);
console.log(`Current live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Noindex: ${noindex.length}`);
console.log(`Virtual architecture hubs: ${data.virtualNodes.length}`);
console.log(`Parent migrations queued (not executed): ${migrations.length}`);
console.log(`GSC-gated ownership routes: ${gscRequired.length}`);
console.log(`Routes waiting on virtual parent release: ${virtualParentChildren.length}`);
console.log(`Warnings: ${warnings.length}`);

if (warnings.length) {
  for (const item of warnings.slice(0, 20)) console.warn(`WARN: ${item}`);
  if (warnings.length > 20) console.warn(`WARN: ... ${warnings.length - 20} more`);
}
if (errors.length) {
  for (const item of errors) console.error(`ERROR: ${item}`);
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
