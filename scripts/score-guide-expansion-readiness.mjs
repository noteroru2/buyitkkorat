#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const guide = JSON.parse(fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.json'), 'utf8'));

function arg(name) {
  const hit = process.argv.find((x) => x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const input = arg('input');
const output = arg('output') ?? 'docs/architecture/guide-expansion-readiness.csv';

if (!input) {
  console.error('Usage: node scripts/score-guide-expansion-readiness.mjs --input=path/to/evidence.csv');
  console.error('Columns: candidate_id,gsc_impressions_90d,gsc_clicks_90d,assisted_leads_180d,source_verified,content_ready,overlap_review_pass');
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
const header=rows.shift()?.map((x)=>x.trim().toLowerCase()) ?? [];
const req=['candidate_id','gsc_impressions_90d','gsc_clicks_90d','assisted_leads_180d','source_verified','content_ready','overlap_review_pass'];
const ix=Object.fromEntries(req.map((k)=>[k,header.indexOf(k)]));
for (const [k,i] of Object.entries(ix)) if (i<0) { console.error(`Missing column: ${k}`); process.exit(2); }

const candidates=new Map(guide.candidateGuides.map((c)=>[c.id,c]));
const truthy=(v)=>['1','true','yes','pass','y'].includes(String(v??'').trim().toLowerCase());
const out=[];

for (const r of rows) {
  const id=String(r[ix.candidate_id]??'').trim();
  const c=candidates.get(id);
  if (!c) continue;

  const impressions=Number(r[ix.gsc_impressions_90d]||0)||0;
  const clicks=Number(r[ix.gsc_clicks_90d]||0)||0;
  const leads=Number(r[ix.assisted_leads_180d]||0)||0;
  const sourceVerified=truthy(r[ix.source_verified]);
  const contentReady=truthy(r[ix.content_ready]);
  const overlapPass=truthy(r[ix.overlap_review_pass]);
  const demand=impressions>0 || clicks>0 || leads>0;

  let readiness='HOLD';
  if (demand && sourceVerified) readiness='EVIDENCE_READY';
  if (demand && sourceVerified && contentReady) readiness='CONTENT_READY';
  if (demand && sourceVerified && contentReady && overlapPass) readiness='RELEASE_REVIEW';

  out.push({
    candidate_id:id,
    cluster:c.cluster,
    candidate_url:c.candidateUrl,
    primary_commercial_owner:c.primaryCommercialOwner,
    priority_band:c.priorityBand,
    gsc_impressions_90d:impressions,
    gsc_clicks_90d:clicks,
    assisted_leads_180d:leads,
    source_verified:sourceVerified,
    content_ready:contentReady,
    overlap_review_pass:overlapPass,
    readiness,
    automatic_publish:false,
  });
}

const cols=['candidate_id','cluster','candidate_url','primary_commercial_owner','priority_band','gsc_impressions_90d','gsc_clicks_90d','assisted_leads_180d','source_verified','content_ready','overlap_review_pass','readiness','automatic_publish'];
const esc=(v)=>/[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"','""')}"` : String(v);
const csv=[cols.join(','),...out.map((r)=>cols.map((c)=>esc(r[c])).join(','))].join('\n')+'\n';
const outPath=path.resolve(root,output);
fs.mkdirSync(path.dirname(outPath),{recursive:true});
fs.writeFileSync(outPath,csv);
console.log(`Wrote ${out.length} guide readiness rows -> ${path.relative(root,outPath)}`);
console.log('No guide route was created or published.');
