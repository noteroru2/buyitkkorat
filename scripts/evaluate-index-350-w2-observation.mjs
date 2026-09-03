#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function arg(name){const h=process.argv.find((x)=>x.startsWith(`--${name}=`));return h?h.slice(name.length+3):null;}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-observation-gate.json'),'utf8'));
const prodRel=arg('production')??cfg.inputs.productionVerification;
const gscRel=arg('input');
const indexRel=arg('indexation');
const outRel=arg('output')??'docs/architecture/index350-w2-observation-report.json';
const pagesRel=arg('pages-output')??'docs/architecture/index350-w2-observation-pages.csv';
const ownRel=arg('ownership-output')??'docs/architecture/index350-w2-query-ownership.csv';
if(!gscRel){console.error('Usage: node scripts/evaluate-index-350-w2-observation.mjs --input=docs/gsc/w2-date-query-page.csv [--indexation=docs/gsc/w2-indexation.csv]');process.exit(2);}
const prodPath=path.resolve(root,prodRel);
if(!fs.existsSync(prodPath)){console.error(`Missing production verification report: ${prodRel}`);process.exit(2);}
const prod=JSON.parse(fs.readFileSync(prodPath,'utf8'));
if(prod.productionVerified!==true||!prod.releaseDate){console.error('W2 production is not verified; observation cannot start.');process.exit(3);}

function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}}if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows.filter((r)=>r.some((x)=>x!==''));}
function norm(v){let s=String(v??'').trim();try{if(/^https?:/i.test(s))s=new URL(s).pathname;}catch{};try{s=decodeURI(s)}catch{};if(!s.startsWith('/'))s='/'+s;s=s.split('?')[0].split('#')[0].replace(/\/{2,}/g,'/');if(s.length>1)s=s.replace(/\/+$/,'');return s||'/';}
function dayDiff(a,b){return Math.floor((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);}
function esc(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function bool(v){return ['1','true','yes','y','indexed','index'].includes(String(v??'').trim().toLowerCase());}
function nodeClass(u){const p=cfg.ownershipPairs.find((x)=>x.child===u);return p?.nodeType.startsWith('SERIES')?'SERIES':p?.nodeType.startsWith('MODEL')?'MODEL':'OTHER';}

const raw=parseCsv(fs.readFileSync(path.resolve(root,gscRel),'utf8').replace(/^\uFEFF/,''));
const header=(raw.shift()??[]).map((x)=>x.trim().toLowerCase());
const req=cfg.inputs.gscRequiredColumns;
const ix=Object.fromEntries(req.map((k)=>[k,header.indexOf(k)]));
for(const[k,i]of Object.entries(ix)){if(i<0){console.error(`Missing GSC column: ${k}`);process.exit(2);}}

const observed=new Set(cfg.meta.observedUrls);
const allRelevant=new Set([...cfg.meta.observedUrls,...cfg.ownershipPairs.map((p)=>p.parent)]);
const stats=new Map([...allRelevant].map((u)=>[u,{clicks:0,impressions:0,posWeighted:0,queries:new Map(),dates:new Set()}]));
const validDates=[];
for(const r of raw){
  const date=String(r[ix.date]??'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(date))validDates.push(date);
  const page=norm(r[ix.page]);
  if(!stats.has(page))continue;
  if(date<prod.releaseDate)continue;
  const q=String(r[ix.query]??'').trim().toLowerCase();
  const clicks=Number(r[ix.clicks]||0)||0;
  const impressions=Number(r[ix.impressions]||0)||0;
  const position=Number(r[ix.position]||0)||0;
  const s=stats.get(page);
  s.clicks+=clicks;s.impressions+=impressions;s.posWeighted+=position*impressions;if(date)s.dates.add(date);
  if(q){const prev=s.queries.get(q)??{clicks:0,impressions:0,posWeighted:0};prev.clicks+=clicks;prev.impressions+=impressions;prev.posWeighted+=position*impressions;s.queries.set(q,prev);}
}
const latestFinalized=validDates.length?[...validDates].sort().at(-1):null;
const finalizedDays=latestFinalized?dayDiff(prod.releaseDate,latestFinalized):null;

const indexedMap=new Map();
let indexation={provided:false,indexed:0,covered:0};
if(indexRel){
  const ip=path.resolve(root,indexRel);if(!fs.existsSync(ip)){console.error(`Indexation file not found: ${indexRel}`);process.exit(2);}
  const rows=parseCsv(fs.readFileSync(ip,'utf8').replace(/^\uFEFF/,''));
  const h=(rows.shift()??[]).map((x)=>x.trim().toLowerCase());
  const urlIx=h.indexOf('url'),indexedIx=h.indexOf('indexed'),statusIx=h.indexOf('status'),crawlIx=h.indexOf('last_crawl');
  if(urlIx<0||indexedIx<0){console.error('Indexation CSV requires url,indexed columns');process.exit(2);}
  for(const r of rows){const u=norm(r[urlIx]);if(!observed.has(u))continue;indexedMap.set(u,{indexed:bool(r[indexedIx]),status:statusIx>=0?String(r[statusIx]??''):'',lastCrawl:crawlIx>=0?String(r[crawlIx]??''):''});}
  indexation={provided:true,indexed:[...indexedMap.values()].filter((x)=>x.indexed).length,covered:indexedMap.size};
}

const pageRows=cfg.meta.observedUrls.map((u)=>{
  const s=stats.get(u);const ixv=indexedMap.get(u);const type=nodeClass(u);
  let signal='NO_DATA';
  if(s.impressions>0)signal='VISIBLE';
  if(s.clicks>0)signal='CLICK_SIGNAL';
  return {url:u,nodeType:type,clicks:s.clicks,impressions:s.impressions,uniqueQueries:s.queries.size,avgPosition:s.impressions?(s.posWeighted/s.impressions).toFixed(2):'',signal,visible:s.impressions>0?'YES':'NO',indexed:ixv?String(ixv.indexed).toUpperCase():'UNKNOWN',indexStatus:ixv?.status??'',lastCrawl:ixv?.lastCrawl??''};
});

const ownership=[];
for(const pair of cfg.ownershipPairs){
  const p=stats.get(pair.parent),c=stats.get(pair.child);const pq=new Set(p.queries.keys()),cq=new Set(c.queries.keys()),union=new Set([...pq,...cq]),overlap=[...pq].filter((q)=>cq.has(q));const j=union.size?overlap.length/union.size:0;
  const sharedParent=overlap.reduce((s,q)=>s+(p.queries.get(q)?.impressions??0),0),sharedChild=overlap.reduce((s,q)=>s+(c.queries.get(q)?.impressions??0),0);
  let state='NO_CHILD_DATA';if(c.impressions>0)state='CHILD_VISIBLE';
  if(overlap.length>=cfg.thresholds.ownershipOverlapMinQueries&&j>=cfg.thresholds.ownershipJaccardReview&&p.impressions>=cfg.thresholds.ownershipMinParentImpressions&&c.impressions>=cfg.thresholds.ownershipMinChildImpressions)state='OWNERSHIP_REVIEW';
  ownership.push({parent:pair.parent,child:pair.child,nodeType:pair.nodeType,parentImpressions:p.impressions,childImpressions:c.impressions,parentQueries:pq.size,childQueries:cq.size,overlapQueries:overlap.length,jaccard:j.toFixed(4),sharedParentImpressions:sharedParent,sharedChildImpressions:sharedChild,state,action:state==='OWNERSHIP_REVIEW'?'Review shared queries manually; no destructive action.':'Continue observation.'});
}

const seriesRows=pageRows.filter((r)=>r.nodeType==='SERIES');
const modelRows=pageRows.filter((r)=>r.nodeType==='MODEL');
const visiblePages=pageRows.filter((r)=>r.impressions>0).length;
const visibleSeries=seriesRows.filter((r)=>r.impressions>0).length;
const visibleModels=modelRows.filter((r)=>r.impressions>0).length;
const indexedPages=indexation.indexed;
const indexedSeries=seriesRows.filter((r)=>indexedMap.get(r.url)?.indexed===true).length;
const indexedModels=modelRows.filter((r)=>indexedMap.get(r.url)?.indexed===true).length;
const ownershipReviewPairs=ownership.filter((r)=>r.state==='OWNERSHIP_REVIEW').length;

const dateGate=finalizedDays!==null&&finalizedDays>=cfg.thresholds.minimumFinalizedDays;
const visibilityGate=visiblePages>=cfg.thresholds.minimumVisibleW2Pages&&visibleSeries>=cfg.thresholds.minimumVisibleSeriesPages&&visibleModels>=cfg.thresholds.minimumVisibleModelPages;
const indexGate=indexation.provided&&indexedPages>=cfg.thresholds.minimumIndexedW2Pages&&indexedSeries>=cfg.thresholds.minimumIndexedSeriesPages&&indexedModels>=cfg.thresholds.minimumIndexedModelPages;
const ownershipGate=ownershipReviewPairs<=cfg.thresholds.maximumOwnershipReviewPairsForEligibility;

let state='WAIT_FOR_FINALIZED_GSC';
if(dateGate&&!visibilityGate)state='HOLD_LOW_VISIBILITY';
else if(dateGate&&visibilityGate&&!indexGate)state='REVIEW_PENDING_INDEXATION';
else if(dateGate&&visibilityGate&&indexGate&&!ownershipGate)state='OWNERSHIP_REVIEW_REQUIRED';
else if(dateGate&&visibilityGate&&indexGate&&ownershipGate)state='ROUND3_REVIEW_ELIGIBLE';

const report={
  wave:'INDEX350_W2',generatedAt:new Date().toISOString(),state,releaseDate:prod.releaseDate,latestFinalizedDate:latestFinalized,finalizedDaysAfterRelease:finalizedDays,
  releaseBasis:cfg.meta.releaseBasis,realW1PerformanceAttested:cfg.meta.realW1PerformanceAttested,
  gates:{productionVerified:true,dateGate,visibilityGate,indexationGate:indexGate,ownershipGate},
  counts:{w2Pages:50,seriesPages:seriesRows.length,modelPages:modelRows.length,visiblePages,visibleShare:visiblePages/50,visibleSeries,visibleModels,indexationProvided:indexation.provided,indexationRows:indexation.covered,indexedPages,indexedShare:indexedPages/50,indexedSeries,indexedModels,ownershipPairs:ownership.length,ownershipReviewPairs},
  w3:{locked:true,manualReviewEligible:state==='ROUND3_REVIEW_ELIGIBLE',automaticRelease:false,recommendation:state==='ROUND3_REVIEW_ELIGIBLE'?'MANUAL_W3_CANDIDATE_REVIEW':'HOLD_W3'},
  hardRules:cfg.hardRules
};
function writeCsv(rel,rows){const out=path.resolve(root,rel);fs.mkdirSync(path.dirname(out),{recursive:true});if(!rows.length){fs.writeFileSync(out,'');return;}const cols=Object.keys(rows[0]);fs.writeFileSync(out,[cols.join(','),...rows.map((r)=>cols.map((c)=>esc(r[c])).join(','))].join('\n')+'\n');}
writeCsv(pagesRel,pageRows);writeCsv(ownRel,ownership);
const out=path.resolve(root,outRel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('INDEX 350 — W2 OBSERVATION GATE');
console.log(`Release date: ${prod.releaseDate}`);
console.log(`Latest finalized GSC date: ${latestFinalized??'NONE'}`);
console.log(`Finalized days after release: ${finalizedDays??'N/A'}`);
console.log(`Visible W2 pages: ${visiblePages}/50 (Series ${visibleSeries}/30, Model ${visibleModels}/20)`);
console.log(`Indexed W2 pages: ${indexation.provided?`${indexedPages}/50 (Series ${indexedSeries}/30, Model ${indexedModels}/20)`:'NOT PROVIDED'}`);
console.log(`Ownership review pairs: ${ownershipReviewPairs}/${ownership.length}`);
console.log(`Release basis: ${cfg.meta.releaseBasis}`);
console.log(`State: ${state}`);
console.log('W3: LOCKED');
console.log('Automatic W3: false');
console.log(`Report: ${path.relative(root,out)}`);
console.log(state==='ROUND3_REVIEW_ELIGIBLE'?'VERDICT: REVIEW_ELIGIBLE':state==='WAIT_FOR_FINALIZED_GSC'?'VERDICT: WAIT_FOR_MORE_DATA':'VERDICT: HOLD');
