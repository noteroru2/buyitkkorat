#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-observation-gate.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-release.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-production-gate.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const errors=[];
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
if(live.length<cfg.meta.expectedLiveRoutes)errors.push(`live ${live.length} < historical W2 minimum ${cfg.meta.expectedLiveRoutes}`);
if(indexable.length<cfg.meta.expectedIndexableRoutes)errors.push(`indexable ${indexable.length} < historical W2 minimum ${cfg.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==cfg.meta.expectedNoindexRoutes)errors.push(`noindex ${live.length-indexable.length} != ${cfg.meta.expectedNoindexRoutes}`);
if(cfg.meta.observedUrls.length!==50||new Set(cfg.meta.observedUrls).size!==50)errors.push('Observed URL count/uniqueness must remain 50');
if(cfg.meta.seriesCount!==30||cfg.meta.modelCount!==20)errors.push('W2 Series/Model split must remain 30/20');
if(cfg.meta.automaticW3!==false||cfg.meta.w3LockedByDefault!==true)errors.push('W3 safety lock changed');
if(cfg.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE')errors.push('W2 release-basis disclosure changed');
if(cfg.meta.realW1PerformanceAttested!==false)errors.push('Historical W1 performance attestation was rewritten');
if(cfg.thresholds.minimumFinalizedDays<7)errors.push('Finalized date gate weakened below 7 days');
if(cfg.thresholds.minimumVisibleW2Pages<10||cfg.thresholds.minimumVisibleSeriesPages<6||cfg.thresholds.minimumVisibleModelPages<4)errors.push('Visibility gate weakened');
if(cfg.thresholds.minimumIndexedW2Pages<40||cfg.thresholds.minimumIndexedSeriesPages<24||cfg.thresholds.minimumIndexedModelPages<16)errors.push('Indexation gate weakened');
if(cfg.ownershipPairs.length!==50)errors.push(`Expected 50 ownership pairs, got ${cfg.ownershipPairs.length}`);
let series=0,models=0;
for(const pair of cfg.ownershipPairs){
  if(!cfg.meta.observedUrls.includes(pair.child))errors.push(`Pair child not W2: ${pair.child}`);
  if(!live.some((r)=>r.url===pair.parent))errors.push(`Pair parent not live: ${pair.parent}`);
  if(pair.nodeType.startsWith('SERIES'))series++;if(pair.nodeType.startsWith('MODEL'))models++;
}
if(series!==30||models!==20)errors.push(`Ownership type split ${series}/${models} != 30/20`);
for(const u of cfg.meta.observedUrls){
  if(!release.releasedUrls.includes(u))errors.push(`Observation URL not in W2 release: ${u}`);
  if(!prod.meta.releasedUrls.includes(u))errors.push(`Observation URL not in W2 production gate: ${u}`);
}
for(const script of ['scripts/evaluate-index-350-w2-observation.mjs','scripts/validate-index-350-w2-observation-gate.mjs'])if(!fs.existsSync(path.join(root,script)))errors.push(`Missing ${script}`);
console.log('INDEX 350 — W2 OBSERVATION GATE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Observed W2 URLs: ${cfg.meta.observedUrls.length} (Series ${series}, Model ${models})`);
console.log(`Ownership pairs: ${cfg.ownershipPairs.length}`);
console.log(`Finalized-day gate: ${cfg.thresholds.minimumFinalizedDays}`);
console.log(`Visibility gate: ${cfg.thresholds.minimumVisibleW2Pages}/50 (Series ${cfg.thresholds.minimumVisibleSeriesPages}/30, Model ${cfg.thresholds.minimumVisibleModelPages}/20)`);
console.log(`Indexation gate: ${cfg.thresholds.minimumIndexedW2Pages}/50 (Series ${cfg.thresholds.minimumIndexedSeriesPages}/30, Model ${cfg.thresholds.minimumIndexedModelPages}/20)`);
console.log(`Release basis: ${cfg.meta.releaseBasis}`);
console.log(`W3 locked: ${cfg.meta.w3LockedByDefault}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
