#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'src/config/seo-index-control.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const release=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-release.json'),'utf8'));
const live=arch.routes.filter((r)=>r.kind==='LIVE'); const indexable=live.filter((r)=>r.indexState==='INDEX');
const byUrl=new Map(live.map((r)=>[r.url,r])); const profiles=new Map(seo.routeProfiles.map((p)=>[p.url,p])); const errors=[];
if(live.length<139) errors.push(`Live ${live.length} < historical W1 minimum 139`);
if(indexable.length<138) errors.push(`Indexable ${indexable.length} < historical W1 minimum 138`);
if(release.releasedUrls.length!==40) errors.push('Released URL count must be 40');
const releasedPlan=plan.candidates.filter((c)=>c.releaseState==='RELEASED_W1');
if(releasedPlan.length!==40) errors.push(`Plan W1 state count ${releasedPlan.length} != 40`);
if(releasedPlan.filter((c)=>c.nodeType==='BRAND').length!==24) errors.push('Brand release != 24');
if(releasedPlan.filter((c)=>c.nodeType==='SERIES').length!==16) errors.push('Series release != 16');
const titles=new Set(), h1s=new Set();
for(const c of releasedPlan){
 const n=byUrl.get(c.url); if(!n) {errors.push(`Missing live node ${c.url}`); continue;}
 if(n.canonicalOwner!==c.url||n.indexState!=='INDEX') errors.push(`SEO ownership invalid ${c.url}`);
 const p=profiles.get(c.url); if(!p||p.canonicalPath!==c.url||p.robots!=='index,follow'||!p.sitemapEligible) errors.push(`SEO profile invalid ${c.url}`);
 const source=path.join(root,n.sourceHint); if(!fs.existsSync(source)){errors.push(`Missing content ${n.sourceHint}`); continue;}
 const text=fs.readFileSync(source,'utf8');
 const body=text.replace(/^---[\s\S]*?---\s*/,'');
 if(body.length<1600) errors.push(`Content too short ${c.url}: ${body.length}`);
 const title=text.match(/^title:\s*["']?(.*?)["']?\s*$/m)?.[1]??''; const h1=text.match(/^h1:\s*["']?(.*?)["']?\s*$/m)?.[1]??'';
 if(!title||titles.has(title)) errors.push(`Duplicate/missing title ${c.url}`); titles.add(title);
 if(!h1||h1s.has(h1)) errors.push(`Duplicate/missing h1 ${c.url}`); h1s.add(h1);
 const siblings=live.filter((r)=>r.indexState==='INDEX'&&r.recommendedParent===c.parent&&r.url!==c.url);
 if(siblings.length<1) errors.push(`No sibling discovery path for ${c.url}`);
 if(!byUrl.has(c.parent)) errors.push(`Parent not live ${c.url} -> ${c.parent}`);
}
if(seo.sitemap.expectedUrlCount<138) errors.push(`Sitemap ${seo.sitemap.expectedUrlCount} < historical W1 minimum 138`);
console.log('INDEX 350 W1 — BRAND & SERIES RELEASE VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Released: 40 (24 Brand + 16 Series)`);
console.log(`Content files checked: ${releasedPlan.length}`);
console.log(`Sitemap target: ${seo.sitemap.expectedUrlCount}`);
console.log(`W1 historical surface: PRESERVED`);
if(errors.length){for(const e of errors) console.error(`ERROR: ${e}`); console.error('VERDICT: FAIL'); process.exitCode=1;} else console.log('VERDICT: PASS');
