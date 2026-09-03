#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const reportArg = process.argv.find((x)=>x.startsWith('--report='));
const reportRel = reportArg ? reportArg.slice('--report='.length) : 'docs/architecture/architecture-quality-gate-report.json';

const validators = [
  'validate-site-architecture.mjs',
  'validate-core-hub-architecture.mjs',
  'validate-parent-child-runtime.mjs',
  'validate-internal-link-graph.mjs',
  'validate-cannibalization-triage.mjs',
  'validate-local-area-architecture.mjs',
  'validate-brand-model-series-foundation.mjs',
  'validate-guide-authority-architecture.mjs',
  'validate-navigation-architecture.mjs',
  'validate-seo-index-control.mjs',
];

const results = [];
let allPassed = true;
for (const script of validators) {
  const run = spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    encoding: 'utf8',
  });
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
  const passed = run.status === 0;
  allPassed &&= passed;
  results.push({
    script,
    passed,
    exitCode: run.status,
    verdict: output.match(/VERDICT:\s*([A-Z_]+)/)?.[1] ?? 'UNKNOWN',
    output,
  });
}

const architecture = JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo = JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const brand = JSON.parse(fs.readFileSync(path.join(root,'src/config/brand-model-series-foundation.json'),'utf8'));
const guide = JSON.parse(fs.readFileSync(path.join(root,'src/config/guide-authority-architecture.json'),'utf8'));
const indexPlanPath=path.join(root,'src/config/index-350-expansion-plan.json');
const indexPlan=fs.existsSync(indexPlanPath)?JSON.parse(fs.readFileSync(indexPlanPath,'utf8')):null;

const live = architecture.routes.filter((n)=>n.kind==='LIVE');
const indexable = live.filter((n)=>n.indexState==='INDEX');
const candidateCount = indexPlan ? indexPlan.candidates.filter((c)=>c.releaseState==='HOLD_PLANNED').length : (brand.candidateBrands.length + brand.candidateSeries.length + brand.modelPolicy.seededModelCandidates.length + guide.candidateGuides.length);

const staticGate =
  allPassed &&
  live.length === architecture.meta.currentRoutes &&
  indexable.length === architecture.meta.currentIndexable &&
  seo.sitemap.expectedUrlCount === architecture.meta.currentIndexable;

const report = {
  batch: 'ARCHITECTURE BATCH 10',
  generatedAt: new Date().toISOString(),
  staticArchitectureGate: staticGate ? 'PASS' : 'FAIL',
  productionIntegrationGate: 'UNATTESTED_IN_OVERLAY',
  expansionDecision: staticGate ? 'CONDITIONALLY_READY' : 'BLOCKED',
  reason: staticGate
    ? 'Static architecture is coherent, but real source integration/build/crawl and evidence gates must still pass.'
    : 'At least one static architecture gate failed.',
  counts: {
    live: live.length,
    indexable: indexable.length,
    noindex: live.length - indexable.length,
    unreleasedCandidates: candidateCount,
  },
  validators: results.map(({output, ...rest})=>rest),
};

const out = path.resolve(root, reportRel);
if (!out.startsWith(root + path.sep)) {
  console.error('Report path must be inside repository root.');
  process.exit(2);
}
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');

console.log('ARCHITECTURE BATCH 10 — STATIC QUALITY GATE');
console.log(`Validators: ${results.filter((r)=>r.passed).length}/${results.length} passed`);
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Unreleased candidates governed: ${candidateCount}`);
console.log(`Static architecture gate: ${report.staticArchitectureGate}`);
console.log(`Production integration gate: ${report.productionIntegrationGate}`);
console.log(`Expansion decision: ${report.expansionDecision}`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(staticGate ? 'VERDICT: PASS_WITH_PRODUCTION_ATTESTATION_REQUIRED' : 'VERDICT: FAIL');

if (!staticGate) process.exitCode = 1;
