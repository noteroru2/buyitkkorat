#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function arg(name) {
  const hit = process.argv.find((x)=>x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const distRel = arg('dist') ?? 'dist';
const reportRel = arg('report') ?? 'docs/architecture/production-crawl-audit.json';
const dist = path.resolve(root, distRel);
const architecture = JSON.parse(fs.readFileSync(path.join(root,'src/config/site-architecture.json'),'utf8'));
const readiness = JSON.parse(fs.readFileSync(path.join(root,'src/config/architecture-expansion-readiness.json'),'utf8'));

if (!fs.existsSync(dist)) {
  console.error(`Build directory not found: ${distRel}`);
  console.error('Run the real repository build first, then rerun with --dist=<build-output>.');
  process.exit(2);
}

const live = architecture.routes.filter((n)=>n.kind==='LIVE');
const indexable = live.filter((n)=>n.indexState==='INDEX');
const governed = new Set(live.map((n)=>n.url));

function fileForRoute(url) {
  if (url === '/') return path.join(dist, 'index.html');
  const clean = url.replace(/^\/+/, '');
  const segments = clean.split('/');
  const fileFormat = path.join(dist, ...segments.slice(0, -1), `${segments.at(-1)}.html`);
  const directoryFormat = path.join(dist, ...segments, 'index.html');
  if (fs.existsSync(fileFormat)) return fileFormat;
  if (fs.existsSync(directoryFormat)) return directoryFormat;
  return fileFormat;
}

function count(pattern, text) {
  return [...text.matchAll(pattern)].length;
}
function decodeEntities(value) {
  return value
    .replaceAll('&amp;','&')
    .replaceAll('&quot;','"')
    .replaceAll('&#39;',"'")
    .replaceAll('&lt;','<')
    .replaceAll('&gt;','>');
}
function normalizeHref(value, currentUrl) {
  if (!value) return null;
  value = decodeEntities(value.trim());
  if (/^(mailto:|tel:|javascript:|data:|#)/i.test(value)) return null;
  try {
    const base = new URL(currentUrl, 'https://example.invalid');
    const u = new URL(value, base);
    if (u.origin !== 'https://example.invalid') return null;
    let p = decodeURI(u.pathname);
    if (p.length > 1) p = p.replace(/\/+$/,'');
    return p || '/';
  } catch {
    return null;
  }
}

const pages = new Map();
const errors = [];
const warnings = [];

for (const node of live) {
  const file = fileForRoute(node.url);
  if (!fs.existsSync(file)) {
    errors.push(`Missing built HTML: ${node.url} -> ${path.relative(root,file)}`);
    continue;
  }
  const html = fs.readFileSync(file,'utf8');
  const canonicals = [...html.matchAll(/<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m)=>m[1]);
  const robots = [...html.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/gi)].map((m)=>m[1]);
  const jsonld = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m)=>m[1]);
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m)=>normalizeHref(m[1],node.url)).filter(Boolean);
  const internalGoverned = [...new Set(hrefs.filter((u)=>governed.has(u)))];

  if (node.indexState === 'INDEX') {
    if (canonicals.length !== readiness.thresholds.maxDuplicateCanonicalPerPage) errors.push(`Canonical count ${canonicals.length}: ${node.url}`);
    if (robots.length !== readiness.thresholds.maxDuplicateRobotsPerPage) errors.push(`Robots count ${robots.length}: ${node.url}`);
    if (!robots.some((v)=>/index\s*,?\s*follow/i.test(v))) errors.push(`Missing index,follow: ${node.url}`);
  } else {
    if (!robots.some((v)=>/noindex/i.test(v))) errors.push(`Missing noindex: ${node.url}`);
  }

  let breadcrumbLists = 0;
  let websiteSchemas = 0;
  for (const raw of jsonld) {
    try {
      const data = JSON.parse(raw);
      const stack = [data];
      while (stack.length) {
        const item = stack.pop();
        if (Array.isArray(item)) { stack.push(...item); continue; }
        if (!item || typeof item !== 'object') continue;
        if (item['@type'] === 'BreadcrumbList') breadcrumbLists += 1;
        if (item['@type'] === 'WebSite') websiteSchemas += 1;
        if (Array.isArray(item['@graph'])) stack.push(...item['@graph']);
      }
    } catch {
      warnings.push(`Unparseable JSON-LD on ${node.url}`);
    }
  }
  if (node.url !== '/' && node.indexState === 'INDEX' && breadcrumbLists > readiness.thresholds.maxBreadcrumbListPerPage) {
    errors.push(`Duplicate BreadcrumbList (${breadcrumbLists}): ${node.url}`);
  }

  pages.set(node.url,{
    url:node.url,
    indexState:node.indexState,
    builtFile:path.relative(root,file),
    canonicalCount:canonicals.length,
    robotsCount:robots.length,
    breadcrumbListCount:breadcrumbLists,
    websiteSchemaCount:websiteSchemas,
    governedInternalLinks:internalGoverned,
  });
}

const totalWebSiteOwners = [...pages.values()].reduce((sum,p)=>sum+p.websiteSchemaCount,0);
if (totalWebSiteOwners > readiness.thresholds.maxWebSiteSchemaOwners) {
  errors.push(`WebSite schema owners ${totalWebSiteOwners} exceeds ${readiness.thresholds.maxWebSiteSchemaOwners}`);
}

// Graph depth from homepage using governed built links.
const depth = new Map([['/',0]]);
const queue=['/'];
while (queue.length) {
  const current=queue.shift();
  const currentDepth=depth.get(current);
  for (const target of pages.get(current)?.governedInternalLinks ?? []) {
    if (!depth.has(target)) {
      depth.set(target,currentDepth+1);
      queue.push(target);
    }
  }
}
const unreachable = indexable.filter((n)=>!depth.has(n.url)).map((n)=>n.url);
const tooDeep = [...depth.entries()].filter(([,d])=>d > readiness.thresholds.maxCrawlDepth);
if (unreachable.length > readiness.thresholds.maxUnexpectedOrphans) {
  errors.push(`Governed indexable pages unreachable from homepage: ${unreachable.length}`);
}
if (tooDeep.length) errors.push(`Pages deeper than ${readiness.thresholds.maxCrawlDepth}: ${tooDeep.length}`);

// Governed broken links are links to a known route whose built file is absent.
let brokenGovernedLinks = 0;
for (const page of pages.values()) {
  for (const target of page.governedInternalLinks) {
    if (!pages.has(target)) brokenGovernedLinks += 1;
  }
}
if (brokenGovernedLinks > readiness.thresholds.maxBrokenGovernedLinks) {
  errors.push(`Broken governed links: ${brokenGovernedLinks}`);
}

const report = {
  batch:'ARCHITECTURE BATCH 10',
  dist:distRel,
  counts:{
    expectedLive:live.length,
    builtLive:pages.size,
    indexable:indexable.length,
    unreachableIndexable:unreachable.length,
    brokenGovernedLinks,
    pagesBeyondMaxDepth:tooDeep.length,
    maxObservedDepth:Math.max(...depth.values(),0),
    webSiteSchemaOwners:totalWebSiteOwners,
  },
  unreachable,
  tooDeep:tooDeep.map(([url,d])=>({url,depth:d})),
  errors,
  warnings,
  pages:[...pages.values()].map((p)=>({...p,depth:depth.get(p.url) ?? null})),
  verdict: errors.length ? 'FAIL' : 'PASS',
};
const out=path.resolve(root,reportRel);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');

console.log('ARCHITECTURE BATCH 10 — BUILD / CRAWL AUDIT');
console.log(`Built governed pages: ${pages.size}/${live.length}`);
console.log(`Unreachable indexable: ${unreachable.length}`);
console.log(`Broken governed links: ${brokenGovernedLinks}`);
console.log(`Max observed crawl depth: ${report.counts.maxObservedDepth}`);
console.log(`Pages beyond depth policy: ${tooDeep.length}`);
console.log(`WebSite schema owners: ${totalWebSiteOwners}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(`VERDICT: ${report.verdict}`);
if (errors.length) process.exitCode=1;
