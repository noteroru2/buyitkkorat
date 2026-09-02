#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const foundation = JSON.parse(fs.readFileSync(path.join(root, 'src/config/brand-model-series-foundation.json'), 'utf8'));

function arg(name) {
  const hit = process.argv.find((x) => x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const input = arg('input');
const output = arg('output') ?? 'docs/architecture/expansion-readiness-output.csv';

if (!input) {
  console.error('Usage: node scripts/score-expansion-readiness.mjs --input=path/to/evidence.csv [--output=...]');
  console.error('Columns: candidate_id,gsc_impressions_90d,leads_180d,transactions_365d,identity_verified,content_ready,ownership_review_pass');
  process.exit(2);
}

function parseCsv(text) {
  const rows=[]; let row=[], field='', quoted=false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { field+='"'; i++; }
      else if (c === '"') quoted=false;
      else field+=c;
    } else {
      if (c === '"') quoted=true;
      else if (c === ',') { row.push(field); field=''; }
      else if (c === '\n') { row.push(field.replace(/\r$/,'')); rows.push(row); row=[]; field=''; }
      else field+=c;
    }
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/,'')); rows.push(row); }
  return rows.filter((r)=>r.some((x)=>x !== ''));
}
const rows=parseCsv(fs.readFileSync(path.resolve(root,input),'utf8').replace(/^\uFEFF/,''));
const header=rows.shift().map((x)=>x.trim().toLowerCase());
const req=['candidate_id','gsc_impressions_90d','leads_180d','transactions_365d','identity_verified','content_ready','ownership_review_pass'];
const ix=Object.fromEntries(req.map((k)=>[k,header.indexOf(k)]));
for (const [k,i] of Object.entries(ix)) if (i<0) { console.error(`Missing column: ${k}`); process.exit(2); }

const candidates=new Map(
  [...foundation.candidateBrands,...foundation.candidateSeries].map((c)=>[c.id,c])
);
const truthy=(v)=>['1','true','yes','pass','y'].includes(String(v??'').trim().toLowerCase());

const out=[];
for (const r of rows) {
  const id=(r[ix.candidate_id]??'').trim();
  const c=candidates.get(id);
  if (!c) continue;
  const imp=Number(r[ix.gsc_impressions_90d]||0)||0;
  const leads=Number(r[ix.leads_180d]||0)||0;
  const tx=Number(r[ix.transactions_365d]||0)||0;
  const identity=truthy(r[ix.identity_verified]);
  const content=truthy(r[ix.content_ready]);
  const ownership=truthy(r[ix.ownership_review_pass]);
  const demand = imp > 0 || leads > 0 || tx > 0;

  let readiness='HOLD';
  if (identity && demand) readiness='EVIDENCE_READY';
  if (identity && demand && content) readiness='CONTENT_READY';
  if (identity && demand && content && ownership) readiness='RELEASE_REVIEW';

  out.push({
    candidate_id:id,
    node_type:c.nodeType,
    candidate_url:c.candidateUrl,
    priority_band:c.priorityBand,
    gsc_impressions_90d:imp,
    leads_180d:leads,
    transactions_365d:tx,
    identity_verified:identity,
    content_ready:content,
    ownership_review_pass:ownership,
    readiness,
    automatic_publish:false
  });
}
const cols=['candidate_id','node_type','candidate_url','priority_band','gsc_impressions_90d','leads_180d','transactions_365d','identity_verified','content_ready','ownership_review_pass','readiness','automatic_publish'];
const esc=(v)=>/[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"','""')}"` : String(v);
const csv=[cols.join(','),...out.map((r)=>cols.map((c)=>esc(r[c])).join(','))].join('\n')+'\n';
const outPath=path.resolve(root,output);
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,csv);
console.log(`Wrote ${out.length} readiness rows -> ${path.relative(root,outPath)}`);
console.log('No route was created or published.');
