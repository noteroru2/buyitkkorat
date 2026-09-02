#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');

const architecture=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-release-round-1.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-round-1-production-gate.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));

const live=architecture.routes.filter((n)=>n.kind==='LIVE');
const indexable=live.filter((n)=>n.indexState==='INDEX');
const errors=[];

if(live.length!==gate.meta.expectedLiveRoutes) errors.push(`Live ${live.length} != ${gate.meta.expectedLiveRoutes}`);
if(indexable.length!==gate.meta.expectedIndexableRoutes) errors.push(`Indexable ${indexable.length} != ${gate.meta.expectedIndexableRoutes}`);
if(seo.sitemap.expectedUrlCount!==gate.meta.expectedSitemapUrls) errors.push('Sitemap count drift');
if(gate.meta.round2Locked!==true) errors.push('Round 2 must be locked by default');
if(gate.meta.automaticDeploy!==false) errors.push('Automatic deploy must be false');
if(gate.meta.automaticRound2!==false) errors.push('Automatic Round 2 must be false');
if(gate.observation.minimumFinalizedDaysForRound2Review < 7) errors.push('Observation date gate was weakened below 7 finalized days');

for(const url of gate.meta.releasedUrls){
  const node=live.find((n)=>n.url===url);
  if(!node || node.indexState!=='INDEX' || node.canonicalOwner!==url) errors.push(`Released URL drift: ${url}`);
}
if(release.meta.productionGateState!=='PREDEPLOY_PENDING_REAL_REPO') errors.push(`Unexpected productionGateState: ${release.meta.productionGateState}`);
if(release.observationGate.round2State!=='LOCKED') errors.push('Release config Round 2 must remain LOCKED before production observation');

for(const script of [
  'scripts/predeploy-expansion-round-1.mjs',
  'scripts/verify-expansion-round-1-production.mjs',
  'scripts/evaluate-expansion-round-1-observation.mjs',
  'scripts/evaluate-expansion-round-1-gsc.mjs',
]){
  if(!fs.existsSync(path.join(root,script))) errors.push(`Missing gate script: ${script}`);
}

console.log('EXPANSION ROUND 1 — PRODUCTION / OBSERVATION GATE VALIDATION');
console.log(`Live/indexable: ${live.length}/${indexable.length}`);
console.log(`Sitemap target: ${seo.sitemap.expectedUrlCount}`);
console.log(`Released URLs governed: ${gate.meta.releasedUrls.length}`);
console.log(`Minimum finalized GSC days: ${gate.observation.minimumFinalizedDaysForRound2Review}`);
console.log(`Round 2 locked: ${gate.meta.round2Locked}`);
console.log(`Automatic deploy: ${gate.meta.automaticDeploy}`);
console.log(`Automatic Round 2: ${gate.meta.automaticRound2}`);
if(errors.length){
  for(const e of errors) console.error(`ERROR: ${e}`);
  console.error('VERDICT: FAIL');
  process.exitCode=1;
}else{
  console.log('VERDICT: PASS');
}
