#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const architecture=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const readiness=JSON.parse(fs.readFileSync(path.join(root,'src/config/architecture-expansion-readiness.json'),'utf8'));
const core=JSON.parse(fs.readFileSync(path.join(root,'src/config/core-hub-release.json'),'utf8'));
const brand=JSON.parse(fs.readFileSync(path.join(root,'src/config/brand-model-series-foundation.json'),'utf8'));
const guide=JSON.parse(fs.readFileSync(path.join(root,'src/config/guide-authority-architecture.json'),'utf8'));

const live=architecture.routes.filter((n)=>n.kind==='LIVE');
const indexable=live.filter((n)=>n.indexState==='INDEX');
const errors=[];
const warnings=[];

if (live.length!==readiness.meta.liveRoutes) errors.push(`Live count drift: ${live.length} != ${readiness.meta.liveRoutes}`);
if (indexable.length!==readiness.meta.indexableRoutes) errors.push(`Indexable count drift: ${indexable.length} != ${readiness.meta.indexableRoutes}`);
if (readiness.meta.newLiveRoutes!==5) errors.push('Real-repo merged readiness meta must report 5 added live routes');
if (readiness.meta.expansionLockedByDefault!==true) errors.push('Expansion must be locked by default');
if (readiness.meta.automaticExpansion!==false) errors.push('Automatic expansion must be false');
if (readiness.releasePolicy.initialReleaseCap > 6) errors.push('Initial release cap must not exceed 6');
if (readiness.thresholds.maxCrawlDepth > 4) errors.push('Crawl-depth policy unexpectedly loosened');
if (readiness.thresholds.maxBrokenGovernedLinks !== 0) errors.push('Broken-link threshold must remain 0');
if (readiness.thresholds.maxUnexpectedOrphans !== 0) errors.push('Orphan threshold must remain 0');

const candidateCount =
  brand.candidateBrands.length +
  brand.candidateSeries.length +
  brand.modelPolicy.seededModelCandidates.length +
  guide.candidateGuides.length;
if (candidateCount !== 58) errors.push(`Expected 58 governed unreleased candidates after real-repo reconciliation, got ${candidateCount}`);
if (brand.modelPolicy.seededModelCandidates.length !== 0) errors.push('Model candidates must still be 0 before controlled expansion');

if (core.meta.architectureQualityGateState !== 'BATCH_10_PRE_PRODUCTION_GATE') {
  errors.push('Core release missing Batch 10 gate state');
}

for (const marker of [
  'canAutoExpandArchitecture(): false',
  'return false',
]) {
  const helper=fs.readFileSync(path.join(root,'src/config/architecture-expansion-readiness.ts'),'utf8');
  if (!helper.includes(marker)) errors.push(`Readiness safety helper missing: ${marker}`);
}

const staticReport=path.join(root,'docs/architecture/architecture-quality-gate-report.json');
if (!fs.existsSync(staticReport)) {
  warnings.push('Static quality gate report not generated yet. Run scripts/run-architecture-quality-gate.mjs.');
} else {
  const report=JSON.parse(fs.readFileSync(staticReport,'utf8'));
  if (report.staticArchitectureGate !== 'PASS') errors.push('Static quality gate report is not PASS');
}

console.log('ARCHITECTURE BATCH 10 — QUALITY GATE FOUNDATION VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Governed unreleased candidates: ${candidateCount}`);
console.log(`Initial expansion release cap: ${readiness.releasePolicy.initialReleaseCap}`);
console.log(`Max crawl depth policy: ${readiness.thresholds.maxCrawlDepth}`);
console.log(`Automatic expansion: ${readiness.meta.automaticExpansion}`);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.warn(`WARN: ${w}`);
if (errors.length){
  for (const e of errors) console.error(`ERROR: ${e}`);
  console.error('VERDICT: FAIL');
  process.exitCode=1;
} else if (warnings.length) {
  console.log('VERDICT: PASS_WITH_PRODUCTION_ATTESTATION_REQUIRED');
} else {
  console.log('VERDICT: PASS');
}
