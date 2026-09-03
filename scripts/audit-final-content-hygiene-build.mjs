#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => process.argv.find((x) => x.startsWith(`--${name}=`))?.slice(name.length + 3) ?? null;
const distRel = arg('dist') ?? 'dist';
const dist = path.resolve(root, distRel);
const arch = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/config/seo-index-control.json'), 'utf8'));
const errors = [];
const rows = [];
if (!fs.existsSync(dist)) { console.error(`Build directory not found: ${distRel}`); process.exit(2); }

function fileForRoute(url) {
  if (url === '/') return path.join(dist, 'index.html');
  const seg = url.replace(/^\/+|\/+$/g, '').split('/');
  const file = path.join(dist, ...seg.slice(0, -1), `${seg.at(-1)}.html`);
  const dir = path.join(dist, ...seg, 'index.html');
  return fs.existsSync(file) ? file : dir;
}
function stripHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
const banned = [
  /\bintent\b/iu, /\bownership\b/iu, /canonical ownership|\bcanonical\b/iu,
  /doorway pages?|doorway pattern/iu, /cannibalization/iu, /internal links?/iu,
  /Product\s*×|Model\s*×\s*Condition|Condition\s*×\s*District|Brand\/Series\/Model\s*×|B2B\s*×\s*District/iu,
  /Hub\s*[→>-]+\s*Brand|Parent\s*[→>-]+\s*Series/iu,
  /รองรับคำค้น|เจ้าของคำค้น|owner ของคำค้น|แย่งคำค้น|ลักษณะการค้นหา|รองรับ\s+หัวข้อ|หน้าซ้ำตามอำเภอ/iu,
  /\bowner\b|หน้าซีรีส์\/หมวดแม่|แม่ของซีรีส์|แม่ของรุ่น|หมวดแม่|ทำไม .{0,80}มีหน้ารุ่นแยก|หน้าที่แบบนี้|จุดประสงค์ของหน้านี้|เป็นหน้ารับซื้อเฉพาะ|มุมประเมินเฉพาะของหน้านี้|สำหรับหน้าระดับรุ่น|จัดกลุ่มให้ถูกหน้า|ระดับรุ่นแยกจากหน้าหลัก|ทำไมต้องแยก|หน้านี้มีไว้ตอบคำถาม|สิ่งที่หน้านี้ไม่อ้าง|ขอบเขตของหน้านี้/iu,
  /ภาพหน้าปกเว็บไซต์|ใช้ภาพจริงสไตล์เดียวกันทั้งเว็บ|ภาพประกอบหมวดสินค้า|ภาพประกอบเนื้อหา|เหมาะกับหน้ารับซื้อ|ใช้กับหน้ารับซื้อ|เห็นปุ่ม LINE ชัดขึ้น/iu,
];

const indexable = arch.routes.filter((r) => r.kind === 'LIVE' && r.indexState === 'INDEX');
for (const node of indexable) {
  const file = fileForRoute(node.url);
  if (!fs.existsSync(file)) { errors.push(`Missing built HTML ${node.url}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const visible = stripHtml(html);
  const matched = banned.filter((rx) => { rx.lastIndex = 0; return rx.test(visible); }).map((rx) => String(rx));
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const missingAlt = imgs.filter((tag) => !/\balt=(?:"[^"]*"|'[^']*')/i.test(tag)).length;
  const rawRoute = /(?:^|\s)["']?\/[\p{L}\p{N}_-][^\s<>]*["']?(?:\s|$)/u.test(visible) && /["']\//u.test(visible);
  if (matched.length) errors.push(`Banned visible copy ${node.url}: ${matched.join(', ')}`);
  if (missingAlt) errors.push(`Images missing alt attribute ${missingAlt}: ${node.url}`);
  if (rawRoute) errors.push(`Raw quoted route visible: ${node.url}`);
  rows.push({ url: node.url, images: imgs.length, imagesMissingAlt: missingAlt, bannedMatches: matched.length, rawQuotedRoute: rawRoute });
}

const xmlFiles = fs.readdirSync(dist, { recursive: true }).filter((x) => typeof x === 'string' && /^sitemap.*\.xml$/i.test(path.basename(x)));
const paths = new Set();
function norm(v) { let s = String(v ?? ''); try { if (/^https?:/i.test(s)) s = new URL(s).pathname; } catch {} try { s = decodeURI(s); } catch {} if (!s.startsWith('/')) s = '/' + s; if (s.length > 1) s = s.replace(/\/+$/, ''); return s; }
for (const rel of xmlFiles) {
  const xml = fs.readFileSync(path.join(dist, rel), 'utf8');
  for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) if (!/\.xml(?:$|\?)/i.test(m[1])) paths.add(norm(m[1]));
}
if (paths.size !== 359) errors.push(`Sitemap URL count ${paths.size} != 359`);
if (paths.has('/รับซื้อ-canon-eos-r-โคราช')) errors.push('Canon EOS R risk URL leaked into sitemap');

const report = {
  generatedAt: new Date().toISOString(), dist: distRel,
  counts: { indexableExpected: 359, indexableChecked: rows.length, sitemapExpected: 359, sitemapObserved: paths.size },
  imagePolicy: 'OPTIONAL_RELEVANT_ALT_REQUIRED_WHEN_PRESENT', rows, errors,
  verdict: errors.length ? 'FAIL' : 'PASS',
};
const out = path.join(root, 'docs/architecture/final-content-hygiene-build-audit.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log('FINAL CONTENT HYGIENE & VISUAL PLACEMENT — BUILT SURFACE AUDIT');
console.log(`Indexable pages checked: ${rows.length}/359`);
console.log(`Sitemap URLs: ${paths.size}/359`);
console.log(`Banned rendered copy findings: ${rows.reduce((n,r)=>n+r.bannedMatches,0)}`);
console.log(`Images missing alt attribute: ${rows.reduce((n,r)=>n+r.imagesMissingAlt,0)}`);
console.log(`Errors: ${errors.length}`);
console.log(`Report: ${path.relative(root, out)}`);
console.log(`VERDICT: ${report.verdict}`);
if (errors.length) process.exitCode = 1;
