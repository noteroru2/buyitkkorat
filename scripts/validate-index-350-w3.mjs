#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w3-release.json'),'utf8'));
const recovery=JSON.parse(fs.readFileSync(path.join(root,'src/config/internal-link-recovery.json'),'utf8'));
const core=JSON.parse(fs.readFileSync(path.join(root,'src/config/core-hub-release.json'),'utf8'));
const live=arch.routes.filter((r)=>r.kind==='LIVE');
const indexable=live.filter((r)=>r.indexState==='INDEX');
const byUrl=new Map(live.map((r)=>[r.url,r]));
const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p]));
const w3=plan.candidates.filter((c)=>c.releaseState==='RELEASED_W3_MANUAL');
const errors=[];
if(live.length<239)errors.push(`Live ${live.length} < historical W3 minimum 239`);
if(indexable.length<238)errors.push(`Indexable ${indexable.length} < historical W3 minimum 238`);
if(live.length-indexable.length!==1)errors.push(`Noindex ${live.length-indexable.length} != 1`);
if(release.releasedUrls.length!==50||w3.length!==50)errors.push('W3 release count must be 50');
if(w3.some((c)=>c.nodeType!=='MODEL'||c.group!=='C_MODEL'))errors.push('W3 must contain Model/C_MODEL pages only');
if(release.meta.releaseBasis!=='MANUAL_APPROVAL_OVERRIDE'||release.meta.realW2PerformanceAttested!==false)errors.push('W3 release basis/evidence statement invalid');
if(release.meta.automaticPublishing!==false||release.meta.automaticW4Release!==false)errors.push('Automatic W3/W4 release safety invalid');
if(seo.sitemap.expectedUrlCount<238)errors.push(`Sitemap target ${seo.sitemap.expectedUrlCount} < historical W3 minimum 238`);
const titles=new Set(),h1s=new Set(),bodies=[];
for(const c of w3){
  const n=byUrl.get(c.url); const p=profiles.get(c.url);
  if(!n||n.indexState!=='INDEX'||n.canonicalOwner!==c.url||n.ownershipStatus!=='INDEX350_W3_RELEASED_MANUAL')errors.push(`Architecture/ownership invalid: ${c.url}`);
  if(!byUrl.has(c.parent))errors.push(`Parent not live: ${c.url} -> ${c.parent}`);
  if(c.url.startsWith('/พื้นที่/'))errors.push(`Forbidden location cross-product: ${c.url}`);
  if(!p||p.canonicalPath!==c.url||p.robots!=='index,follow'||!p.sitemapEligible)errors.push(`SEO profile invalid: ${c.url}`);
  const source=n?.sourceHint?path.join(root,n.sourceHint):null;
  if(!source||!fs.existsSync(source)){errors.push(`Missing source: ${c.url}`);continue;}
  const text=fs.readFileSync(source,'utf8'); const body=text.replace(/^---[\s\S]*?---\s*/,'');
  if(body.length<release.qualityGate.minimumBodyCharacters)errors.push(`Content too short ${c.url}: ${body.length}`);
  const title=text.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1]??''; const h1=text.match(/^h1:\s*["']?(.*?)["']?\s*$/m)?.[1]??'';
  if(!title||titles.has(title))errors.push(`Duplicate/missing title: ${c.url}`);titles.add(title);
  if(!h1||h1s.has(h1))errors.push(`Duplicate/missing h1: ${c.url}`);h1s.add(h1);
  if(!/indexable:\s*true/m.test(text))errors.push(`Frontmatter indexable missing: ${c.url}`);
  if(!/productFocus:/m.test(text)||!/illustration:/m.test(text))errors.push(`Visual/content metadata missing: ${c.url}`);
  bodies.push({url:c.url,body,tokens:new Set((body.toLowerCase().match(/[a-z0-9ก-๙]+/g)??[]))});
}
let maxSimilarity=0,similarPair=[];
for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const a=bodies[i].tokens,b=bodies[j].tokens;let inter=0;for(const t of a)if(b.has(t))inter++;const union=a.size+b.size-inter;const sim=union?inter/union:0;
  if(sim>maxSimilarity){maxSimilarity=sim;similarPair=[bodies[i].url,bodies[j].url];}
}
if(maxSimilarity>release.qualityGate.maximumPairSimilarity)errors.push(`W3 content similarity too high ${maxSimilarity.toFixed(4)}: ${similarPair.join(' <> ')}`);
const coreHubs=new Map(core.coreHubs.map((h)=>[h.url,h]));const apple=core.appleBridge.members;
function liveParent(url){const p=byUrl.get(url)?.recommendedParent;return p&&!p.startsWith('virtual:')&&byUrl.has(p)?p:null;}
function children(url){return indexable.filter((n)=>n.recommendedParent===url).map((n)=>n.url);}
function discovery(url){const raw=url==='/'?recovery.homepageDiscovery:children(url);return raw.filter((t)=>byUrl.get(t)?.indexState==='INDEX').slice(0,recovery.meta.maxHubDiscoveryLinks);}
function siblings(url){const parent=liveParent(url);if(!parent||parent==='/')return[];const all=children(parent);const i=all.indexOf(url);if(i<0||all.length<2)return[];const out=[];for(let off=1;off<all.length;off++)out.push(all[(i+off)%all.length]);return out;}
function related(url){const n=byUrl.get(url);if(!n||n.indexState!=='INDEX'||url==='/'||n.cluster==='TRUST')return[];const out=[];const seen=new Set([url,...discovery(url)]);const push=(t)=>{if(t===url||seen.has(t)||byUrl.get(t)?.indexState!=='INDEX')return;seen.add(t);out.push(t);};for(const t of recovery.conversionBridges[url]??[]){push(t);if(out.length>=recovery.meta.maxRelatedLinks)return out;}if(apple.includes(url)){const start=apple.indexOf(url);for(let off=1;off<apple.length;off++){push(apple[(start+off)%apple.length]);if(out.length>=recovery.meta.maxRelatedLinks)return out;}}else{const h=coreHubs.get(url);if(h)for(const t of h.peerLinks){push(t);if(out.length>=recovery.meta.maxRelatedLinks)return out;}}for(const t of siblings(url)){push(t);if(out.length>=recovery.meta.maxRelatedLinks)return out;}return out;}
function breadcrumbs(url){if(url==='/'||!byUrl.has(url))return[];const chain=[url],seen=new Set([url]);let cur=url;while(true){const p=liveParent(cur);if(!p||p==='/')break;if(seen.has(p))break;seen.add(p);chain.unshift(p);cur=p;}return ['/',...chain];}
const inbound=new Map(release.releasedUrls.map((u)=>[u,new Set()]));
for(const n of indexable){for(const t of breadcrumbs(n.url).slice(0,-1))inbound.get(t)?.add(n.url);for(const t of discovery(n.url))inbound.get(t)?.add(n.url);for(const t of related(n.url))inbound.get(t)?.add(n.url);}
const minInbound=Math.min(...[...inbound.values()].map((s)=>s.size));
for(const [u,s] of inbound)if(s.size<release.qualityGate.minimumDiscoveryPaths)errors.push(`W3 inbound ${s.size}<${release.qualityGate.minimumDiscoveryPaths}: ${u}`);
const w4=plan.releaseWaves.find((w)=>w.wave==='W4');if(!w4||w4.automaticRelease!==false)errors.push('W4 automatic release safety changed');
console.log('INDEX 350 EXPANSION — W3 MODEL 50 RELEASE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Released Model pages: ${w3.length}/50`);
console.log(`Cluster mix: ${Object.entries(release.clusterMix).map(([k,v])=>`${k}=${v}`).join(', ')}`);
console.log(`Content files checked: ${bodies.length}`);
console.log(`Minimum body characters: ${Math.min(...bodies.map((b)=>b.body.length))}`);
console.log(`Max pair similarity: ${maxSimilarity.toFixed(4)}`);
console.log(`Minimum projected inbound paths: ${minInbound}`);
console.log(`Sitemap target: ${seo.sitemap.expectedUrlCount}`);
console.log(`Release basis: ${release.meta.releaseBasis}`);
console.log(`Real W2 performance attested: ${release.meta.realW2PerformanceAttested}`);
console.log(`W4: ${release.meta.nextWave}`);
if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error('VERDICT: FAIL');process.exitCode=1;}else console.log('VERDICT: PASS');
