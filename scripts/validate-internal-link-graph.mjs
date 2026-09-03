#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'src/config/internal-link-recovery.json'), 'utf8'));
const live = registry.routes.filter((node) => node.kind === 'LIVE');
const indexable = live.filter((node) => node.indexState === 'INDEX');
const byUrl = new Map(live.map((node) => [node.url, node]));
const coreHubs = new Map(release.coreHubs.map((hub) => [hub.url, hub]));
const apple = release.appleBridge.members;
const errors = [];
const warnings = [];

const expectedLive = registry.meta.currentRoutes ?? registry.meta.baselineRoutes;
const expectedIndexable = registry.meta.currentIndexable ?? registry.meta.baselineIndexable;
if (live.length !== expectedLive) errors.push(`Live route count changed: ${live.length} != ${expectedLive}`);
if (indexable.length !== expectedIndexable) errors.push(`Indexable route count changed: ${indexable.length} != ${expectedIndexable}`);
if (recovery.homepageDiscovery.length > recovery.meta.maxHubDiscoveryLinks) errors.push('Homepage discovery exceeds maxHubDiscoveryLinks');
if (new Set(recovery.homepageDiscovery).size !== recovery.homepageDiscovery.length) errors.push('Duplicate homepage discovery targets');

for (const url of recovery.homepageDiscovery) {
  if (!byUrl.has(url) || byUrl.get(url).indexState !== 'INDEX') errors.push(`Invalid homepage discovery target: ${url}`);
  if (url.includes('/รับซื้อ-apple-โคราช')) errors.push(`Virtual Apple route leaked into homepage discovery: ${url}`);
}
for (const [source, targets] of Object.entries(recovery.conversionBridges)) {
  if (!byUrl.has(source)) errors.push(`Unknown conversion bridge source: ${source}`);
  for (const target of targets) {
    if (!byUrl.has(target) || byUrl.get(target).indexState !== 'INDEX') errors.push(`Invalid conversion target ${source} -> ${target}`);
  }
}

function liveParent(url) {
  const p = byUrl.get(url)?.recommendedParent;
  return p && !p.startsWith('virtual:') && byUrl.has(p) ? p : null;
}
function children(url) {
  return indexable.filter((node) => node.recommendedParent === url).map((node) => node.url);
}
function breadcrumbs(url) {
  if (url === '/' || !byUrl.has(url)) return [];
  const chain = [url];
  const seen = new Set([url]);
  let cursor = url;
  while (true) {
    const parent = liveParent(cursor);
    if (!parent || parent === '/') break;
    if (seen.has(parent)) break;
    seen.add(parent); chain.unshift(parent); cursor = parent;
  }
  return ['/', ...chain];
}
function discovery(url) {
  const raw = url === '/' ? recovery.homepageDiscovery : children(url);
  return raw.filter((target) => byUrl.get(target)?.indexState === 'INDEX').slice(0, recovery.meta.maxHubDiscoveryLinks);
}
function rotatedSiblings(url) {
  const parent = liveParent(url);
  if (!parent || parent === '/') return [];
  const all = children(parent);
  const index = all.indexOf(url);
  if (index < 0 || all.length < 2) return [];
  const out = [];
  for (let offset = 1; offset < all.length; offset += 1) out.push(all[(index + offset) % all.length]);
  return out;
}
function related(url) {
  const node = byUrl.get(url);
  if (!node || node.indexState !== 'INDEX' || url === '/' || node.cluster === 'TRUST') return [];
  const out = [];
  const seen = new Set([url, ...discovery(url)]);
  const push = (target) => {
    if (target === url || seen.has(target) || byUrl.get(target)?.indexState !== 'INDEX') return;
    seen.add(target); out.push(target);
  };
  for (const target of recovery.conversionBridges[url] ?? []) { push(target); if (out.length >= recovery.meta.maxRelatedLinks) return out; }
  if (apple.includes(url)) {
    const start = apple.indexOf(url);
    for (let offset = 1; offset < apple.length; offset += 1) { push(apple[(start + offset) % apple.length]); if (out.length >= recovery.meta.maxRelatedLinks) return out; }
  } else {
    const hub = coreHubs.get(url);
    if (hub) for (const target of hub.peerLinks) { push(target); if (out.length >= recovery.meta.maxRelatedLinks) return out; }
  }
  for (const target of rotatedSiblings(url)) { push(target); if (out.length >= recovery.meta.maxRelatedLinks) return out; }
  return out;
}

const inbound = new Map(indexable.map((node) => [node.url, new Set()]));
let maxDiscovery = 0;
let maxRelated = 0;
for (const node of indexable) {
  const url = node.url;
  const d = discovery(url);
  const r = related(url);
  maxDiscovery = Math.max(maxDiscovery, d.length);
  maxRelated = Math.max(maxRelated, r.length);
  if (d.some((target) => r.includes(target))) errors.push(`Discovery/related duplication on ${url}`);
  for (const target of breadcrumbs(url).slice(0, -1)) inbound.get(target)?.add(url);
  for (const target of d) inbound.get(target)?.add(url);
  for (const target of r) inbound.get(target)?.add(url);
}
if (maxDiscovery > recovery.meta.maxHubDiscoveryLinks) errors.push(`Projected discovery max ${maxDiscovery} exceeds cap`);
if (maxRelated > recovery.meta.maxRelatedLinks) errors.push(`Projected related max ${maxRelated} exceeds cap`);

const rows = indexable.map((node) => ({ node, inbound: inbound.get(node.url)?.size ?? 0 }));
const contextualGateFailures = rows.filter(({node, inbound}) =>
  ['A','B'].includes(node.tier) && node.cluster !== 'TRUST' && inbound < 2
);
const articleGateFailures = rows.filter(({node, inbound}) => node.pageType === 'Article' && inbound < 2);
const locationGateFailures = rows.filter(({node, inbound}) => node.cluster === 'LOCATION' && inbound < 2);
const zeroInbound = rows.filter(({inbound}) => inbound === 0);
const unexpectedZero = zeroInbound.filter(({node}) => node.cluster !== 'TRUST');
if (contextualGateFailures.length) errors.push(`Tier A/B contextual inbound gate failed for ${contextualGateFailures.length} routes`);
if (articleGateFailures.length) errors.push(`Article inbound gate failed for ${articleGateFailures.length} routes`);
if (locationGateFailures.length) errors.push(`Location inbound gate failed for ${locationGateFailures.length} routes`);
if (unexpectedZero.length) errors.push(`Unexpected projected contextual orphans: ${unexpectedZero.map(({node}) => node.url).join(', ')}`);

const runtime = fs.readFileSync(path.join(root, 'src/config/runtime-architecture.ts'), 'utf8');
const component = fs.readFileSync(path.join(root, 'src/components/architecture/ArchitectureRelatedServices.astro'), 'utf8');
for (const needle of ['getRuntimeDiscoveryLinks', 'rotatedSiblingUrls', 'conversionBridges']) if (!runtime.includes(needle)) errors.push(`Runtime missing Batch 3 marker: ${needle}`);
for (const needle of ['architecture-links--discovery', 'architecture-links--related']) if (!component.includes(needle)) errors.push(`Component missing Batch 3 marker: ${needle}`);

console.log('ARCHITECTURE BATCH 3 — INTERNAL LINK GRAPH VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Homepage discovery seeds: ${recovery.homepageDiscovery.length}`);
console.log(`Conversion bridge sources: ${Object.keys(recovery.conversionBridges).length}`);
console.log(`Projected max discovery links/page: ${maxDiscovery}`);
console.log(`Projected max related links/page: ${maxRelated}`);
console.log(`Projected zero contextual inbound: ${zeroInbound.length}`);
console.log(`Unexpected zero contextual inbound: ${unexpectedZero.length}`);
console.log(`Tier A/B non-TRUST/non-LOCATION inbound<2: ${contextualGateFailures.length}`);
console.log(`Articles inbound<2: ${articleGateFailures.length}`);
console.log(`Location routes inbound<2: ${locationGateFailures.length}`);
console.log(`Deferred zero by cluster: TRUST=${zeroInbound.filter(({node})=>node.cluster==='TRUST').length}`);
for (const w of warnings) console.warn(`WARN: ${w}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL'); process.exitCode = 1;
} else console.log('VERDICT: PASS');
