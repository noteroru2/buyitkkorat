#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const architecture = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const foundation = JSON.parse(fs.readFileSync(path.join(root, 'src/config/brand-model-series-foundation.json'), 'utf8'));
const core = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));

const live = architecture.routes.filter((n) => n.kind === 'LIVE');
const indexable = live.filter((n) => n.indexState === 'INDEX');
const liveUrls = new Set(live.map((n) => n.url));
const virtualIds = new Set((architecture.virtualNodes ?? []).map((n) => n.id));
const errors = [];
const warnings = [];

if (live.length !== architecture.meta.currentRoutes) errors.push(`Live route count drift: ${live.length} != ${architecture.meta.currentRoutes}`);
if (indexable.length !== architecture.meta.currentIndexable) errors.push(`Indexable route count drift: ${indexable.length} != ${architecture.meta.currentIndexable}`);
if (!['FOUNDATION_ONLY','CONTROLLED_RELEASE_ACTIVE','INDEX350_W1_ACTIVE','INDEX350_W2_ACTIVE','INDEX350_W3_ACTIVE'].includes(foundation.meta.foundationState)) errors.push(`Bad foundationState: ${foundation.meta.foundationState}`);
if (foundation.meta.automaticPublishing !== false) errors.push('automaticPublishing must remain false');
if (!['FOUNDATION_ONLY_BATCH_6','FOUNDATION_ONLY_BATCH_6'].includes(core.meta.brandModelSeriesState)) {}

const anchors = new Map();
for (const anchor of foundation.liveAnchors) {
  if (anchors.has(anchor.id)) errors.push(`Duplicate anchor id: ${anchor.id}`);
  anchors.set(anchor.id, anchor);
  if (!liveUrls.has(anchor.url)) errors.push(`Live anchor URL not live: ${anchor.id} -> ${anchor.url}`);
  if (anchor.parent?.startsWith('virtual:') && !virtualIds.has(anchor.parent)) {
    errors.push(`Unknown virtual anchor parent: ${anchor.id} -> ${anchor.parent}`);
  }
}

const candidates = [...foundation.candidateBrands, ...foundation.candidateSeries];
const releasedById = new Map((foundation.releasedNodes ?? []).map((node) => [node.id, node]));
const byId = new Map();
const candidateUrls = new Set();

for (const [id, node] of releasedById) {
  if (!liveUrls.has(node.url)) errors.push(`Released expansion node is not live: ${id} -> ${node.url}`);
  if (node.releaseState !== 'LIVE') errors.push(`Released expansion node has invalid state: ${id}`);
}
for (const node of candidates) {
  if (byId.has(node.id)) errors.push(`Duplicate candidate id: ${node.id}`);
  byId.set(node.id, node);

  if (!['BRAND','SERIES'].includes(node.nodeType)) errors.push(`Invalid foundation node type ${node.id}: ${node.nodeType}`);
  if (node.releaseState !== 'HOLD_FOUNDATION') errors.push(`Candidate escaped HOLD_FOUNDATION: ${node.id}`);
  if (liveUrls.has(node.candidateUrl)) errors.push(`Unreleased candidate URL already live unexpectedly: ${node.candidateUrl}`);
  if (candidateUrls.has(node.candidateUrl)) errors.push(`Duplicate candidate URL: ${node.candidateUrl}`);
  candidateUrls.add(node.candidateUrl);

  if (node.candidateUrl.includes('/พื้นที่/') || node.candidateUrl.startsWith('/พื้นที่/')) {
    errors.push(`Location cross-product leaked into expansion: ${node.id}`);
  }
  if (!node.candidateUrl.endsWith('-โคราช')) errors.push(`Candidate URL must retain local-site money-page suffix: ${node.id}`);
}

for (const node of foundation.candidateBrands) {
  if (!anchors.has(node.parent)) errors.push(`Brand parent must be a live anchor: ${node.id} -> ${node.parent}`);
}
for (const node of foundation.candidateSeries) {
  if (!anchors.has(node.parent) && !byId.has(node.parent) && !releasedById.has(node.parent)) {
    errors.push(`Series parent missing: ${node.id} -> ${node.parent}`);
  }
  const parent = byId.get(node.parent) ?? releasedById.get(node.parent);
  if (parent && parent.nodeType !== 'BRAND') errors.push(`Series candidate parent must be BRAND: ${node.id} -> ${node.parent}`);
}

if (foundation.modelPolicy.seededModelCandidates.length !== 0) {
  errors.push(`Batch 6 must seed zero exact model candidates; got ${foundation.modelPolicy.seededModelCandidates.length}`);
}
if (foundation.meta.candidateModelNodes !== 0) errors.push('candidateModelNodes must remain 0');

const prohibited = new Set(foundation.expansionAxesPolicy.prohibitedCrossProducts);
for (const rule of ['BRAND×LOCATION','SERIES×LOCATION','MODEL×LOCATION']) {
  if (!prohibited.has(rule)) errors.push(`Missing anti-doorway rule: ${rule}`);
}

// No candidate URLs may leak into live navigation configs/runtime.
const leakFiles = [
  'src/config/runtime-architecture.ts',
  'src/config/internal-link-recovery.json',
  'src/config/core-hub-release.json',
  'src/config/local-area-release.json',
];
for (const rel of leakFiles) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8');
  for (const url of candidateUrls) {
    if (text.includes(url)) errors.push(`Candidate URL leaked into runtime file ${rel}: ${url}`);
  }
}

const helper = fs.readFileSync(path.join(root, 'src/config/brand-model-series-foundation.ts'), 'utf8');
for (const marker of [
  'canPublishExpansionCandidateAutomatically(): false',
  'isRuntimeLinkableExpansionCandidate(): false',
  'return false'
]) {
  if (!helper.includes(marker)) errors.push(`Safety helper missing marker: ${marker}`);
}

// Enforce bounded seed breadth: enough to plan, not enough to become an uncontrolled catalog.
const seriesPerParent = new Map();
for (const s of foundation.candidateSeries) {
  seriesPerParent.set(s.parent, (seriesPerParent.get(s.parent) ?? 0) + 1);
}
for (const [parent, count] of seriesPerParent) {
  if (count > 5) errors.push(`Too many seeded series under one parent (${count}): ${parent}`);
}

console.log('ARCHITECTURE BATCH 6 — BRAND / SERIES / MODEL FOUNDATION VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Live expansion anchors: ${foundation.liveAnchors.length}`);
console.log(`Brand candidates: ${foundation.candidateBrands.length}`);
console.log(`Series candidates: ${foundation.candidateSeries.length}`);
console.log(`Exact model candidates: ${foundation.modelPolicy.seededModelCandidates.length}`);
console.log(`Candidate URLs leaked live: ${[...candidateUrls].filter((u)=>liveUrls.has(u)).length}`);
console.log(`Automatic publishing: ${foundation.meta.automaticPublishing}`);
console.log(`Warnings: ${warnings.length}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
