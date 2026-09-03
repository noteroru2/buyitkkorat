#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-observation-gate.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-release.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-production-gate.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const errors=[];
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
if(live.length<cfg.meta.expectedLiveRoutes)errors.push(`live ${live.length} < historical W3 minimum ${cfg.meta.expectedLiveRoutes}`);
if(indexable.length<cfg.meta.expectedIndexableRoutes)errors.push(`indexable ${indexable.length} < historical W3 minimum ${cfg.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==cfg.meta.expectedNoindexRoutes)errors.push(`noindex ${live.length-indexable.length} != ${cfg.meta.expectedNoindexRoutes}`);
if(cfg.meta.observedUrls.length!==50||new Set(cfg.meta.observedUrls).size!==50)errors.push('Observed URL count/uniqueness must remain 50');
if(cfg.meta.modelCount!==50)errors.push('W3 model count must remain 50');
const expectedMix={NOTEBOOK:14,APPLE:10,MOBILE:14,CAMERA:5,GAMING:7};
for(const [k,v] of Object.entries(expectedMix))if(cfg.meta.clusterMix?.[k]!==v)errors.push(`Cluster ${k} ${cfg.meta.clusterMix?.[k]} != ${v}`);
if(cfg.meta.automaticW4!==false||cfg.meta.w4LockedByDefault!==true)errors.push('W4 safety lock changed');
if(cfg.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE')errors.push('W3 release-basis disclosure changed');
if(cfg.meta.realW2PerformanceAttested!==false)errors.push('Historical W2 performance attestation was rewritten');
if(cfg.thresholds.minimumFinalizedDays<7)errors.push('Finalized date gate weakened below 7 days');
if(cfg.thresholds.minimumVisibleW3Pages<10)errors.push('Total visibility gate weakened');
if(cfg.thresholds.minimumIndexedW3Pages<40)errors.push('Total indexation gate weakened');
const visibleMin={NOTEBOOK:3,APPLE:2,MOBILE:3,CAMERA:1,GAMING:1};
const indexedMin={NOTEBOOK:11,APPLE:8,MOBILE:11,CAMERA:4,GAMING:6};
for(const [k,v] of Object.entries(visibleMin))if((cfg.thresholds.minimumVisibleByCluster?.[k]??0)<v)errors.push(`Visibility cluster gate weakened: ${k}`);
for(const [k,v] of Object.entries(indexedMin))if((cfg.thresholds.minimumIndexedByCluster?.[k]??0)<v)errors.push(`Indexation cluster gate weakened: ${k}`);
if(cfg.ownershipPairs.length!==50)errors.push(`Expected 50 ownership pairs, got ${cfg.ownershipPairs.length}`);
const flatProd=new Map();for(const g of prod.parentChildChecks)for(const c of g.children)flatProd.set(c,g.parent);
const counted={NOTEBOOK:0,APPLE:0,MOBILE:0,CAMERA:0,GAMING:0};
for(const pair of cfg.ownershipPairs){
  if(!cfg.meta.observedUrls.includes(pair.child))errors.push(`Pair child not W3: ${pair.child}`);
  if(!live.some((r)=>r.url===pair.parent))errors.push(`Pair parent not live: ${pair.parent}`);
  if(pair.nodeType!=='MODEL LANDING PAGE')errors.push(`Unexpected node type: ${pair.child}`);
  if(flatProd.get(pair.child)!==pair.parent)errors.push(`Production parent mismatch: ${pair.child}`);
  if(cfg.clusterByUrl[pair.child]!==pair.cluster)errors.push(`Cluster mapping mismatch: ${pair.child}`);
  if(counted[pair.cluster]===undefined)errors.push(`Unknown cluster ${pair.cluster}`); else counted[pair.cluster]++;
}
for(const [k,v] of Object.entries(expectedMix))if(counted[k]!==v)errors.push(`Ownership cluster split ${k} ${counted[k]} != ${v}`);
for(const u of cfg.meta.observedUrls){
  if(!release.releasedUrls.includes(u))errors.push(`Observation URL not in W3 release: ${u}`);
  if(!prod.meta.releasedUrls.includes(u))errors.push(`Observation URL not in W3 production gate: ${u}`);
}
for(const script of ['scripts/evaluate-index-350-w3-observation.mjs','scripts/validate-index-350-w3-observation-gate.mjs'])if(!fs.existsSync(path.join(root,script)))errors.push(`Missing ${script}`);
for(const file of ['docs/gsc/index350-w3-gsc-template.csv','docs/gsc/index350-w3-indexation-template.csv','APPLY_INDEX350_W3_OBSERVATION_GATE.md'])if(!fs.existsSync(path.join(root,file)))errors.push(`Missing ${file}`);
console.log('INDEX 350 — W3 OBSERVATION GATE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Observed W3 URLs: ${cfg.meta.observedUrls.length} Model pages`);
console.log(`Cluster mix: ${Object.entries(counted).map(([k,v])=>`${k} ${v}`).join(' | ')}`);
console.log(`Ownership pairs: ${cfg.ownershipPairs.length}`);
console.log(`Finalized-day gate: ${cfg.thresholds.minimumFinalizedDays}`);
console.log(`Visibility gate: ${cfg.thresholds.minimumVisibleW3Pages}/50; cluster minima ${Object.entries(cfg.thresholds.minimumVisibleByCluster).map(([k,v])=>`${k} ${v}`).join(', ')}`);
console.log(`Indexation gate: ${cfg.thresholds.minimumIndexedW3Pages}/50; cluster minima ${Object.entries(cfg.thresholds.minimumIndexedByCluster).map(([k,v])=>`${k} ${v}`).join(', ')}`);
console.log(`Release basis: ${cfg.meta.releaseBasis}`);
console.log(`W4 locked: ${cfg.meta.w4LockedByDefault}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
