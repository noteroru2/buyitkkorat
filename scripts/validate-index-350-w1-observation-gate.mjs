#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-observation-gate.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-release.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-production-gate.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const errors=[];
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
if(live.length<cfg.meta.expectedLiveRoutes)errors.push(`live ${live.length} < historical W1 minimum ${cfg.meta.expectedLiveRoutes}`);
if(indexable.length<cfg.meta.expectedIndexableRoutes)errors.push(`indexable ${indexable.length} < historical W1 minimum ${cfg.meta.expectedIndexableRoutes}`);
if(cfg.meta.observedUrls.length!==40)errors.push('Observed URL count must remain 40');
if(new Set(cfg.meta.observedUrls).size!==40)errors.push('Observed URLs are not unique');
if(cfg.meta.automaticW2!==false||cfg.meta.w2LockedByDefault!==true)errors.push('W2 safety lock changed');
if(cfg.thresholds.minimumFinalizedDays<7)errors.push('Finalized date gate weakened below 7 days');
if(cfg.thresholds.minimumVisibleW1Pages<8)errors.push('Visibility threshold weakened below 8 pages');
if(cfg.thresholds.minimumIndexedW1Pages<32)errors.push('Indexation threshold weakened below 32 pages');
if(cfg.ownershipPairs.length!==40)errors.push(`Expected 40 ownership pairs, got ${cfg.ownershipPairs.length}`);
for(const pair of cfg.ownershipPairs){
  if(!cfg.meta.observedUrls.includes(pair.child))errors.push(`Pair child not W1: ${pair.child}`);
  if(!live.some((r)=>r.url===pair.parent))errors.push(`Pair parent not live: ${pair.parent}`);
}
for(const u of cfg.meta.observedUrls){
  if(!release.releasedUrls.includes(u))errors.push(`Observation URL not in W1 release: ${u}`);
  if(!prod.meta.releasedUrls.includes(u))errors.push(`Observation URL not in W1 production gate: ${u}`);
}
for(const script of ['scripts/evaluate-index-350-w1-observation.mjs','scripts/validate-index-350-w1-observation-gate.mjs']){
  if(!fs.existsSync(path.join(root,script)))errors.push(`Missing ${script}`);
}
console.log('INDEX 350 — W1 OBSERVATION GATE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Observed W1 URLs: ${cfg.meta.observedUrls.length}`);
console.log(`Ownership pairs: ${cfg.ownershipPairs.length}`);
console.log(`Finalized-day gate: ${cfg.thresholds.minimumFinalizedDays}`);
console.log(`Visibility gate: ${cfg.thresholds.minimumVisibleW1Pages}/40`);
console.log(`Indexation gate: ${cfg.thresholds.minimumIndexedW1Pages}/40`);
console.log(`W2 locked: ${cfg.meta.w2LockedByDefault}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
