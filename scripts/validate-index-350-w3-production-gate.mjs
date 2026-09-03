#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import process from 'node:process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-release.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-production-gate.json'),'utf8'));
const live=arch.routes.filter((r)=>r.kind==='LIVE'),indexable=live.filter((r)=>r.indexState==='INDEX');const byUrl=new Map(live.map((r)=>[r.url,r]));const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p]));const w3=plan.candidates.filter((c)=>c.releaseState==='RELEASED_W3_MANUAL');const errors=[];
if(live.length<gate.meta.expectedLiveRoutes)errors.push(`Live ${live.length} < historical W3 minimum ${gate.meta.expectedLiveRoutes}`);
if(indexable.length<gate.meta.expectedIndexableRoutes)errors.push(`Indexable ${indexable.length} < historical W3 minimum ${gate.meta.expectedIndexableRoutes}`);
if(live.length-indexable.length!==gate.meta.expectedNoindexRoutes)errors.push(`Noindex ${live.length-indexable.length} != ${gate.meta.expectedNoindexRoutes}`);
if(gate.meta.releasedUrls.length!==50||release.releasedUrls.length!==50||w3.length!==50)errors.push('W3 released URL count must be 50');
if(seo.sitemap.expectedUrlCount<gate.meta.expectedSitemapUrls)errors.push(`Sitemap ${seo.sitemap.expectedUrlCount} < historical W3 minimum ${gate.meta.expectedSitemapUrls}`);
if(gate.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE'||gate.meta.realW2PerformanceAttested!==false)errors.push('W3 evidence statement drift');
if(gate.meta.w4Locked!==true||gate.meta.automaticW4!==false||gate.meta.automaticDeploy!==false)errors.push('W3 production safety switches invalid');
if(release.meta.productionGateState!=='PREDEPLOY_PENDING_REAL_BUILD')errors.push(`Unexpected W3 productionGateState ${release.meta.productionGateState}`);
const w3Wave=plan.releaseWaves.find((w)=>w.wave==='W3');const w4Wave=plan.releaseWaves.find((w)=>w.wave==='W4');
if(w3Wave?.productionGate!=='CONFIGURED_PENDING_REAL_BUILD')errors.push(`W3 production gate plan state invalid: ${w3Wave?.productionGate}`);
if(w3Wave?.productionVerification!=='PENDING')errors.push(`W3 production verification plan state invalid: ${w3Wave?.productionVerification}`);
if(!w4Wave||w4Wave?.automaticRelease!==false)errors.push(`W4 automatic release safety invalid: ${w4Wave?.state}`);
const releaseSet=new Set(gate.meta.releasedUrls);
for(const url of gate.meta.releasedUrls){const node=byUrl.get(url),profile=profiles.get(url);if(!node||node.indexState!=='INDEX'||node.canonicalOwner!==url||node.ownershipStatus!=='INDEX350_W3_RELEASED_MANUAL')errors.push(`W3 architecture drift ${url}`);if(!profile||profile.canonicalPath!==url||profile.robots!=='index,follow'||!profile.sitemapEligible)errors.push(`W3 SEO drift ${url}`);}
let parentChildren=0;const covered=new Set();for(const check of gate.parentChildChecks){if(!byUrl.has(check.parent))errors.push(`Parent not live ${check.parent}`);parentChildren+=check.children.length;for(const child of check.children){if(!releaseSet.has(child))errors.push(`Unexpected W3 child ${child}`);if(covered.has(child))errors.push(`Duplicate W3 parent-child coverage ${child}`);covered.add(child);}}
if(parentChildren!==50||covered.size!==50)errors.push(`Parent-child coverage ${parentChildren}/${covered.size} != 50`);
for(const script of ['scripts/audit-index-350-w3-build.mjs','scripts/predeploy-index-350-w3.mjs','scripts/verify-index-350-w3-production.mjs'])if(!fs.existsSync(path.join(root,script)))errors.push(`Missing script ${script}`);
console.log('INDEX 350 W3 — PRODUCTION RELEASE GATE VALIDATION');console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);console.log(`W3 governed: ${gate.meta.releasedUrls.length}/50`);console.log(`Parent groups: ${gate.parentChildChecks.length}`);console.log(`Sitemap target: ${gate.meta.expectedSitemapUrls}`);console.log(`Minimum W3 inbound paths: ${gate.routeRequirements.minimumInboundDiscoveryPaths}`);console.log(`Minimum images/page: ${gate.routeRequirements.minimumImages}`);console.log(`Release basis: ${gate.meta.releaseBasis}`);console.log(`Real W2 performance attested: ${gate.meta.realW2PerformanceAttested}`);console.log(`W4: ${gate.meta.w4Locked?'LOCKED':'UNLOCKED'}`);if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
