#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const architecture = JSON.parse(
  fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8')
);
const control = JSON.parse(
  fs.readFileSync(path.join(root, 'src/config/seo-index-control.json'), 'utf8')
);

function arg(name) {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : null;
}

const output = arg('output') ?? control.sitemap.safeDefaultOutput;
const origin = arg('site') ?? control.canonical.absoluteOrigin;
const allowReplaceManaged = process.argv.includes('--replace-managed');

function normalizePath(input) {
  let pathname = String(input || '/');
  try {
    if (/^https?:\/\//i.test(pathname)) pathname = new URL(pathname).pathname;
  } catch {}
  pathname = pathname.split('?')[0].split('#')[0];
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/{2,}/g, '/');
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return pathname || '/';
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const profiles = new Map(control.routeProfiles.map((p) => [p.url, p]));
const eligible = architecture.routes
  .filter((node) => node.kind === 'LIVE' && node.indexState === 'INDEX')
  .filter((node) => profiles.get(node.url)?.sitemapEligible === true)
  .map((node) => normalizePath(node.canonicalOwner));

const unique = [...new Set(eligible)];
if (unique.length !== control.sitemap.expectedUrlCount) {
  console.error(`Expected ${control.sitemap.expectedUrlCount} sitemap URLs, got ${unique.length}`);
  process.exit(1);
}

unique.sort((a, b) => {
  if (a === '/') return -1;
  if (b === '/') return 1;
  return a.localeCompare(b, 'th');
});

const urls = unique.map((pathname) => new URL(pathname, origin).href);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- ARCHITECTURE_BATCH_9_GENERATED: source=site-architecture.json; no invented lastmod/changefreq/priority -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

const outPath = path.resolve(root, output);
if (!outPath.startsWith(root + path.sep)) {
  console.error('Output path must be inside repository root.');
  process.exit(1);
}
if (fs.existsSync(outPath)) {
  const existing = fs.readFileSync(outPath, 'utf8');
  const managed = existing.includes('ARCHITECTURE_BATCH_9_GENERATED');
  if (!managed || !allowReplaceManaged) {
    console.error(`Refusing to overwrite ${path.relative(root, outPath)}.`);
    console.error(managed
      ? 'Re-run with --replace-managed to replace the Batch 9 managed sitemap.'
      : 'Existing sitemap is unmanaged; review/merge instead of overwriting.');
    process.exit(3);
  }
}
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${urls.length} URLs -> ${path.relative(root, outPath)}`);
console.log(`Origin: ${new URL('/', origin).origin}`);
console.log('lastmod/changefreq/priority: OMITTED');
