#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-performance-review-w2-selection.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const errors=[];
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
const liveSet=new Set(live.map((r)=>r.url));
if(live.length<189)errors.push(`Live routes ${live.length} < historical W2 minimum 189`);
if(indexable.length<188)errors.push(`Indexable routes ${indexable.length} < historical W2 minimum 188`);
if(cfg.meta.w2ReleaseCap!==50||cfg.composition.total!==50)errors.push('W2 cap/composition total must be 50');
if(cfg.composition.SERIES!==30||cfg.composition.MODEL!==20)errors.push('W2 mix must be 30 Series + 20 Model');
if(cfg.meta.automaticPublishing!==false||cfg.meta.automaticW2Release!==false)errors.push('Automatic publishing/release must remain false');
if(cfg.meta.manualApprovalOverride!==true)errors.push('W2 source release requires explicit manualApprovalOverride record');
if(cfg.meta.realW1PerformanceDataProvidedInPackage!==false)errors.push('Package must not claim real W1 performance data');
const p=cfg.provisionalSelection;
if(p.length!==50||new Set(p.map((x)=>x.url)).size!==50)errors.push('W2 selection must contain 50 unique URLs');
const by=new Map(plan.candidates.map((c)=>[c.url,c]));
for(const x of p){
  const c=by.get(x.url); if(!c){errors.push(`Missing candidate: ${x.url}`);continue;}
  if(!['B_SERIES','C_MODEL'].includes(c.group))errors.push(`Invalid W2 group: ${x.url}`);
  if(c.releaseState!=='RELEASED_W2_MANUAL')errors.push(`W2 candidate state invalid: ${x.url} -> ${c.releaseState}`);
  if(!liveSet.has(c.parent))errors.push(`Candidate parent is not live: ${x.url} -> ${c.parent}`);
  if(!liveSet.has(x.url))errors.push(`Released W2 URL not live: ${x.url}`);
  if(x.state!=='RELEASED_W2_MANUAL')errors.push(`Selection record not released: ${x.url}`);
}
const counts=p.reduce((a,x)=>(a[x.nodeType]=(a[x.nodeType]??0)+1,a),{});
if(counts.SERIES!==30||counts.MODEL!==20)errors.push(`Bad W2 mix: ${JSON.stringify(counts)}`);
const w2=plan.releaseWaves.find((w)=>w.wave==='W2');
if(w2?.automaticRelease!==false)errors.push('Master W2 automaticRelease must remain false');
if(w2?.state!=='RELEASED_SOURCE_MANUAL_APPROVAL_PENDING_REAL_BUILD')errors.push(`Unexpected W2 state ${w2?.state}`);
for(const f of ['scripts/evaluate-index-350-w1-performance-review.mjs','scripts/select-index-350-w2-candidates.mjs','src/config/index-350-w2-release.json'])if(!fs.existsSync(path.join(root,f)))errors.push(`Missing historical/release artifact: ${f}`);
console.log('INDEX 350 — W1 PERFORMANCE REVIEW / W2 SELECTION VALIDATION');
console.log(`Live/indexable: ${live.length}/${indexable.length}`);
console.log(`W2 source release: ${p.length}`);
console.log(`Series/Model: ${counts.SERIES}/${counts.MODEL}`);
console.log(`Release basis: MANUAL_APPROVAL_OVERRIDE`);
console.log(`Real W1 performance attested: ${cfg.meta.realW1PerformanceDataProvidedInPackage}`);
console.log('Automatic W2: false');
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
