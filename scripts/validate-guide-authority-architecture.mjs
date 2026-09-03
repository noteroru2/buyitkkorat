#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const architecture = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const guide = JSON.parse(fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.json'), 'utf8'));
const recovery = JSON.parse(fs.readFileSync(path.join(root, 'src/config/internal-link-recovery.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));

const live = architecture.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const byUrl = new Map(live.map((n) => [n.url, n]));
const errors = [];
const warnings = [];

if (live.length !== architecture.meta.currentRoutes) errors.push(`Guide architecture live-count drift: ${live.length} != ${architecture.meta.currentRoutes}`);
if (indexable.length !== architecture.meta.currentIndexable) errors.push(`Guide architecture indexable-count drift: ${indexable.length} != ${architecture.meta.currentIndexable}`);
if (guide.meta.newLiveRoutes !== (guide.meta.index350W6ReleasedGuides ?? 0)) errors.push(`Guide new-route metadata drift: ${guide.meta.newLiveRoutes}`);
if (guide.meta.automaticPublishing !== false) errors.push('automaticPublishing must remain false');
if (guide.guides.length !== guide.meta.existingLiveGuides) errors.push(`Guide count drift: ${guide.guides.length} != ${guide.meta.existingLiveGuides}`);
if (guide.clusters.length !== 5) errors.push(`Expected 5 virtual guide clusters; got ${guide.clusters.length}`);
if (core.meta.guideAuthorityState !== 'RUNTIME_GUIDE_GRAPH_BATCH_7') {
  errors.push('Batch 7 runtime installer has not updated core-hub-release.json');
}

const guideUrls = new Set();
const clusterIds = new Set(guide.clusters.map((c) => c.id));
for (const item of guide.guides) {
  if (guideUrls.has(item.url)) errors.push(`Duplicate guide: ${item.url}`);
  guideUrls.add(item.url);

  const node = byUrl.get(item.url);
  if (!node) errors.push(`Configured guide is not live: ${item.url}`);
  else {
    if (node.pageType !== 'Article') errors.push(`Guide is not Article pageType: ${item.url}`);
    if (node.cluster !== 'CONTENT') errors.push(`Guide is not CONTENT cluster: ${item.url}`);
    if (node.indexState !== 'INDEX' || node.canonicalOwner !== item.url) {
      errors.push(`Guide lost self-canonical/index state: ${item.url}`);
    }
    if (node.recommendedParent !== '/บทความ') errors.push(`Guide URL parent must remain /บทความ: ${item.url}`);
  }

  if (!clusterIds.has(item.cluster)) errors.push(`Unknown guide cluster: ${item.url} -> ${item.cluster}`);
  if (item.commercialTargets.length < 1 || item.commercialTargets.length > guide.meta.maxCommercialTargetsPerGuide) {
    errors.push(`Commercial target count out of bounds: ${item.url}`);
  }
  for (const target of item.commercialTargets) {
    const targetNode = byUrl.get(target);
    if (!targetNode || targetNode.indexState !== 'INDEX') errors.push(`Guide target not live/indexable: ${item.url} -> ${target}`);
    if (target.startsWith('/บทความ/')) errors.push(`Commercial target cannot be another guide: ${item.url} -> ${target}`);
  }
}

const membership = new Map();
for (const cluster of guide.clusters) {
  if (cluster.virtual !== true) errors.push(`Guide cluster must remain virtual: ${cluster.id}`);
  if (cluster.members.length < 2) errors.push(`Guide cluster too small for authority graph: ${cluster.id}`);
  if (cluster.members.length > 4) warnings.push(`Guide cluster has >4 members; review bounded related rotation: ${cluster.id}`);
  for (const url of cluster.members) {
    if (!guideUrls.has(url)) errors.push(`Cluster member is not a configured guide: ${cluster.id} -> ${url}`);
    membership.set(url, (membership.get(url) ?? 0) + 1);
  }
}
for (const url of guideUrls) {
  if (membership.get(url) !== 1) errors.push(`Guide must belong to exactly one primary cluster: ${url} count=${membership.get(url) ?? 0}`);
}

// Candidate safety.
const candidateUrls = new Set();
for (const candidate of guide.candidateGuides) {
  if (candidate.releaseState !== 'HOLD_FOUNDATION') errors.push(`Guide candidate escaped HOLD_FOUNDATION: ${candidate.id}`);
  if (byUrl.has(candidate.candidateUrl)) errors.push(`Candidate URL is unexpectedly live: ${candidate.candidateUrl}`);
  if (candidateUrls.has(candidate.candidateUrl)) errors.push(`Duplicate candidate URL: ${candidate.candidateUrl}`);
  candidateUrls.add(candidate.candidateUrl);
  if (!candidate.candidateUrl.startsWith('/บทความ/')) errors.push(`Candidate must stay under /บทความ/: ${candidate.id}`);
  if (candidate.candidateUrl.includes('/พื้นที่/')) errors.push(`Guide×Location leak: ${candidate.id}`);
  if (!clusterIds.has(candidate.cluster)) errors.push(`Candidate cluster missing: ${candidate.id}`);
  if (!byUrl.has(candidate.primaryCommercialOwner)) errors.push(`Candidate commercial owner not live: ${candidate.id}`);
}

// Curated conversion bridges must be installed.
for (const item of guide.guides) {
  const actual = recovery.conversionBridges?.[item.url] ?? [];
  if (JSON.stringify(actual) !== JSON.stringify(item.commercialTargets)) {
    errors.push(`Curated conversion bridge not installed or drifted: ${item.url}`);
  }
}

// Runtime must use same-cluster guide graph and never emit virtual cluster links.
const runtime = fs.readFileSync(path.join(root, 'src/config/runtime-architecture.ts'), 'utf8');
for (const marker of [
  "getGuideAuthorityRelatedUrls",
  "'GUIDE_RELATED'",
  "const guideRelated = getGuideAuthorityRelatedUrls(current);"
]) {
  if (!runtime.includes(marker)) errors.push(`Runtime missing guide-authority marker: ${marker}`);
}
for (const cluster of guide.clusters) {
  if (runtime.includes(cluster.id) && runtime.includes(`href="${cluster.id}"`)) {
    errors.push(`Virtual guide cluster appears linkable: ${cluster.id}`);
  }
}

const helper = fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.ts'), 'utf8');
for (const marker of [
  'canPublishGuideCandidateAutomatically(): false',
  'canEmitVirtualGuideClusterHref(): false',
  'return false'
]) {
  if (!helper.includes(marker)) errors.push(`Safety helper missing: ${marker}`);
}

// Projected related-guide inbound: every guide should receive at least one same-cluster link.
const relatedInbound = new Map([...guideUrls].map((url) => [url, 0]));
for (const cluster of guide.clusters) {
  for (const source of cluster.members) {
    const start = cluster.members.indexOf(source);
    const max = Math.min(guide.meta.maxRelatedGuidesPerGuide, cluster.members.length - 1);
    for (let offset = 1; offset <= max; offset += 1) {
      const target = cluster.members[(start + offset) % cluster.members.length];
      relatedInbound.set(target, (relatedInbound.get(target) ?? 0) + 1);
    }
  }
}
const guideInboundFailures = [...relatedInbound.entries()].filter(([,count]) => count < 1);
if (guideInboundFailures.length) errors.push(`Guide related inbound gate failed: ${guideInboundFailures.length}`);

console.log('ARCHITECTURE BATCH 7 — GUIDE / INFORMATIONAL AUTHORITY VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Existing live guides: ${guide.guides.length}`);
console.log(`Virtual topical clusters: ${guide.clusters.length}`);
console.log(`Future guide candidates: ${guide.candidateGuides.length}`);
console.log(`Guide related inbound failures: ${guideInboundFailures.length}`);
console.log(`Candidate URLs leaked live: ${[...candidateUrls].filter((u)=>byUrl.has(u)).length}`);
console.log(`Automatic publishing: ${guide.meta.automaticPublishing}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
