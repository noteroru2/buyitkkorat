#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'..');

function arg(name) {
  const hit = process.argv.find((x)=>x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length+3) : null;
}
const gate = JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-round-1-production-gate.json'),'utf8'));
const origin = (arg('origin') ?? gate.meta.productionOrigin).replace(/\/+$/,'');
const releasedAt = arg('released-at');
const deploymentId = arg('deployment-id');
const deploymentSha = arg('deployment-sha');
const output = arg('output') ?? 'docs/architecture/expansion-round-1-production-verification.json';

function normalizePath(input) {
  let s = String(input ?? '/');
  try { if (/^https?:\/\//i.test(s)) s = new URL(s).pathname; } catch {}
  try { s = decodeURI(s); } catch {}
  s = s.split('?')[0].split('#')[0];
  if (!s.startsWith('/')) s = `/${s}`;
  if (s.length > 1) s = s.replace(/\/+$/,'');
  return s || '/';
}
function absolute(pathname) { return new URL(pathname, origin).href; }
function canonicalFromHtml(html) {
  return html.match(/<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ?? null;
}
function robotsFromHtml(html) {
  return html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1] ?? null;
}
function hrefPaths(html) {
  const out=[];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    try {
      const u = new URL(m[1], origin);
      if (u.origin === new URL(origin).origin) out.push(normalizePath(u.pathname));
    } catch {}
  }
  return [...new Set(out)];
}
function breadcrumbCount(html) {
  let total=0;
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data=JSON.parse(m[1]);
      const stack=[data];
      while(stack.length){
        const item=stack.pop();
        if(Array.isArray(item)){ stack.push(...item); continue; }
        if(!item || typeof item!=='object') continue;
        if(item['@type']==='BreadcrumbList') total += 1;
        if(Array.isArray(item['@graph'])) stack.push(...item['@graph']);
      }
    } catch {}
  }
  return total;
}

async function fetchText(pathname) {
  const url=absolute(pathname);
  try {
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'ArchitectureRound1Verifier/1.0'}});
    return {
      url,
      status:response.status,
      ok:response.ok,
      finalUrl:response.url,
      text:await response.text(),
      error:null,
    };
  } catch (error) {
    return {url,status:null,ok:false,finalUrl:null,text:'',error:String(error)};
  }
}

const routeResults=[];
for (const pathname of gate.productionVerification.requiredRoutes) {
  const r=await fetchText(pathname);
  const canonical=canonicalFromHtml(r.text);
  const robots=robotsFromHtml(r.text);
  const breadcrumbLists=breadcrumbCount(r.text);
  const canonicalPath=canonical ? normalizePath(canonical) : null;
  const passed =
    r.status===200 &&
    canonicalPath===pathname &&
    /index\s*,?\s*follow/i.test(robots ?? '') &&
    breadcrumbLists <= gate.productionVerification.routeRequirements.breadcrumbListMax;
  routeResults.push({
    pathname,status:r.status,canonical,canonicalPath,robots,breadcrumbLists,error:r.error,passed
  });
}

const parentResults=[];
for (const check of gate.productionVerification.parentChildChecks) {
  const r=await fetchText(check.parent);
  const hrefs=hrefPaths(r.text);
  const missing=check.children.filter((child)=>!hrefs.includes(child));
  parentResults.push({
    parent:check.parent,
    status:r.status,
    expectedChildren:check.children,
    missingChildren:missing,
    passed:r.status===200 && missing.length===0,
    error:r.error,
  });
}

const sitemapPath=gate.productionVerification.sitemapRequirements.path;
const sitemapFetch=await fetchText(sitemapPath);
let sitemapLocs=[];
let sitemapSources=[sitemapPath];
if (/<sitemapindex\b/i.test(sitemapFetch.text)) {
  const childLocs=[...sitemapFetch.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m)=>m[1]);
  sitemapSources=childLocs;
  for (const child of childLocs) {
    try {
      const childUrl=new URL(child, origin);
      const response=await fetch(childUrl,{redirect:'follow',headers:{'user-agent':'ArchitectureRound1Verifier/1.0'}});
      const xml=await response.text();
      sitemapLocs.push(...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m)=>m[1]));
    } catch {}
  }
} else {
  sitemapLocs=[...sitemapFetch.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m)=>m[1]);
}
const sitemapPaths=sitemapLocs.map(normalizePath);
const missingReleased=gate.meta.releasedUrls.filter((u)=>!sitemapPaths.includes(u));
const sitemapResult={
  path:sitemapPath,
  status:sitemapFetch.status,
  sources:sitemapSources,
  urlCount:sitemapLocs.length,
  expectedCount:gate.meta.expectedSitemapUrls,
  missingReleasedUrls:missingReleased,
  passed:
    sitemapFetch.status===200 &&
    sitemapLocs.length===gate.meta.expectedSitemapUrls &&
    missingReleased.length===0,
  error:sitemapFetch.error,
};

const routePass=routeResults.every((r)=>r.passed);
const parentPass=parentResults.every((r)=>r.passed);
const productionVerified=routePass && parentPass && sitemapResult.passed;

const releaseDate = releasedAt
  ? releasedAt
  : productionVerified
    ? new Date().toISOString().slice(0,10)
    : null;

const report={
  round:'EXPANSION ROUND 1',
  verifiedAt:new Date().toISOString(),
  origin,
  state:productionVerified ? 'PRODUCTION_VERIFIED' : 'BLOCKED',
  productionVerified,
  releaseDate,
  deploymentId:deploymentId ?? null,
  deploymentSha:deploymentSha ?? null,
  routeResults,
  parentResults,
  sitemap:sitemapResult,
  blockers:[
    ...(!routePass ? ['RELEASED_ROUTE_VERIFICATION'] : []),
    ...(!parentPass ? ['PARENT_CHILD_DISCOVERY'] : []),
    ...(!sitemapResult.passed ? ['PRODUCTION_SITEMAP'] : []),
  ],
  round2State:'LOCKED',
};

const out=path.resolve(root,output);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');

console.log('EXPANSION ROUND 1 — PRODUCTION VERIFICATION');
console.log(`Origin: ${origin}`);
console.log(`Released routes passed: ${routeResults.filter((r)=>r.passed).length}/${routeResults.length}`);
console.log(`Parent-child checks passed: ${parentResults.filter((r)=>r.passed).length}/${parentResults.length}`);
console.log(`Sitemap: ${sitemapResult.urlCount}/${sitemapResult.expectedCount} — ${sitemapResult.passed ? 'PASS' : 'FAIL'}`);
console.log(`State: ${report.state}`);
console.log(`Release date: ${releaseDate ?? 'NOT_SET'}`);
console.log(`Round 2: LOCKED`);
console.log(`Blockers: ${report.blockers.length ? report.blockers.join(', ') : 'NONE'}`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(productionVerified ? 'VERDICT: PASS' : 'VERDICT: FAIL');
if(!productionVerified) process.exitCode=1;
