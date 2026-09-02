#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');

function arg(name){
  const hit=process.argv.find((x)=>x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length+3) : null;
}
const productionRel=arg('production') ?? 'docs/architecture/expansion-round-1-production-verification.json';
const input=arg('input');
const output=arg('output') ?? 'docs/architecture/expansion-round-1-observation-status.json';
const gate=JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-round-1-production-gate.json'),'utf8'));

const productionPath=path.resolve(root,productionRel);
if(!fs.existsSync(productionPath)){
  console.error(`Missing production verification report: ${productionRel}`);
  process.exit(2);
}
const prod=JSON.parse(fs.readFileSync(productionPath,'utf8'));
if(prod.productionVerified!==true || !prod.releaseDate){
  console.error('Production is not verified; observation cannot start.');
  process.exit(3);
}
if(!input){
  console.error('Usage: node scripts/evaluate-expansion-round-1-observation.mjs --input=path/to/date-query-page.csv');
  process.exit(2);
}

function parseCsv(text){
  const rows=[]; let row=[], field='', quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){
      if(c==='"' && text[i+1]==='"'){ field+='"'; i++; }
      else if(c==='"') quoted=false;
      else field+=c;
    }else{
      if(c==='"') quoted=true;
      else if(c===','){ row.push(field); field=''; }
      else if(c==='\n'){ row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=c;
    }
  }
  if(field.length||row.length){ row.push(field.replace(/\r$/,'')); rows.push(row); }
  return rows.filter((r)=>r.some((x)=>x!==''));
}
function normalizePage(value){
  let s=String(value??'').trim();
  try{ if(/^https?:\/\//i.test(s)) s=new URL(s).pathname; }catch{}
  try{s=decodeURI(s);}catch{}
  if(!s.startsWith('/')) s=`/${s}`;
  s=s.split('?')[0].split('#')[0].replace(/\/{2,}/g,'/');
  if(s.length>1) s=s.replace(/\/+$/,'');
  return s;
}
function dayDiff(a,b){
  return Math.floor((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
}

const rows=parseCsv(fs.readFileSync(path.resolve(root,input),'utf8').replace(/^\uFEFF/,''));
const header=rows.shift()?.map((x)=>x.trim().toLowerCase()) ?? [];
const required=gate.observation.gscRequiredColumns;
const ix=Object.fromEntries(required.map((k)=>[k,header.indexOf(k)]));
for(const [k,i] of Object.entries(ix)){
  if(i<0){ console.error(`Missing required GSC column: ${k}`); process.exit(2); }
}

const validDates=[];
const stats=new Map(gate.meta.releasedUrls.map((u)=>[u,{clicks:0,impressions:0,queries:new Set()}]));
for(const row of rows){
  const date=String(row[ix.date]??'').trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(date)) validDates.push(date);
  const page=normalizePage(row[ix.page]);
  const stat=stats.get(page);
  if(!stat) continue;
  const clicks=Number(row[ix.clicks]||0)||0;
  const impressions=Number(row[ix.impressions]||0)||0;
  const query=String(row[ix.query]??'').trim();
  stat.clicks+=clicks;
  stat.impressions+=impressions;
  if(query) stat.queries.add(query.toLowerCase());
}
const latestFinalizedDate=validDates.length ? validDates.sort().at(-1) : null;
const finalizedDaysAfterRelease=latestFinalizedDate ? dayDiff(prod.releaseDate,latestFinalizedDate) : null;
const minDays=gate.observation.minimumFinalizedDaysForRound2Review;
const reviewEligible=finalizedDaysAfterRelease!==null && finalizedDaysAfterRelease>=minDays;

const pageStats=[...stats.entries()].map(([url,v])=>({
  url,clicks:v.clicks,impressions:v.impressions,uniqueQueries:v.queries.size,
}));

let state='WAIT_FOR_FINALIZED_GSC';
if(reviewEligible) state='ROUND2_REVIEW_ELIGIBLE';

const report={
  round:'EXPANSION ROUND 1',
  generatedAt:new Date().toISOString(),
  state,
  releaseDate:prod.releaseDate,
  latestFinalizedDate,
  finalizedDaysAfterRelease,
  minimumFinalizedDaysForRound2Review:minDays,
  recommendedExtendedObservationDays:gate.observation.recommendedExtendedObservationDays,
  pageStats,
  newPagesWithImpressions:pageStats.filter((p)=>p.impressions>0).length,
  round2ReviewEligible:reviewEligible,
  round2AutomaticallyAllowed:false,
  round2State: reviewEligible ? 'MANUAL_REVIEW_ELIGIBLE' : 'LOCKED',
  note: reviewEligible
    ? 'Date gate passed. Review query ownership/cannibalization manually before any Round 2 release.'
    : 'Wait for the finalized GSC date gate. Do not substitute estimated or invented data.',
};

const out=path.resolve(root,output);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');

console.log('EXPANSION ROUND 1 — OBSERVATION GATE');
console.log(`Release date: ${prod.releaseDate}`);
console.log(`Latest finalized GSC date: ${latestFinalizedDate ?? 'NONE'}`);
console.log(`Finalized days after release: ${finalizedDaysAfterRelease ?? 'N/A'}`);
console.log(`New pages with impressions: ${report.newPagesWithImpressions}/4`);
console.log(`State: ${state}`);
console.log(`Round 2: ${report.round2State}`);
console.log(`Automatic Round 2: false`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(reviewEligible ? 'VERDICT: REVIEW_ELIGIBLE' : 'VERDICT: WAIT_FOR_MORE_DATA');
