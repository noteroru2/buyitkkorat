#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const START = '<!-- ARCHITECTURE:BATCH1:START -->';
const END = '<!-- ARCHITECTURE:BATCH1:END -->';
const byUrl = new Map(registry.routes.map((node) => [node.url, node]));
const errors = [];
const warnings = [];

const live = registry.routes.filter((node) => node.kind === 'LIVE');
const indexable = live.filter((node) => node.indexState === 'INDEX');
const expectedLive = registry.meta.currentRoutes ?? registry.meta.baselineRoutes;
const expectedIndexable = registry.meta.currentIndexable ?? registry.meta.baselineIndexable;
if (live.length !== expectedLive) errors.push(`Live route count changed: ${live.length} != ${expectedLive}`);
if (indexable.length !== expectedIndexable) errors.push(`Indexable count changed: ${indexable.length} != ${expectedIndexable}`);

if (release.coreHubs.length !== 9) errors.push(`Expected 9 live release pillars after Batch 5; got ${release.coreHubs.length}`);
const seenHub = new Set();
for (const hub of release.coreHubs) {
  if (seenHub.has(hub.url)) errors.push(`Duplicate core hub: ${hub.url}`);
  seenHub.add(hub.url);
  const node = byUrl.get(hub.url);
  if (!node) errors.push(`Core hub is not a live route: ${hub.url}`);
  else {
    if (node.indexState !== 'INDEX') errors.push(`Core hub is not indexable: ${hub.url}`);
    if (node.canonicalOwner !== hub.url) errors.push(`Core hub lost self-canonical ownership: ${hub.url}`);
  }
  for (const peer of hub.peerLinks) {
    if (!byUrl.has(peer)) errors.push(`Core peer link is not live: ${hub.url} -> ${peer}`);
    if (peer.startsWith('virtual:') || peer === release.appleBridge.futureUrl) errors.push(`Virtual/planned href leaked from core hub: ${hub.url} -> ${peer}`);
  }
}

if (release.appleBridge.members.length !== 5) errors.push(`Apple bridge member count changed: ${release.appleBridge.members.length}`);
for (const url of release.appleBridge.members) {
  const node = byUrl.get(url);
  if (!node || node.cluster !== 'APPLE') errors.push(`Apple bridge invalid member: ${url}`);
}
if (byUrl.has(release.appleBridge.futureUrl)) warnings.push('A real Apple hub now exists; Batch 1 bridge should be retired in a follow-up release.');

const localVirtual = registry.virtualNodes.find((node) => node.id === 'virtual:local-hub');
if (localVirtual) errors.push('virtual:local-hub must be retired after Batch 5');
const localHub = byUrl.get('/พื้นที่');
if (!localHub || localHub.indexState !== 'INDEX' || localHub.canonicalOwner !== '/พื้นที่') {
  errors.push('Released local hub /พื้นที่ is missing or invalid');
}
if (release.meta.localHubState !== 'RELEASED_BATCH_5') errors.push(`Unexpected local hub state: ${release.meta.localHubState}`);

// Runtime managed block verification is strict only when the real repository source tree is present.
const repoLike = fs.existsSync(path.join(root, 'package.json')) && fs.existsSync(path.join(root, 'src/content/services'));
let managedFiles = 0;
if (repoLike) {
  for (const node of registry.routes) {
    if (!node.sourceHint?.startsWith('src/content/services/') || !node.sourceHint.endsWith('.md')) continue;
    const file = path.join(root, node.sourceHint);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (text.includes(START) || text.includes(END)) {
      if (!(text.includes(START) && text.includes(END))) errors.push(`Incomplete Batch 1 managed block: ${node.sourceHint}`);
      else managedFiles += 1;
    }
  }
  if (managedFiles === 0) warnings.push('Runtime managed blocks are not applied yet. Run node scripts/apply-core-hub-architecture.mjs');
}

console.log('ARCHITECTURE BATCH 1 — VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Live release pillars: ${release.coreHubs.length}`);
console.log(`Apple bridge members: ${release.appleBridge.members.length}`);
console.log(`Local hub state: ${release.meta.localHubState}`);
console.log(`Runtime managed files detected: ${managedFiles}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
