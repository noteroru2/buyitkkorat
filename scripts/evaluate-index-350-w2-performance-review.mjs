#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function arg(name){const h=process.argv.find((x)=>x.startsWith(`--${name}=`));return h?h.slice(name.length+3):null;}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-performance-review-w3-selection.json'),'utf8'));
const observationRel=arg('observation')??cfg.requiredInputs.observationReport;
const pagesRel=arg('pages')??cfg.requiredInputs.observationPages;
const ownershipRel=arg('ownership')??cfg.requiredInputs.queryOwnership;
const outputRel=arg('output')??'docs/architecture/index350-w2-performance-review.json';
const pageOutputRel=arg('page-output')??'docs/architecture/index350-w2-performance-review-pages.csv';

function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}}
  if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}const rr=rows.filter((r)=>r.some((x)=>x!==''));if(!rr.length)return[];const h=rr.shift().map((x)=>x.trim());return rr.map((r)=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));
}
function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function bool(v){return /^(true|yes|1)$/i.test(String(v??''));}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function writeJson(rel,data){const out=path.resolve(root,rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');return out;}

const observationPath=path.resolve(root,observationRel);
const pagesPath=path.resolve(root,pagesRel);
const ownershipPath=path.resolve(root,ownershipRel);
const missing=[!fs.existsSync(observationPath)?observationRel:null,!fs.existsSync(pagesPath)?pagesRel:null,!fs.existsSync(ownershipPath)?ownershipRel:null].filter(Boolean);
if(missing.length){
  const report={title:'INDEX 350 — W2 Performance Review',generatedAt:new Date().toISOString(),state:'WAIT_FOR_REAL_W2_OBSERVATION_DATA',realPerformanceReviewed:false,missingInputs:missing,w3:{candidateReviewReady:false,automaticRelease:false,locked:true},note:'No W2 performance metrics were invented. Run W2 Observation Gate with real finalized GSC/indexation data first.'};
  const out=writeJson(outputRel,report);
  console.log('INDEX 350 — W2 PERFORMANCE REVIEW');
  console.log('State: WAIT_FOR_REAL_W2_OBSERVATION_DATA');
  console.log(`Missing inputs: ${missing.join(', ')}`);
  console.log('W3 candidate review ready: false');
  console.log('W3 automatic release: false');
  console.log(`Report: ${path.relative(root,out)}`);
  console.log('VERDICT: WAIT_FOR_DATA');
  process.exit(0);
}

const observation=JSON.parse(fs.readFileSync(observationPath,'utf8'));
const pages=parseCsv(fs.readFileSync(pagesPath,'utf8'));
const ownership=parseCsv(fs.readFileSync(ownershipPath,'utf8'));
const riskStates=new Set(['OWNERSHIP_REVIEW','OWNERSHIP_REVIEW_REQUIRED','REVIEW_QUERY_OWNERSHIP']);
const ownershipByChild=new Map(ownership.map((r)=>[r.child,r]));
const reviewed=pages.map((r)=>{
  const indexed=bool(r.indexed);
  const visible=/^yes$/i.test(r.visible)||num(r.impressions)>0;
  const impressions=num(r.impressions),clicks=num(r.clicks);
  const avgPosition=r.avgPosition===''?null:num(r.avgPosition);
  const own=ownershipByChild.get(r.url);const ownershipRisk=own?riskStates.has(own.state):false;
  let score=0;if(indexed)score+=35;if(visible)score+=25;if(impressions>=20)score+=18;else if(impressions>=10)score+=14;else if(impressions>=5)score+=9;else if(impressions>0)score+=4;if(clicks>0)score+=10;
  if(avgPosition!==null){if(avgPosition<=10)score+=18;else if(avgPosition<=20)score+=12;else if(avgPosition<=40)score+=6;}if(ownershipRisk)score-=60;
  let performanceClass='INDEXED_NO_VISIBILITY';
  if(ownershipRisk)performanceClass='OWNERSHIP_RISK';else if(!indexed)performanceClass='NOT_INDEXED';else if(visible&&avgPosition!==null&&avgPosition<=20)performanceClass='EARLY_SIGNAL';else if(visible)performanceClass='VISIBLE';
  return {...r,indexed,visible,impressions,clicks,avgPosition,ownershipRisk,performanceScore:score,performanceClass};
});
const classes={};const typeSummary={SERIES:{pages:0,indexed:0,visible:0,earlySignal:0,ownershipRisk:0},MODEL:{pages:0,indexed:0,visible:0,earlySignal:0,ownershipRisk:0}};
for(const r of reviewed){classes[r.performanceClass]=(classes[r.performanceClass]??0)+1;const t=typeSummary[r.nodeType]??(typeSummary[r.nodeType]={pages:0,indexed:0,visible:0,earlySignal:0,ownershipRisk:0});t.pages++;if(r.indexed)t.indexed++;if(r.visible)t.visible++;if(r.performanceClass==='EARLY_SIGNAL')t.earlySignal++;if(r.ownershipRisk)t.ownershipRisk++;}
const avgScore=reviewed.length?reviewed.reduce((s,r)=>s+r.performanceScore,0)/reviewed.length:0;
const ready=observation.state==='ROUND3_REVIEW_ELIGIBLE';
const state=ready?'W3_CANDIDATE_REVIEW_READY':'W2_REVIEW_HOLD';
const report={
  title:'INDEX 350 — W2 Performance Review',generatedAt:new Date().toISOString(),sourceObservationState:observation.state,state,realPerformanceReviewed:true,
  releaseBasis:observation.releaseBasis??'MANUAL_APPROVAL_OVERRIDE',observationSummary:observation.counts??null,
  performance:{pageCount:reviewed.length,averageScore:Number(avgScore.toFixed(2)),classes,typeSummary},
  w3:{candidateReviewReady:ready,automaticRelease:false,locked:true},
  hardRules:['No invented metrics','No automatic W3 release','No destructive SEO action from this review','Historical manual-approval disclosure must remain intact']
};
const out=writeJson(outputRel,report);
const cols=['url','nodeType','clicks','impressions','uniqueQueries','avgPosition','visible','indexed','indexStatus','ownershipRisk','performanceScore','performanceClass'];
const csv=[cols.join(','),...reviewed.map((r)=>cols.map((c)=>csvEscape(r[c])).join(','))].join('\n')+'\n';
const pageOut=path.resolve(root,pageOutputRel);fs.mkdirSync(path.dirname(pageOut),{recursive:true});fs.writeFileSync(pageOut,csv);
console.log('INDEX 350 — W2 PERFORMANCE REVIEW');
console.log(`Source observation: ${observation.state}`);
console.log(`Pages reviewed: ${reviewed.length}`);
console.log(`Series/Model: ${typeSummary.SERIES.pages}/${typeSummary.MODEL.pages}`);
console.log(`Average score: ${report.performance.averageScore}`);
console.log(`Classes: ${Object.entries(classes).map(([k,v])=>`${k}=${v}`).join(', ')}`);
console.log(`State: ${state}`);
console.log(`W3 candidate review ready: ${ready}`);
console.log('W3 automatic release: false');
console.log(`Report: ${path.relative(root,out)}`);
console.log(ready?'VERDICT: REVIEW_READY':'VERDICT: HOLD');
