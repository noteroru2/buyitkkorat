#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function arg(name){const h=process.argv.find((x)=>x.startsWith(`--${name}=`));return h?h.slice(name.length+3):null;}
const cfg=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-performance-review-w3-selection.json'),'utf8'));
const plan=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-expansion-plan.json'),'utf8'));
const arch=JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const w2Obs=JSON.parse(fs.readFileSync(path.join(root,'src/config/index-350-w2-observation-gate.json'),'utf8'));
const reviewRel=arg('review')??'docs/architecture/index350-w2-performance-review.json';
const pagesRel=arg('pages')??'docs/architecture/index350-w2-performance-review-pages.csv';
const ownershipRel=arg('ownership')??cfg.requiredInputs.queryOwnership;
const outputRel=arg('output')??'docs/architecture/index350-w3-candidate-selection.json';
const csvRel=arg('csv')??'docs/architecture/index350-w3-candidate-selection.csv';

function parseCsv(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else{if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}}if(field.length||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}const rr=rows.filter((r)=>r.some((x)=>x!==''));if(!rr.length)return[];const h=rr.shift().map((x)=>x.trim());return rr.map((r)=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])));}
function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
function bool(v){return /^(true|yes|1)$/i.test(String(v??''));}
function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}
const live=new Set(arch.routes.filter((r)=>r.kind==='LIVE').map((r)=>r.url));
const w2Observed=new Set(w2Obs.meta.observedUrls);
const provisionalRank=new Map(cfg.provisionalSelection.map((c)=>[c.url,c.rank]));
const staticRisk=new Set(cfg.staticOwnershipRiskUrls);
const reviewPath=path.resolve(root,reviewRel),pagesPath=path.resolve(root,pagesRel),ownershipPath=path.resolve(root,ownershipRel);
const review=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):null;
const pages=fs.existsSync(pagesPath)?parseCsv(fs.readFileSync(pagesPath,'utf8')):[];
const ownership=fs.existsSync(ownershipPath)?parseCsv(fs.readFileSync(ownershipPath,'utf8')):[];
const pageByUrl=new Map(pages.map((r)=>[r.url,r]));
const ownershipByChild=new Map(ownership.map((r)=>[r.child,r]));
const riskStates=new Set(['OWNERSHIP_REVIEW','OWNERSHIP_REVIEW_REQUIRED','REVIEW_QUERY_OWNERSHIP']);
const remaining=plan.candidates.filter((c)=>c.group==='C_MODEL'&&c.releaseState==='HOLD_PLANNED');

function scoreCandidate(c){
  let score=0,eligible=true;const reasons=[];
  if(c.priority==='P1'){score+=cfg.scoreWeights.staticPriorityP1;reasons.push('P1');}
  if(live.has(c.parent)){score+=cfg.scoreWeights.parentAlreadyLive;reasons.push('PARENT_LIVE');}else{score+=cfg.scoreWeights.parentNotLivePenalty;eligible=false;reasons.push('PARENT_NOT_LIVE');}
  score+=cfg.scoreWeights.modelFit;
  if(provisionalRank.has(c.url)){score+=cfg.scoreWeights.provisionalPreference;reasons.push('PROVISIONAL_PREFERRED');}
  if(staticRisk.has(c.url)){score+=cfg.scoreWeights.staticOwnershipRiskPenalty;eligible=false;reasons.push('STATIC_OWNERSHIP_RISK');}
  if(w2Observed.has(c.parent)){
    const p=pageByUrl.get(c.parent);
    if(!p){eligible=false;reasons.push('W2_PARENT_PERFORMANCE_MISSING');}
    else{
      if(bool(p.indexed)){score+=cfg.scoreWeights.parentIndexed;reasons.push('W2_PARENT_INDEXED');}else{score+=cfg.scoreWeights.parentNotIndexedPenalty;eligible=false;reasons.push('W2_PARENT_NOT_INDEXED');}
      const visible=/^yes$/i.test(p.visible)||num(p.impressions)>0;if(visible){score+=cfg.scoreWeights.parentVisible;reasons.push('W2_PARENT_VISIBLE');}
      if(p.performanceClass==='EARLY_SIGNAL'){score+=cfg.scoreWeights.parentEarlySignal;reasons.push('W2_PARENT_EARLY_SIGNAL');}
      const own=ownershipByChild.get(c.parent);const risk=own&&riskStates.has(own.state);
      if(risk){score+=cfg.scoreWeights.parentOwnershipRiskPenalty;eligible=false;reasons.push('W2_PARENT_OWNERSHIP_RISK');}else{score+=cfg.scoreWeights.parentNoOwnershipRisk;reasons.push('W2_PARENT_OWNERSHIP_CLEAR');}
    }
  }else reasons.push('LEGACY_OR_W1_PARENT_NO_W2_METRIC');
  return {...c,score,eligible,reasons,provisionalRank:provisionalRank.get(c.url)??9999};
}
const scored=remaining.map(scoreCandidate);
const reviewReady=review?.state==='W3_CANDIDATE_REVIEW_READY';
let selected=[];let minimaSatisfied=false;
if(reviewReady){
  const picked=new Set();minimaSatisfied=true;
  for(const [cluster,min] of Object.entries(cfg.clusterPolicy.minimums)){
    const pool=scored.filter((c)=>c.cluster===cluster&&c.eligible).sort((a,b)=>b.score-a.score||a.provisionalRank-b.provisionalRank||a.url.localeCompare(b.url,'th'));
    if(pool.length<min)minimaSatisfied=false;
    for(const c of pool.slice(0,min)){if(!picked.has(c.url)){picked.add(c.url);selected.push(c);}}
  }
  const fill=scored.filter((c)=>c.eligible&&!picked.has(c.url)).sort((a,b)=>b.score-a.score||a.provisionalRank-b.provisionalRank||a.url.localeCompare(b.url,'th'));
  for(const c of fill){if(selected.length>=cfg.composition.total)break;picked.add(c.url);selected.push(c);}
  selected=selected.sort((a,b)=>a.provisionalRank-b.provisionalRank||b.score-a.score||a.url.localeCompare(b.url,'th'));
}
const selectedSet=new Set(selected.map((c)=>c.url));
const clusterCounts={};for(const c of selected)clusterCounts[c.cluster]=(clusterCounts[c.cluster]??0)+1;
const rows=scored.map((c)=>({url:c.url,group:c.group,nodeType:c.nodeType,parent:c.parent,cluster:c.cluster,score:c.score,eligible:c.eligible?'YES':'NO',decision:!reviewReady?'PROVISIONAL_ONLY':selectedSet.has(c.url)?'SELECT':'HOLD',reasons:c.reasons.join('|')})).sort((a,b)=>a.decision.localeCompare(b.decision)||b.score-a.score||a.url.localeCompare(b.url,'th'));
const complete=reviewReady&&minimaSatisfied&&selected.length===cfg.composition.total;
const state=!reviewReady?'WAIT_FOR_REAL_W2_REVIEW':complete?'W3_SELECTION_READY_FOR_MANUAL_APPROVAL':'W3_SELECTION_INCOMPLETE';
const report={
  title:'INDEX 350 — W3 Candidate Selection',generatedAt:new Date().toISOString(),state,sourceReviewState:review?.state??'MISSING',automaticRelease:false,w3Locked:true,
  compositionTarget:cfg.composition,clusterMinimums:cfg.clusterPolicy.minimums,selectedCount:selected.length,clusterCounts,minimaSatisfied,
  selected:selected.map((c,i)=>({rank:i+1,url:c.url,parent:c.parent,cluster:c.cluster,score:c.score,reasons:c.reasons})),
  reserve:scored.filter((c)=>c.eligible&&!selectedSet.has(c.url)).sort((a,b)=>b.score-a.score||a.provisionalRank-b.provisionalRank).map((c)=>({url:c.url,parent:c.parent,cluster:c.cluster,score:c.score,reasons:c.reasons})),
  blocked:scored.filter((c)=>!c.eligible).map((c)=>({url:c.url,parent:c.parent,cluster:c.cluster,reasons:c.reasons})),
  note:complete?'Selection is ready for manual approval only. This command does not generate or publish source pages.':'W3 remains locked. Do not release until the selection is complete and manually approved.'
};
const out=path.resolve(root,outputRel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const cols=['url','group','nodeType','parent','cluster','score','eligible','decision','reasons'];const csv=[cols.join(','),...rows.map((r)=>cols.map((c)=>csvEscape(r[c])).join(','))].join('\n')+'\n';const csvOut=path.resolve(root,csvRel);fs.mkdirSync(path.dirname(csvOut),{recursive:true});fs.writeFileSync(csvOut,csv);
console.log('INDEX 350 — W3 CANDIDATE SELECTION');
console.log(`Source review: ${review?.state??'MISSING'}`);
console.log(`Candidate pool: ${scored.length}`);
console.log(`Eligible pool: ${scored.filter((c)=>c.eligible).length}/${scored.length}`);
console.log(`Selected: ${selected.length}/${cfg.composition.total}`);
console.log(`Cluster counts: ${Object.entries(clusterCounts).map(([k,v])=>`${k}=${v}`).join(', ')||'NONE'}`);
console.log(`Cluster minima satisfied: ${minimaSatisfied}`);
console.log(`State: ${state}`);
console.log('Automatic W3 release: false');
console.log(`Report: ${path.relative(root,out)}`);
console.log(complete?'VERDICT: SELECTION_READY':'VERDICT: HOLD');
