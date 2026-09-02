#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const release = JSON.parse(fs.readFileSync(path.join(root, 'src/config/core-hub-release.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const START = '<!-- ARCHITECTURE:BATCH1:START -->';
const END = '<!-- ARCHITECTURE:BATCH1:END -->';
const byUrl = new Map(registry.routes.map((node) => [node.url, node]));
const labels = release.labels ?? {};
const coreUrls = new Set(release.coreHubs.map((hub) => hub.url));
const appleUrls = new Set(release.appleBridge.members);

function label(url) {
  return labels[url] ?? url.replace(/^\//, '').replaceAll('-', ' ');
}

function childrenOf(url) {
  return registry.routes
    .filter((node) => node.kind === 'LIVE' && node.indexState === 'INDEX' && node.recommendedParent === url)
    .map((node) => node.url);
}

function siblingsOf(url, limit = 3) {
  const node = byUrl.get(url);
  const parent = node?.recommendedParent;
  if (!parent || parent.startsWith('virtual:') || !byUrl.has(parent)) return [];
  return childrenOf(parent).filter((candidate) => candidate !== url).slice(0, limit);
}

function isReleasedTreeNode(node) {
  if (!node || node.kind !== 'LIVE' || node.indexState !== 'INDEX') return false;
  if (!node.sourceHint?.startsWith('src/content/services/') || !node.sourceHint.endsWith('.md')) return false;
  if (appleUrls.has(node.url)) return true;

  let cursor = node;
  const seen = new Set();
  while (cursor?.recommendedParent) {
    if (seen.has(cursor.url)) return false;
    seen.add(cursor.url);
    if (coreUrls.has(cursor.url)) return true;
    const parent = cursor.recommendedParent;
    if (parent.startsWith('virtual:')) return false;
    cursor = byUrl.get(parent);
  }
  return coreUrls.has(node.url);
}

function linkList(urls) {
  return urls.map((url) => `- [${label(url)}](${url})`).join('\n');
}

function managedBlock(node) {
  const sections = [];
  const parent = node.recommendedParent && !node.recommendedParent.startsWith('virtual:') && byUrl.has(node.recommendedParent)
    ? node.recommendedParent
    : null;
  const children = childrenOf(node.url);

  if (appleUrls.has(node.url)) {
    const peers = release.appleBridge.members.filter((url) => url !== node.url).slice(0, 4);
    sections.push(`## อุปกรณ์ Apple ที่รับซื้อในโคราช\n\n${linkList(peers)}`);
    sections.push(`> หน้านี้อยู่ในกลุ่ม Apple โดยตรง ไม่ใช้หน้ารับซื้อโทรศัพท์มือถือเป็น parent หลักของเนื้อหา`);
  } else {
    if (parent) sections.push(`## บริการหลักของหมวดนี้\n\n- [${label(parent)}](${parent})`);
    if (children.length) sections.push(`## บริการในกลุ่มนี้\n\n${linkList(children)}`);

    const hub = release.coreHubs.find((item) => item.url === node.url);
    const related = hub?.peerLinks?.filter((url) => url !== node.url) ?? siblingsOf(node.url, 3);
    if (related.length) sections.push(`## บริการที่เกี่ยวข้อง\n\n${linkList(related.slice(0, 4))}`);
  }

  if (!sections.length) return '';
  return `${START}\n\n${sections.join('\n\n')}\n\n${END}`;
}

function replaceManagedBlock(text, block) {
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  let base = text;
  if (start !== -1 && end !== -1 && end >= start) {
    base = `${text.slice(0, start).trimEnd()}${text.slice(end + END.length)}`.trimEnd();
  }
  if (!block) return `${base.trimEnd()}\n`;
  return `${base.trimEnd()}\n\n${block}\n`;
}

const targets = registry.routes.filter(isReleasedTreeNode);
const missing = [];
const changed = [];
const unchanged = [];

for (const node of targets) {
  const file = path.join(root, node.sourceHint);
  if (!fs.existsSync(file)) {
    missing.push(`${node.url} -> ${node.sourceHint}`);
    continue;
  }
  const before = fs.readFileSync(file, 'utf8');
  const block = managedBlock(node);
  const after = replaceManagedBlock(before, block);
  if (after === before) {
    unchanged.push(node.url);
    continue;
  }
  changed.push(node.url);
  if (!dryRun) fs.writeFileSync(file, after, 'utf8');
}

console.log('ARCHITECTURE BATCH 1 — CORE HUB RUNTIME APPLY');
console.log(`Mode: ${dryRun ? 'DRY_RUN' : 'WRITE'}`);
console.log(`Managed targets: ${targets.length}`);
console.log(`Changed: ${changed.length}`);
console.log(`Unchanged: ${unchanged.length}`);
console.log(`Missing source files: ${missing.length}`);
if (missing.length) {
  for (const item of missing.slice(0, 20)) console.warn(`WARN: ${item}`);
  if (missing.length > 20) console.warn(`WARN: ... ${missing.length - 20} more`);
}
if (missing.length) {
  console.error('VERDICT: FAIL — source tree does not match the audited route registry');
  process.exitCode = 1;
} else {
  console.log('VERDICT: PASS');
}
