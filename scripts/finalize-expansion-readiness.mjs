#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
function arg(name){
  const hit=process.argv.find((x)=>x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length+3) : null;
}
const staticRel=arg('static') ?? 'docs/architecture/architecture-quality-gate-report.json';
const crawlRel=arg('crawl') ?? 'docs/architecture/production-crawl-audit.json';
const evidenceRel=arg('evidence');
const outputRel=arg('output') ?? 'docs/architecture/expansion-readiness-decision.json';

const config=JSON.parse(fs.readFileSync(path.join(root,'src/config/architecture-expansion-readiness.json'),'utf8'));
const staticPath=path.resolve(root,staticRel);
const crawlPath=path.resolve(root,crawlRel);

if (!fs.existsSync(staticPath)) {
  console.error(`Missing static gate report: ${staticRel}`);
  process.exit(2);
}
if (!fs.existsSync(crawlPath)) {
  console.error(`Missing production crawl report: ${crawlRel}`);
  process.exit(2);
}
const stat=JSON.parse(fs.readFileSync(staticPath,'utf8'));
const crawl=JSON.parse(fs.readFileSync(crawlPath,'utf8'));

let evidencePass=false;
let evidenceSummary='NO_EVIDENCE_FILE';
if (evidenceRel) {
  const ep=path.resolve(root,evidenceRel);
  if (fs.existsSync(ep)) {
    const text=fs.readFileSync(ep,'utf8').trim();
    const lines=text ? text.split(/\r?\n/) : [];
    evidencePass=lines.length > 1;
    evidenceSummary=evidencePass ? `ROWS=${lines.length-1}` : 'EMPTY_EVIDENCE_FILE';
  } else evidenceSummary='EVIDENCE_FILE_NOT_FOUND';
}

const gates = {
  architectureStatic: stat.staticArchitectureGate === 'PASS',
  seoSignals:
    stat.staticArchitectureGate === 'PASS' &&
    stat.counts.indexable === config.thresholds.sitemapCount,
  sourceIntegration: false,
  buildAndCrawl: crawl.verdict === 'PASS',
  expansionEvidence: evidencePass,
};

// Source integration is only true when production crawl succeeded with expected HTML signals.
if (crawl.verdict === 'PASS' &&
    crawl.counts.builtLive === stat.counts.live &&
    crawl.counts.webSiteSchemaOwners <= config.thresholds.maxWebSiteSchemaOwners) {
  gates.sourceIntegration = true;
}

let score=0;
const blockers=[];
for (const [id, passed] of Object.entries(gates)) {
  const cfg=config.requiredGates[id];
  if (passed) score += cfg.weight;
  else if (cfg.required) blockers.push(id);
}
let state='BLOCKED';
if (!blockers.length && score >= config.thresholds.readyScore) state='READY_FOR_CONTROLLED_RELEASE';
else if (score >= config.thresholds.conditionalScoreMin) state='CONDITIONALLY_READY';

const decision={
  batch:'ARCHITECTURE BATCH 10',
  state,
  score,
  gates,
  blockers,
  evidenceSummary,
  initialReleaseCap:config.releasePolicy.initialReleaseCap,
  firstExpansionType:config.releasePolicy.firstExpansionType,
  automaticExpansion:false,
};
const out=path.resolve(root,outputRel);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(decision,null,2)+'\n');

console.log('ARCHITECTURE BATCH 10 — EXPANSION READINESS DECISION');
console.log(`State: ${state}`);
console.log(`Score: ${score}/100`);
console.log(`Blockers: ${blockers.length ? blockers.join(', ') : 'NONE'}`);
console.log(`Evidence: ${evidenceSummary}`);
console.log(`Initial release cap: ${decision.initialReleaseCap}`);
console.log(`Automatic expansion: false`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(`VERDICT: ${state === 'READY_FOR_CONTROLLED_RELEASE' ? 'GO' : state === 'CONDITIONALLY_READY' ? 'HOLD_WITH_CONDITIONS' : 'NO_GO'}`);
