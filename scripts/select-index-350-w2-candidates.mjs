#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
function arg(name){const hit=process.argv.find((x)=>x.startsWith(`--${name}=`));return hit?hit.slice(name.length+3):null;}
const reviewRel=arg('review') ?? 'docs/architecture/index350-w1-performance-review.json';
const pagesRel=arg('pages') ?? 'docs/architecture/index350-w1-observation-pages.csv';
const ownershipRel=arg('ownership') ?? 'docs/architecture/index350-w1-query-ownership.csv';
const outputRel=arg('output') ?? 'docs/architecture/index350-w2-candidate-selection.json';
const csvRel=arg('csv') ?? 'docs/architecture/index350-w2-candidate-selection.csv';

const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w1-performance-review-w2-selection.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const live=new Set(arch.routes.filter((r)=>r.kind==='LIVE').map((r)=>r.url));
const provisionalRank=new Map(cfg.provisionalSelection.map((c)=>[c.url,c.rank]));

function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}}
  if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}const rr=rows.filter((r)=>r.some((x)=>x!==''));if(!rr.length)return[];const h=rr.shift().map((x)=>x.trim());return rr.map((r)=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));
}
function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function bool(v){return /^(true|yes|1)$/i.test(String(v??''));}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}

const reviewPath=path.resolve(root,reviewRel);
const pagesPath=path.resolve(root,pagesRel);
const ownershipPath=path.resolve(root,ownershipRel);
const review=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):null;
const pages=fs.existsSync(pagesPath)?parseCsv(fs.readFileSync(pagesPath,'utf8')):[];
const ownership=fs.existsSync(ownershipPath)?parseCsv(fs.readFileSync(ownershipPath,'utf8')):[];
const pageByUrl=new Map(pages.map((r)=>[r.url,r]));
const ownershipByChild=new Map(ownership.map((r)=>[r.child,r]));
const riskStates=new Set(['OWNERSHIP_REVIEW','OWNERSHIP_REVIEW_REQUIRED','REVIEW_QUERY_OWNERSHIP']);
const remaining=plan.candidates.filter((c)=>c.releaseState!=='RELEASED_W1' && ['B_SERIES','C_MODEL'].includes(c.group));

function scoreCandidate(c){
  let score=0; const reasons=[]; let eligible=true;
  if(c.priority==='P1'){score+=cfg.scoreWeights.staticPriorityP1;reasons.push('P1');}
  if(live.has(c.parent)){score+=cfg.scoreWeights.parentAlreadyLive;reasons.push('PARENT_LIVE');}else{eligible=false;reasons.push('PARENT_NOT_LIVE');}
  if(c.nodeType==='SERIES'){score+=cfg.scoreWeights.seriesFit;}else if(c.nodeType==='MODEL'){score+=cfg.scoreWeights.modelFit;}
  if(provisionalRank.has(c.url)){score+=cfg.scoreWeights.provisionalPreference;reasons.push('PROVISIONAL_PREFERRED');}
  const parentPage=pageByUrl.get(c.parent);
  if(parentPage){
    const indexed=bool(parentPage.indexed);
    const visible=/^yes$/i.test(parentPage.visible)||num(parentPage.impressions)>0;
    if(indexed){score+=cfg.scoreWeights.parentIndexed;reasons.push('PARENT_INDEXED');}else{score+=cfg.scoreWeights.parentNotIndexedPenalty;eligible=false;reasons.push('PARENT_NOT_INDEXED');}
    if(visible){score+=cfg.scoreWeights.parentVisible;reasons.push('PARENT_VISIBLE');}
    const own=ownershipByChild.get(c.parent);
    const risk=own && riskStates.has(own.state);
    if(risk){score+=cfg.scoreWeights.parentOwnershipRiskPenalty;eligible=false;reasons.push('PARENT_OWNERSHIP_RISK');}
    else{score+=cfg.scoreWeights.parentNoOwnershipRisk;reasons.push('PARENT_OWNERSHIP_CLEAR');}
  } else {
    reasons.push('LEGACY_PARENT_NO_W1_METRIC');
  }
  return {...c,score,eligible,reasons,provisionalRank:provisionalRank.get(c.url)??9999};
}

const scored=remaining.map(scoreCandidate);
const reviewReady=review?.state==='W2_CANDIDATE_REVIEW_READY';
let selected=[];
if(reviewReady){
  for(const [nodeType,cap] of Object.entries(cfg.composition).filter(([k])=>k!=='total')){
    const pool=scored.filter((c)=>c.nodeType===nodeType && c.eligible).sort((a,b)=>b.score-a.score||a.provisionalRank-b.provisionalRank||a.url.localeCompare(b.url,'th'));
    selected.push(...pool.slice(0,cap));
  }
  selected=selected.sort((a,b)=>a.nodeType.localeCompare(b.nodeType)||b.score-a.score||a.provisionalRank-b.provisionalRank);
}
const selectedSet=new Set(selected.map((c)=>c.url));
const rows=scored.map((c)=>({
  url:c.url,group:c.group,nodeType:c.nodeType,parent:c.parent,cluster:c.cluster,score:c.score,eligible:c.eligible?'YES':'NO',decision:!reviewReady?'PROVISIONAL_ONLY':selectedSet.has(c.url)?'SELECT':'HOLD',reasons:c.reasons.join('|')
})).sort((a,b)=>a.decision.localeCompare(b.decision)||b.score-a.score||a.url.localeCompare(b.url,'th'));

const state=!reviewReady?'WAIT_FOR_REAL_W1_REVIEW':selected.length===cfg.composition.total?'W2_SELECTION_READY_FOR_MANUAL_APPROVAL':'W2_SELECTION_INCOMPLETE';
const report={
  title:'INDEX 350 — W2 Candidate Selection',generatedAt:new Date().toISOString(),state,
  sourceReviewState:review?.state??'MISSING',automaticRelease:false,w2Locked:true,
  compositionTarget:cfg.composition,selectedCount:selected.length,
  selected:selected.map((c,i)=>({rank:i+1,url:c.url,group:c.group,nodeType:c.nodeType,parent:c.parent,cluster:c.cluster,score:c.score,reasons:c.reasons})),
  reserve:scored.filter((c)=>c.eligible&&!selectedSet.has(c.url)).sort((a,b)=>b.score-a.score||a.provisionalRank-b.provisionalRank).slice(0,20).map((c)=>({url:c.url,nodeType:c.nodeType,parent:c.parent,score:c.score})),
  blocked:scored.filter((c)=>!c.eligible).map((c)=>({url:c.url,parent:c.parent,reasons:c.reasons})),
  note:reviewReady?'Selection is ready for manual approval only. No source page is generated by this command.':'Real W1 performance review is not ready; provisional list remains non-release.'
};
const out=path.resolve(root,outputRel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const cols=['url','group','nodeType','parent','cluster','score','eligible','decision','reasons'];
const csv=[cols.join(','),...rows.map((r)=>cols.map((c)=>csvEscape(r[c])).join(','))].join('\n')+'\n';
const csvOut=path.resolve(root,csvRel);fs.mkdirSync(path.dirname(csvOut),{recursive:true});fs.writeFileSync(csvOut,csv);
console.log('INDEX 350 — W2 CANDIDATE SELECTION');
console.log(`Source review: ${review?.state??'MISSING'}`);
console.log(`Eligible pool: ${scored.filter((c)=>c.eligible).length}/${scored.length}`);
console.log(`Selected: ${selected.length}/${cfg.composition.total}`);
console.log(`Series selected: ${selected.filter((c)=>c.nodeType==='SERIES').length}/${cfg.composition.SERIES}`);
console.log(`Model selected: ${selected.filter((c)=>c.nodeType==='MODEL').length}/${cfg.composition.MODEL}`);
console.log(`State: ${state}`);
console.log('Automatic release: false');
console.log(`Report: ${path.relative(root,out)}`);
console.log(state==='W2_SELECTION_READY_FOR_MANUAL_APPROVAL'?'VERDICT: SELECTION_READY':'VERDICT: HOLD');
