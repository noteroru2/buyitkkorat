#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const gate=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-production-gate.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-release.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
const byUrl=new Map(live.map((r)=>[r.url,r]));
const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p]));
const errors=[];
if(live.length<gate.meta.expectedLiveRoutes) errors.push(`Live ${live.length} < historical W1 minimum ${gate.meta.expectedLiveRoutes}`);
if(indexable.length<gate.meta.expectedIndexableRoutes) errors.push(`Indexable ${indexable.length} < historical W1 minimum ${gate.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==gate.meta.expectedNoindexRoutes) errors.push('Noindex count drift');
if(gate.meta.releasedUrls.length!==40 || release.releasedUrls.length!==40) errors.push('W1 released URL count must be 40');
if(seo.sitemap.expectedUrlCount<gate.meta.expectedSitemapUrls) errors.push(`Sitemap ${seo.sitemap.expectedUrlCount} < historical W1 minimum ${gate.meta.expectedSitemapUrls}`);
if(gate.meta.w2Locked!==true || gate.meta.automaticW2!==false || gate.meta.automaticDeploy!==false) errors.push('Release safety switches invalid');
if(release.meta.productionGateState!=='PREDEPLOY_PENDING_REAL_BUILD') errors.push(`Unexpected productionGateState ${release.meta.productionGateState}`);
const w2=plan.releaseWaves.find((w)=>w.wave==='W2');
if(!['LOCKED_PENDING_W1_PRODUCTION_AND_OBSERVATION','CANDIDATE_SELECTION_PREPARED_PENDING_REAL_W1_REVIEW','W2_SELECTION_READY_FOR_MANUAL_APPROVAL','RELEASED_SOURCE_MANUAL_APPROVAL_PENDING_REAL_BUILD'].includes(String(w2?.state??''))) errors.push('W2 must remain non-release/locked');
for(const url of gate.meta.releasedUrls){
  const node=byUrl.get(url); const profile=profiles.get(url);
  if(!node || node.indexState!=='INDEX' || node.canonicalOwner!==url) errors.push(`W1 architecture drift ${url}`);
  if(!profile || profile.canonicalPath!==url || profile.robots!=='index,follow' || !profile.sitemapEligible) errors.push(`W1 SEO drift ${url}`);
}
let parentChildren=0;
for(const check of gate.parentChildChecks){
  if(!byUrl.has(check.parent)) errors.push(`Parent not live ${check.parent}`);
  parentChildren += check.children.length;
  for(const child of check.children){ if(!gate.meta.releasedUrls.includes(child)) errors.push(`Unexpected child ${child}`); }
}
if(parentChildren!==40) errors.push(`Parent-child coverage ${parentChildren} != 40`);
for(const script of ['scripts/audit-index-350-w1-build.mjs','scripts/predeploy-index-350-w1.mjs','scripts/verify-index-350-w1-production.mjs']){
  if(!fs.existsSync(path.join(root,script))) errors.push(`Missing script ${script}`);
}
console.log('INDEX 350 W1 — PRODUCTION RELEASE GATE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`W1 governed: ${gate.meta.releasedUrls.length}/40`);
console.log(`Parent groups: ${gate.parentChildChecks.length}`);
console.log(`Sitemap target: ${gate.meta.expectedSitemapUrls}`);
console.log(`Minimum W1 inbound paths: ${gate.routeRequirements.minimumInboundDiscoveryPaths}`);
console.log(`Minimum images/page: ${gate.routeRequirements.minimumImages}`);
console.log(`Historical W1 lock configured: ${gate.meta.w2Locked}`);
if(errors.length){for(const e of errors) console.error(`ERROR: ${e}`); console.error('VERDICT: FAIL'); process.exitCode=1;} else console.log('VERDICT: PASS');
