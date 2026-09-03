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
const input=arg('input');
const output=arg('output') ?? 'docs/architecture/expansion-round-1-gsc-observation.csv';
if(!input){
  console.error('Usage: node scripts/evaluate-expansion-round-1-gsc.mjs --input=path/to/query-page.csv');
  console.error('Required columns: query,page,clicks,impressions,position');
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
function esc(v){
  const s=String(v??'');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}

const pairs=[
  {id:'NOTEBOOK_VS_ASUS',parent:'/รับซื้อโน๊ตบุ๊ค-โคราช',child:'/รับซื้อโน๊ตบุ๊ค-asus-โคราช'},
  {id:'ASUS_VS_ROG',parent:'/รับซื้อโน๊ตบุ๊ค-asus-โคราช',child:'/รับซื้อโน๊ตบุ๊ค-asus-rog-โคราช'},
  {id:'NOTEBOOK_VS_DELL',parent:'/รับซื้อโน๊ตบุ๊ค-โคราช',child:'/รับซื้อโน๊ตบุ๊ค-dell-โคราช'},
  {id:'DELL_VS_LATITUDE',parent:'/รับซื้อโน๊ตบุ๊ค-dell-โคราช',child:'/รับซื้อโน๊ตบุ๊ค-dell-latitude-โคราช'},
];

const parsed=parseCsv(fs.readFileSync(path.resolve(root,input),'utf8').replace(/^\uFEFF/,''));
const header=parsed.shift()?.map((x)=>x.trim().toLowerCase()) ?? [];
const req=['query','page','clicks','impressions','position'];
const ix=Object.fromEntries(req.map((k)=>[k,header.indexOf(k)]));
for(const [k,i] of Object.entries(ix)){
  if(i<0){ console.error(`Missing required column: ${k}`); process.exit(2); }
}

const byPage=new Map();
for(const r of parsed){
  const query=String(r[ix.query]??'').trim().toLowerCase();
  const page=normalizePage(r[ix.page]);
  if(!query||!page) continue;
  const clicks=Number(r[ix.clicks]||0)||0;
  const impressions=Number(r[ix.impressions]||0)||0;
  const position=Number(r[ix.position]||0)||0;
  if(!byPage.has(page)) byPage.set(page,new Map());
  const m=byPage.get(page);
  const prev=m.get(query) ?? {clicks:0,impressions:0,posWeighted:0};
  prev.clicks+=clicks;
  prev.impressions+=impressions;
  prev.posWeighted+=position*impressions;
  m.set(query,prev);
}

const rows=[];
for(const pair of pairs){
  const p=byPage.get(pair.parent) ?? new Map();
  const c=byPage.get(pair.child) ?? new Map();
  const pq=new Set(p.keys()), cq=new Set(c.keys());
  const union=new Set([...pq,...cq]);
  const overlap=[...pq].filter((q)=>cq.has(q));
  const parentImp=[...p.values()].reduce((s,v)=>s+v.impressions,0);
  const childImp=[...c.values()].reduce((s,v)=>s+v.impressions,0);
  const parentClicks=[...p.values()].reduce((s,v)=>s+v.clicks,0);
  const childClicks=[...c.values()].reduce((s,v)=>s+v.clicks,0);
  const overlapImpParent=overlap.reduce((s,q)=>s+(p.get(q)?.impressions??0),0);
  const overlapImpChild=overlap.reduce((s,q)=>s+(c.get(q)?.impressions??0),0);
  const overlapTotal=overlapImpParent+overlapImpChild;
  const childOverlapShare=overlapTotal ? overlapImpChild/overlapTotal : 0;
  let state='NO_DATA';
  if(parentImp||childImp) state='OBSERVE';
  if(overlap.length>=3 && childOverlapShare>0.35 && childOverlapShare<0.65) state='REVIEW_QUERY_OWNERSHIP';
  rows.push({
    pair:pair.id,parent:pair.parent,child:pair.child,
    parentQueries:pq.size,childQueries:cq.size,overlapQueries:overlap.length,
    jaccard:union.size?(overlap.length/union.size).toFixed(4):'0.0000',
    parentClicks,parentImpressions:parentImp,childClicks,childImpressions:childImp,
    childOverlapImpressionShare:childOverlapShare.toFixed(4),
    state,
    action:state==='REVIEW_QUERY_OWNERSHIP'
      ? 'Review shared queries manually; do not merge/noindex automatically.'
      : 'Continue observation; no destructive SEO action.'
  });
}

const cols=Object.keys(rows[0]);
const csv=[cols.join(','),...rows.map((r)=>cols.map((c)=>esc(r[c])).join(','))].join('\n')+'\n';
const out=path.resolve(root,output);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,csv);
console.log(`Wrote ${rows.length} parent-child observation rows -> ${path.relative(root,out)}`);
console.log(`Pairs with data: ${rows.filter((r)=>r.state!=='NO_DATA').length}/4`);
console.log('No redirect, canonical switch, merge or noindex is executed.');
