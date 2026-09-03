#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const architecture=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const foundation=JSON.parse(fs.readFileSync(path.join(root,'src/config/brand-model-series-foundation.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-release-round-1.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const core=JSON.parse(fs.readFileSync(path.join(root,'src/config/core-hub-release.json'),'utf8'));
const evidence=JSON.parse(fs.readFileSync(path.join(root,'docs/architecture/expansion-round-1-evidence.json'),'utf8'));

const recovery=JSON.parse(fs.readFileSync(path.join(root,'src/config/internal-link-recovery.json'),'utf8'));

const live=architecture.routes.filter((n)=>n.kind==='LIVE');
const indexable=live.filter((n)=>n.indexState==='INDEX');
const byUrl=new Map(live.map((n)=>[n.url,n]));
const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p]));
const errors=[];
const warnings=[];

if (live.length!==architecture.meta.currentRoutes) errors.push(`Live count drift: ${live.length} != ${architecture.meta.currentRoutes}`);
if (indexable.length!==architecture.meta.currentIndexable) errors.push(`Indexable count drift: ${indexable.length} != ${architecture.meta.currentIndexable}`);
if (release.meta.released!==4) errors.push(`Expected 4 released nodes, got ${release.meta.released}`);
if (release.meta.released > release.meta.releaseCap) errors.push('Release cap exceeded');
if (release.meta.modelsReleased!==0) errors.push('Model release is prohibited in Round 1');
if (release.meta.guidesReleased!==0 || release.meta.localReleased!==0) errors.push('Guide/Local release is prohibited in Round 1');
if (release.meta.automaticPublishing!==false) errors.push('Automatic publishing must remain false');
if (evidence.meta.inventedMetrics!==false) errors.push('Evidence pack must explicitly reject invented metrics');
if (evidence.meta.gscQueryPageEvidence!=='NOT_AVAILABLE') warnings.push('GSC evidence state changed; review evidence pack');

const expected=[
  '/รับซื้อโน๊ตบุ๊ค-asus-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-dell-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช',
];
for (const url of expected){
  const node=byUrl.get(url);
  if (!node) { errors.push(`Missing released URL: ${url}`); continue; }
  if (node.indexState!=='INDEX' || node.canonicalOwner!==url) errors.push(`Released URL not self-canonical/index: ${url}`);
  if (node.ownershipStatus!=='RELEASED_EVIDENCE_BACKED') errors.push(`Released URL missing evidence-backed status: ${url}`);
  const profile=profiles.get(url);
  if (!profile || !profile.sitemapEligible || profile.canonicalPath!==url || profile.robots!=='index,follow') {
    errors.push(`SEO profile invalid: ${url}`);
  }
  const source=node.sourceHint ? path.join(root,node.sourceHint) : '';
  if (!source || !fs.existsSync(source)) errors.push(`Released content file missing: ${url}`);
}

const parents={
  '/รับซื้อโน๊ตบุ๊ค-asus-โคราช':'/รับซื้อโน๊ตบุ๊ค-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช':'/รับซื้อโน๊ตบุ๊ค-asus-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-dell-โคราช':'/รับซื้อโน๊ตบุ๊ค-โคราช',
  '/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช':'/รับซื้อโน๊ตบุ๊ค-dell-โคราช',
};
for (const [url,parent] of Object.entries(parents)){
  if (byUrl.get(url)?.recommendedParent!==parent) errors.push(`Parent mismatch: ${url}`);
}

const remainingCandidateIds=new Set([
  ...foundation.candidateBrands.map((c)=>c.id),
  ...foundation.candidateSeries.map((c)=>c.id),
]);
for (const item of release.releasedNodes){
  if (remainingCandidateIds.has(item.candidateId)) errors.push(`Released candidate still in HOLD list: ${item.candidateId}`);
}
if (foundation.candidateBrands.length!==8) errors.push(`Expected 8 remaining Brand candidates, got ${foundation.candidateBrands.length}`);
if (foundation.candidateSeries.length!==40) errors.push(`Expected 40 remaining Series candidates, got ${foundation.candidateSeries.length}`);
if (foundation.modelPolicy.seededModelCandidates.length!==0) errors.push('Model candidates must remain 0');

if (seo.sitemap.expectedUrlCount!==architecture.meta.currentIndexable) errors.push(`Sitemap expected count ${seo.sitemap.expectedUrlCount} != ${architecture.meta.currentIndexable}`);
if (seo.canonical.currentSelfCanonicalCount!==architecture.meta.currentIndexable) errors.push(`Canonical self-count must be ${architecture.meta.currentIndexable}`);

for (const [source,target] of [
  ['/รับซื้อโน๊ตบุ๊คเกมมิ่ง-โคราช','/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช'],
  ['/รับซื้อคอมบริษัท-โคราช','/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช'],
]) {
  if (!(recovery.conversionBridges?.[source] ?? []).includes(target)) {
    errors.push(`Missing Round 1 contextual bridge: ${source} -> ${target}`);
  }
}

const notebook=core.coreHubs.find((h)=>h.url==='/รับซื้อโน๊ตบุ๊ค-โคราช');
for (const child of ['/รับซื้อโน๊ตบุ๊ค-asus-โคราช','/รับซื้อโน๊ตบุ๊ค-dell-โคราช']){
  if (!notebook?.children.includes(child)) errors.push(`Notebook hub missing released brand child: ${child}`);
}

console.log('EXPANSION RELEASE ROUND 1 — VALIDATION');
console.log(`Live routes: ${live.length}`);
console.log(`Indexable: ${indexable.length}`);
console.log(`Released Brand nodes: 2`);
console.log(`Released Series nodes: 2`);
console.log(`Remaining Brand candidates: ${foundation.candidateBrands.length}`);
console.log(`Remaining Series candidates: ${foundation.candidateSeries.length}`);
console.log(`Model candidates: ${foundation.modelPolicy.seededModelCandidates.length}`);
console.log(`Sitemap expected URLs: ${seo.sitemap.expectedUrlCount}`);
console.log(`Round 2 state: ${release.observationGate.round2State}`);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.warn(`WARN: ${w}`);
if(errors.length){
  for(const e of errors) console.error(`ERROR: ${e}`);
  console.error('VERDICT: FAIL');
  process.exitCode=1;
}else{
  console.log('VERDICT: PASS');
}
