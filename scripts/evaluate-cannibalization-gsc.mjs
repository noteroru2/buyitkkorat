#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const triage = JSON.parse(fs.readFileSync(path.join(root, 'src/config/cannibalization-triage.json'), 'utf8'));

function arg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((x) => x.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}
const input = arg('input');
const output = arg('output') ?? 'docs/architecture/gsc-cannibalization-evidence.csv';
if (!input) {
  console.error('Usage: node scripts/evaluate-cannibalization-gsc.mjs --input=path/to/query-page.csv [--output=...]');
  console.error('Required columns: query,page,clicks,impressions,position');
  process.exit(2);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else {
      if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}
function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;
}
function normalizePage(value) {
  let s = String(value ?? '').trim();
  try { if (/^https?:\/\//i.test(s)) s = new URL(s).pathname; } catch {}
  try { s = decodeURI(s); } catch {}
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.split('?')[0].split('#')[0].replace(/\/{2,}/g, '/');
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s;
}

const parsed = parseCsv(fs.readFileSync(path.resolve(root, input), 'utf8').replace(/^\uFEFF/, ''));
const header = parsed.shift()?.map((x) => x.trim().toLowerCase()) ?? [];
const ix = Object.fromEntries(['query','page','clicks','impressions','position'].map((k) => [k, header.indexOf(k)]));
for (const [k, i] of Object.entries(ix)) {
  if (i < 0) { console.error(`Missing required CSV column: ${k}`); process.exit(2); }
}

const data = new Map();
for (const r of parsed) {
  const query = (r[ix.query] ?? '').trim().toLowerCase();
  const page = normalizePage(r[ix.page]);
  if (!query || !page) continue;
  const clicks = Number(r[ix.clicks] || 0) || 0;
  const impressions = Number(r[ix.impressions] || 0) || 0;
  const position = Number(r[ix.position] || 0) || 0;
  const key = `${page}\u0000${query}`;
  const prev = data.get(key) ?? {clicks:0, impressions:0, posWeighted:0};
  prev.clicks += clicks;
  prev.impressions += impressions;
  prev.posWeighted += position * impressions;
  data.set(key, prev);
}

function pageQueries(page) {
  const out = new Map();
  for (const [key, v] of data) {
    const [p,q] = key.split('\u0000');
    if (p === page && v.impressions > 0) out.set(q, v);
  }
  return out;
}

const evidence = [];
for (const group of triage.groups) {
  if (!group.gscRequired) continue;
  for (let i = 0; i < group.urls.length; i++) {
    for (let j = i+1; j < group.urls.length; j++) {
      const a = group.urls[i], b = group.urls[j];
      const qa = pageQueries(a), qb = pageQueries(b);
      const setA = new Set(qa.keys()), setB = new Set(qb.keys());
      const union = new Set([...setA, ...setB]);
      const overlap = [...setA].filter((q) => setB.has(q));
      const jaccard = union.size ? overlap.length / union.size : 0;
      let sharedImpA = 0, sharedImpB = 0;
      for (const q of overlap) {
        sharedImpA += qa.get(q)?.impressions ?? 0;
        sharedImpB += qb.get(q)?.impressions ?? 0;
      }
      const sharedTotal = sharedImpA + sharedImpB;
      const ownerShareA = sharedTotal ? sharedImpA / sharedTotal : 0;
      const ownerShareB = sharedTotal ? sharedImpB / sharedTotal : 0;
      evidence.push({
        group: group.id,
        decision: group.decision,
        pageA: a,
        pageB: b,
        queriesA: setA.size,
        queriesB: setB.size,
        overlapQueries: overlap.length,
        jaccard: jaccard.toFixed(4),
        sharedImpressionsA: sharedImpA.toFixed(0),
        sharedImpressionsB: sharedImpB.toFixed(0),
        sharedOwnershipA: ownerShareA.toFixed(4),
        sharedOwnershipB: ownerShareB.toFixed(4),
        review: overlap.length === 0 ? 'INSUFFICIENT_OR_NO_OVERLAP' : 'MANUAL_REVIEW'
      });
    }
  }
}

const cols = ['group','decision','pageA','pageB','queriesA','queriesB','overlapQueries','jaccard','sharedImpressionsA','sharedImpressionsB','sharedOwnershipA','sharedOwnershipB','review'];
const csv = [cols.join(','), ...evidence.map((r) => cols.map((c) => csvEscape(r[c])).join(','))].join('\n') + '\n';
const outPath = path.resolve(root, output);
fs.mkdirSync(path.dirname(outPath), {recursive:true});
fs.writeFileSync(outPath, csv);
console.log(`Wrote ${evidence.length} pair evidence rows -> ${path.relative(root, outPath)}`);
console.log('NOTE: This evaluator never changes URL, canonical, robots, sitemap, redirect or index state.');
