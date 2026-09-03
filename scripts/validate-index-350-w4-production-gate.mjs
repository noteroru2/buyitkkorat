#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import process from 'node:process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w4-release.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w4-production-gate.json'),'utf8'));
const live=arch.routes.filter((r)=>r.kind==='LIVE'),indexable=live.filter((r)=>r.indexState==='INDEX');const byUrl=new Map(live.map((r)=>[r.url,r]));const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p]));const w4=plan.candidates.filter((c)=>c.releaseState==='RELEASED_W4_MANUAL');const errors=[];
if(live.length<gate.meta.expectedLiveRoutes)errors.push(`Live ${live.length} < historical W4 minimum ${gate.meta.expectedLiveRoutes}`);
if(indexable.length<gate.meta.expectedIndexableRoutes)errors.push(`Indexable ${indexable.length} < historical W4 minimum ${gate.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==gate.meta.expectedNoindexRoutes)errors.push(`Noindex ${live.length-indexable.length} != ${gate.meta.expectedNoindexRoutes}`);
if(gate.meta.releasedUrls.length!==50||release.releasedUrls.length!==50||w4.length!==50)errors.push('W4 released URL count must be 50');
if(release.meta.seriesReleased!==18||release.meta.modelReleased!==7||release.meta.conditionReleased!==25)errors.push('W4 release composition drift');
if(seo.sitemap.expectedUrlCount<gate.meta.expectedSitemapUrls)errors.push(`Sitemap ${seo.sitemap.expectedUrlCount} < historical W4 minimum ${gate.meta.expectedSitemapUrls}`);
if(gate.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE'||gate.meta.realW3PerformanceAttested!==false)errors.push('W4 evidence statement drift');
if(gate.meta.w5Locked!==true||gate.meta.automaticW5!==false||gate.meta.automaticDeploy!==false)errors.push('W4 production safety switches invalid');
if(release.meta.productionGateState!=='PREDEPLOY_PENDING_REAL_BUILD')errors.push(`Unexpected W4 productionGateState ${release.meta.productionGateState}`);
const w4Wave=plan.releaseWaves.find((w)=>w.wave==='W4');const w5Wave=plan.releaseWaves.find((w)=>w.wave==='W5');
if(w4Wave?.productionGate!=='CONFIGURED_PENDING_REAL_BUILD')errors.push(`W4 production gate plan state invalid: ${w4Wave?.productionGate}`);
if(w4Wave?.productionVerification!=='PENDING')errors.push(`W4 production verification plan state invalid: ${w4Wave?.productionVerification}`);
if(!['LOCKED_PENDING_W4_PRODUCTION_AND_OBSERVATION','RELEASED_SOURCE_MANUAL_APPROVAL_PENDING_REAL_BUILD'].includes(w5Wave?.state)||w5Wave?.automaticRelease!==false)errors.push(`W5 historical state invalid after later source release: ${w5Wave?.state}`);
const releaseSet=new Set(gate.meta.releasedUrls);
for(const url of gate.meta.releasedUrls){const node=byUrl.get(url),profile=profiles.get(url);if(!node||node.indexState!=='INDEX'||node.canonicalOwner!==url||node.ownershipStatus!=='INDEX350_W4_RELEASED_MANUAL')errors.push(`W4 architecture drift ${url}`);if(!profile||profile.canonicalPath!==url||profile.robots!=='index,follow'||!profile.sitemapEligible)errors.push(`W4 SEO drift ${url}`);}
let parentChildren=0;const covered=new Set();for(const check of gate.parentChildChecks){if(!byUrl.has(check.parent))errors.push(`Parent not live ${check.parent}`);parentChildren+=check.children.length;for(const child of check.children){if(!releaseSet.has(child))errors.push(`Unexpected W4 child ${child}`);if(covered.has(child))errors.push(`Duplicate W4 parent-child coverage ${child}`);covered.add(child);}}
if(parentChildren!==50||covered.size!==50)errors.push(`Parent-child coverage ${parentChildren}/${covered.size} != 50`);
for(const dep of release.sameWaveParentDependencies??[]){if(releaseSet.has(dep.child)&&!releaseSet.has(dep.parent)&&!byUrl.has(dep.parent))errors.push(`Same-wave parent missing ${dep.child} -> ${dep.parent}`);}
for(const risk of release.excludedOwnershipRiskUrls??[])if(releaseSet.has(risk))errors.push(`Ownership-risk URL released ${risk}`);
for(const script of ['scripts/audit-index-350-w4-build.mjs','scripts/predeploy-index-350-w4.mjs','scripts/verify-index-350-w4-production.mjs'])if(!fs.existsSync(path.join(root,script)))errors.push(`Missing script ${script}`);
console.log('INDEX 350 W4 — PRODUCTION RELEASE GATE VALIDATION');console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);console.log(`W4 governed: ${gate.meta.releasedUrls.length}/50`);console.log(`Composition: Series ${release.meta.seriesReleased}, Model ${release.meta.modelReleased}, Condition ${release.meta.conditionReleased}`);console.log(`Parent groups: ${gate.parentChildChecks.length}`);console.log(`Sitemap target: ${gate.meta.expectedSitemapUrls}`);console.log(`Minimum W4 inbound paths: ${gate.routeRequirements.minimumInboundDiscoveryPaths}`);console.log(`Minimum images/page: ${gate.routeRequirements.minimumImages}`);console.log(`Release basis: ${gate.meta.releaseBasis}`);console.log(`Real W3 performance attested: ${gate.meta.realW3PerformanceAttested}`);console.log(`W5: ${gate.meta.w5Locked?'LOCKED':'UNLOCKED'}`);if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
