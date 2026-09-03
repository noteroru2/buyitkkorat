#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const architecture = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const triage = JSON.parse(fs.readFileSync(path.join(root, 'src/config/cannibalization-triage.json'), 'utf8'));

const allowed = new Set(['KEEP','DIFFERENTIATE','HOLD_GSC','MERGE_CANDIDATE','REDIRECT_CANDIDATE']);
const live = architecture.routes.filter((r) => r.kind === 'LIVE');
const indexable = live.filter((r) => r.indexState === 'INDEX');
const byUrl = new Map(live.map((r) => [r.url, r]));
const virtualIds = new Set((architecture.virtualNodes ?? []).map((n) => n.id));
const errors = [];
const warnings = [];

const expectedLive = architecture.meta.currentRoutes ?? architecture.meta.baselineRoutes;
const expectedIndexable = architecture.meta.currentIndexable ?? architecture.meta.baselineIndexable;
if (live.length !== expectedLive) errors.push(`Live route count changed: ${live.length} != ${expectedLive}`);
if (indexable.length !== expectedIndexable) errors.push(`Indexable route count changed: ${indexable.length} != ${expectedIndexable}`);
if (triage.meta.automaticExecution !== false) errors.push('automaticExecution must remain false');

const ids = new Set();
let destructiveCandidates = 0;
let gscGroups = 0;
for (const group of triage.groups) {
  if (ids.has(group.id)) errors.push(`Duplicate group id: ${group.id}`);
  ids.add(group.id);
  if (!allowed.has(group.decision)) errors.push(`Invalid decision ${group.id}: ${group.decision}`);
  if (!Array.isArray(group.urls) || group.urls.length < 2) errors.push(`Group ${group.id} must contain at least two live URLs`);
  for (const url of group.urls ?? []) if (!byUrl.has(url)) errors.push(`Unknown URL in ${group.id}: ${url}`);
  if (!byUrl.has(group.owner) && !virtualIds.has(group.owner)) errors.push(`Invalid owner in ${group.id}: ${group.owner}`);
  if (group.gscRequired) gscGroups += 1;
  if (group.decision === 'MERGE_CANDIDATE' || group.decision === 'REDIRECT_CANDIDATE') destructiveCandidates += 1;
}

// Batch 4 is triage only: no candidate may be executed just because it appears here.
const policy = fs.readFileSync(path.join(root, 'src/config/cannibalization-policy.ts'), 'utf8');
for (const needle of ['canAutoExecuteCannibalizationChange(): false', 'return false']) {
  if (!policy.includes(needle)) errors.push(`Safety policy missing marker: ${needle}`);
}

// Verify architecture's canonical/index invariants remain self-owned as in Batch 0.
for (const route of live) {
  if (route.url !== '/404' && !route.canonicalOwner) errors.push(`Missing canonical owner: ${route.url}`);
  if (route.indexState !== 'INDEX' && route.url !== '/404') warnings.push(`Non-index route outside /404: ${route.url}`);
}

console.log('ARCHITECTURE BATCH 4 — CANNIBALIZATION TRIAGE VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Triage groups: ${triage.groups.length}`);
console.log(`GSC-gated groups: ${gscGroups}`);
console.log(`Destructive candidates currently proposed: ${destructiveCandidates}`);
console.log(`Automatic execution: ${triage.meta.automaticExecution}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
