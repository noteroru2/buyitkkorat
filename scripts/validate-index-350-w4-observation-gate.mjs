#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w4-observation-gate.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w4-release.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w4-production-gate.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const errors=[];
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
if(live.length<cfg.meta.expectedLiveRoutes)errors.push(`live ${live.length} < historical W4 minimum ${cfg.meta.expectedLiveRoutes}`);
if(indexable.length<cfg.meta.expectedIndexableRoutes)errors.push(`indexable ${indexable.length} < historical W4 minimum ${cfg.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==cfg.meta.expectedNoindexRoutes)errors.push(`noindex ${live.length-indexable.length} != ${cfg.meta.expectedNoindexRoutes}`);
if(cfg.meta.observedUrls.length!==50||new Set(cfg.meta.observedUrls).size!==50)errors.push('Observed URL count/uniqueness must remain 50');
const expectedTypes={SERIES:18,MODEL:7,CONDITION:25};
const expectedClusters={MOBILE:20,CAMERA:9,NOTEBOOK:9,APPLE:3,COMPUTER:6,GAMING:3};
if(cfg.meta.groupMix?.B_SERIES!==18||cfg.meta.groupMix?.C_MODEL!==7||cfg.meta.groupMix?.D_CONDITION!==25)errors.push('W4 group mix changed');
for(const [k,v] of Object.entries(expectedClusters))if(cfg.meta.clusterMix?.[k]!==v)errors.push(`Cluster ${k} ${cfg.meta.clusterMix?.[k]} != ${v}`);
if(cfg.meta.automaticW5!==false||cfg.meta.w5LockedByDefault!==true)errors.push('W5 safety lock changed');
if(cfg.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE')errors.push('W4 release-basis disclosure changed');
if(cfg.meta.realW3PerformanceAttested!==false)errors.push('Historical W3 performance attestation was rewritten');
if(cfg.thresholds.minimumFinalizedDays<7)errors.push('Finalized date gate weakened below 7 days');
if(cfg.thresholds.minimumVisibleW4Pages<12)errors.push('Total visibility gate weakened');
if(cfg.thresholds.minimumIndexedW4Pages<40)errors.push('Total indexation gate weakened');
const visibleTypeMin={SERIES:4,MODEL:2,CONDITION:5};
const indexedTypeMin={SERIES:14,MODEL:6,CONDITION:20};
const visibleClusterMin={MOBILE:3,CAMERA:2,NOTEBOOK:2,APPLE:1,COMPUTER:1,GAMING:1};
const indexedClusterMin={MOBILE:16,CAMERA:7,NOTEBOOK:7,APPLE:2,COMPUTER:5,GAMING:2};
for(const [k,v] of Object.entries(visibleTypeMin))if((cfg.thresholds.minimumVisibleByType?.[k]??0)<v)errors.push(`Visibility type gate weakened: ${k}`);
for(const [k,v] of Object.entries(indexedTypeMin))if((cfg.thresholds.minimumIndexedByType?.[k]??0)<v)errors.push(`Indexation type gate weakened: ${k}`);
for(const [k,v] of Object.entries(visibleClusterMin))if((cfg.thresholds.minimumVisibleByCluster?.[k]??0)<v)errors.push(`Visibility cluster gate weakened: ${k}`);
for(const [k,v] of Object.entries(indexedClusterMin))if((cfg.thresholds.minimumIndexedByCluster?.[k]??0)<v)errors.push(`Indexation cluster gate weakened: ${k}`);
if(cfg.ownershipPairs.length!==50)errors.push(`Expected 50 ownership pairs, got ${cfg.ownershipPairs.length}`);
const flatProd=new Map();for(const g of prod.parentChildChecks)for(const c of g.children)flatProd.set(c,g.parent);
const countedTypes={SERIES:0,MODEL:0,CONDITION:0};
const countedClusters={MOBILE:0,CAMERA:0,NOTEBOOK:0,APPLE:0,COMPUTER:0,GAMING:0};
for(const pair of cfg.ownershipPairs){
  if(!cfg.meta.observedUrls.includes(pair.child))errors.push(`Pair child not W4: ${pair.child}`);
  if(!live.some((r)=>r.url===pair.parent))errors.push(`Pair parent not live: ${pair.parent}`);
  if(!(pair.nodeType in countedTypes))errors.push(`Unexpected node type: ${pair.child} ${pair.nodeType}`); else countedTypes[pair.nodeType]++;
  if(flatProd.get(pair.child)!==pair.parent)errors.push(`Production parent mismatch: ${pair.child}`);
  if(cfg.nodeTypeByUrl[pair.child]!==pair.nodeType)errors.push(`Type mapping mismatch: ${pair.child}`);
  if(cfg.clusterByUrl[pair.child]!==pair.cluster)errors.push(`Cluster mapping mismatch: ${pair.child}`);
  if(countedClusters[pair.cluster]===undefined)errors.push(`Unknown cluster ${pair.cluster}`); else countedClusters[pair.cluster]++;
}
for(const [k,v] of Object.entries(expectedTypes))if(countedTypes[k]!==v)errors.push(`Ownership type split ${k} ${countedTypes[k]} != ${v}`);
for(const [k,v] of Object.entries(expectedClusters))if(countedClusters[k]!==v)errors.push(`Ownership cluster split ${k} ${countedClusters[k]} != ${v}`);
for(const u of cfg.meta.observedUrls){
  if(!release.releasedUrls.includes(u))errors.push(`Observation URL not in W4 release: ${u}`);
  if(!prod.meta.releasedUrls.includes(u))errors.push(`Observation URL not in W4 production gate: ${u}`);
}
for(const dep of release.sameWaveParentDependencies??[]){
  const pair=cfg.ownershipPairs.find((p)=>p.child===dep.child);
  if(!pair||pair.parent!==dep.parent)errors.push(`Same-wave parent dependency lost: ${dep.child}`);
}
for(const script of ['scripts/evaluate-index-350-w4-observation.mjs','scripts/validate-index-350-w4-observation-gate.mjs'])if(!fs.existsSync(path.join(root,script)))errors.push(`Missing ${script}`);
for(const file of ['docs/gsc/index350-w4-gsc-template.csv','docs/gsc/index350-w4-indexation-template.csv','APPLY_INDEX350_W4_OBSERVATION_GATE.md'])if(!fs.existsSync(path.join(root,file)))errors.push(`Missing ${file}`);
console.log('INDEX 350 — W4 OBSERVATION GATE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Observed W4 URLs: ${cfg.meta.observedUrls.length}`);
console.log(`Type mix: ${Object.entries(countedTypes).map(([k,v])=>`${k} ${v}`).join(' | ')}`);
console.log(`Cluster mix: ${Object.entries(countedClusters).map(([k,v])=>`${k} ${v}`).join(' | ')}`);
console.log(`Ownership pairs: ${cfg.ownershipPairs.length}`);
console.log(`Finalized-day gate: ${cfg.thresholds.minimumFinalizedDays}`);
console.log(`Visibility gate: ${cfg.thresholds.minimumVisibleW4Pages}/50; type minima ${Object.entries(cfg.thresholds.minimumVisibleByType).map(([k,v])=>`${k} ${v}`).join(', ')}; cluster minima ${Object.entries(cfg.thresholds.minimumVisibleByCluster).map(([k,v])=>`${k} ${v}`).join(', ')}`);
console.log(`Indexation gate: ${cfg.thresholds.minimumIndexedW4Pages}/50; type minima ${Object.entries(cfg.thresholds.minimumIndexedByType).map(([k,v])=>`${k} ${v}`).join(', ')}; cluster minima ${Object.entries(cfg.thresholds.minimumIndexedByCluster).map(([k,v])=>`${k} ${v}`).join(', ')}`);
console.log(`Release basis: ${cfg.meta.releaseBasis}`);
console.log(`W5 locked: ${cfg.meta.w5LockedByDefault}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
