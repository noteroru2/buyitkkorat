#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arch = JSON.parse(fs.readFileSync(path.join(root, 'src/config/site-architecture.json'), 'utf8'));
const seo = JSON.parse(fs.readFileSync(path.join(root, 'src/config/seo-index-control.json'), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(root, 'src/config/index-350-expansion-plan.json'), 'utf8'));
const errors = [];
const findings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function splitFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  if (!text.startsWith('---')) return { frontmatter: '', body: text };
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  return match ? { frontmatter: match[1], body: match[2] } : { frontmatter: '', body: text };
}

const bannedBodyPatterns = [
  ['seo-intent', /\bintent\b/iu],
  ['seo-ownership-en', /\bownership\b/iu],
  ['canonical', /canonical ownership|\bcanonical\b/iu],
  ['doorway', /doorway pages?|doorway pattern/iu],
  ['cannibalization', /cannibalization/iu],
  ['internal-links', /internal links?/iu],
  ['cartesian-location', /Product\s*×|Model\s*×\s*Condition|Condition\s*×\s*District|Brand\/Series\/Model\s*×|B2B\s*×\s*District/iu],
  ['architecture-ladder', /Hub\s*[→>-]+\s*Brand|Parent\s*[→>-]+\s*Series/iu],
  ['search-editorial', /รองรับคำค้น|เจ้าของคำค้น|owner ของคำค้น|แย่งคำค้น|ลักษณะการค้นหา|รองรับ\s+หัวข้อ|หน้าซ้ำตามอำเภอ/iu],
  ['page-architecture-labels', /\bowner\b|หน้าซีรีส์\/หมวดแม่|แม่ของซีรีส์|แม่ของรุ่น|\[หมวดแม่\]|ทำไม .{0,80}มีหน้ารุ่นแยก|หน้าที่แบบนี้|จุดประสงค์ของหน้านี้|เป็นหน้ารับซื้อเฉพาะ|มุมประเมินเฉพาะของหน้านี้|สำหรับหน้าระดับรุ่น|จัดกลุ่มให้ถูกหน้า|ระดับรุ่นแยกจากหน้าหลัก|ทำไมต้องแยก|หน้านี้มีไว้ตอบคำถาม|สิ่งที่หน้านี้ไม่อ้าง|ขอบเขตของหน้านี้/iu],
];

const bannedVisiblePhrases = [
  'ภาพหน้าปกเว็บไซต์',
  'ใช้ภาพจริงสไตล์เดียวกันทั้งเว็บ',
  'ภาพประกอบหมวดสินค้า',
  'ภาพประกอบเนื้อหา',
  'เหมาะกับหน้ารับซื้อ',
  'ใช้กับหน้ารับซื้อ',
  'เห็นปุ่ม LINE ชัดขึ้น',
];

const contentFiles = walk(path.join(root, 'src/content')).filter((f) => f.endsWith('.md'));
let bodyCharactersMin = Infinity;
let rawRouteLines = 0;
let emptyHeadings = 0;
for (const file of contentFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  bodyCharactersMin = Math.min(bodyCharactersMin, body.replace(/\s+/g, '').length);
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [type, regex] of bannedBodyPatterns) {
      regex.lastIndex = 0;
      if (regex.test(line)) findings.push({ file: rel, line: i + 1, type, text: line.trim() });
    }
    const trimmed = line.trim();
    if (/^[-*+]\s*["']?\/[\p{L}\p{N}_-][^\s]*["']?$/u.test(trimmed) || /^["']?\/[\p{L}\p{N}_-][^\s]*["']?$/u.test(trimmed)) {
      rawRouteLines++;
      findings.push({ file: rel, line: i + 1, type: 'raw-route-visible', text: trimmed });
    }
    if (/^#{2,3}\s+\S/.test(trimmed)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j >= lines.length || /^#{1,3}\s+\S/.test(lines[j].trim())) {
        emptyHeadings++;
        findings.push({ file: rel, line: i + 1, type: 'empty-heading', text: trimmed });
      }
    }
  }
  for (const phrase of bannedVisiblePhrases) {
    if (body.includes(phrase)) findings.push({ file: rel, type: 'editorial-copy', text: phrase });
    const displayMetadata = frontmatter.split(/\r?\n/).filter((l) => /^\s*(title|description|h1|excerpt):/.test(l)).join('\n');
    if (displayMetadata.includes(phrase)) findings.push({ file: rel, type: 'editorial-metadata', text: phrase });
  }
  const displayMetadata = frontmatter.split(/\r?\n/).filter((l) => /^\s*(title|description|h1|excerpt):/.test(l)).join('\n');
  if (/ownership|canonical ownership|doorway|cannibalization|Product\s*×|Model\s*×\s*Condition|B2B\s*×|รองรับคำค้น|ลักษณะการค้นหา|\bowner\b|หน้าซีรีส์\/หมวดแม่|แม่ของซีรีส์|แม่ของรุ่น|หมวดแม่/iu.test(displayMetadata)) {
    findings.push({ file: rel, type: 'editorial-metadata', text: displayMetadata });
  }
}

const visibleSourceFiles = [
  ...walk(path.join(root, 'src/pages')),
  ...walk(path.join(root, 'src/layouts')),
  ...walk(path.join(root, 'src/components')),
  path.join(root, 'src/data/pageVisuals.ts'),
].filter((f) => fs.existsSync(f) && /\.(astro|ts)$/i.test(f));
for (const file of visibleSourceFiles) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file).replaceAll('\\', '/');
  for (const phrase of bannedVisiblePhrases) if (raw.includes(phrase)) findings.push({ file: rel, type: 'editorial-ui-copy', text: phrase });
  if (/canonical ownership|doorway pages?|cannibalization|Product\s*×\s*District|Hub\s*[→>-]+\s*Brand/iu.test(raw)) findings.push({ file: rel, type: 'seo-internal-ui-copy', text: 'SEO-internal phrase present in user-facing source' });
}

const placementChecks = [
  ['src/layouts/ServicePageLayout.astro', /PageCoverSection/iu, false, 'Service generic cover must not render above content'],
  ['src/layouts/AreaPageLayout.astro', /PageCoverSection/iu, false, 'Area generic cover must not repeat on every local page'],
  ['src/layouts/TrustPageLayout.astro', /PageCoverSection|ImageCTASection/iu, false, 'Trust/legal pages must not use generic product imagery'],
  ['src/pages/index.astro', /PageCoverSection/iu, false, 'Homepage standalone generic cover must be removed'],
  ['src/pages/พื้นที่/index.astro', /PageCoverSection/iu, false, 'Area directory editorial cover must be removed'],
  ['src/pages/บทความ/index.astro', /PageCoverSection/iu, false, 'Article directory filler cover must be removed'],
  ['src/layouts/ArticleLayout.astro', /article-visual-section/iu, true, 'Articles should keep a compact relevant image slot'],
];
for (const [rel, regex, expected, message] of placementChecks) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf8');
  const has = regex.test(raw);
  if (has !== expected) errors.push(`${message}: ${rel}`);
}

const pageVisuals = fs.readFileSync(path.join(root, 'src/data/pageVisuals.ts'), 'utf8');
if (/caption\s*:/u.test(pageVisuals)) errors.push('pageVisuals.ts still contains implementation/editorial captions');

for (let wave = 1; wave <= 6; wave++) {
  const prodPath = path.join(root, `src/config/index-350-w${wave}-production-gate.json`);
  const releasePath = path.join(root, `src/config/index-350-w${wave}-release.json`);
  const prod = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
  const rel = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  if (prod.routeRequirements.minimumImages !== 0) errors.push(`W${wave} production image minimum must be 0`);
  if (prod.routeRequirements.imageAltRequired !== true) errors.push(`W${wave} must require alt validation when images exist`);
  if (rel.qualityGate.minimumImagesExpectedAfterBuild !== 0) errors.push(`W${wave} release image minimum must be 0`);
}

const live = arch.routes.filter((r) => r.kind === 'LIVE');
const indexable = live.filter((r) => r.indexState === 'INDEX');
const hold = plan.candidates.filter((c) => c.releaseState === 'HOLD_PLANNED');
if (live.length !== 360 || indexable.length !== 359 || live.length - indexable.length !== 1) errors.push(`Architecture counts drift: ${live.length}/${indexable.length}/${live.length - indexable.length}`);
if (seo.sitemap.expectedUrlCount !== 359) errors.push(`Sitemap count drift: ${seo.sitemap.expectedUrlCount}`);
if (hold.length !== 1 || hold[0]?.url !== '/รับซื้อ-canon-eos-r-โคราช') errors.push(`Canon HOLD drift: ${hold.map((x) => x.url).join(', ')}`);
const riskNode = arch.routes.find((r) => r.url === '/รับซื้อ-canon-eos-r-โคราช');
if (riskNode?.kind === 'LIVE' || seo.routeProfiles.find((r) => r.url === '/รับซื้อ-canon-eos-r-โคราช')?.sitemapEligible === true) errors.push('Canon EOS R risk URL leaked live/sitemap');

if (findings.length) errors.push(`Content hygiene findings: ${findings.length}`);
const report = {
  generatedAt: new Date().toISOString(),
  baseline: { live: live.length, indexable: indexable.length, noindex: live.length - indexable.length, sitemap: seo.sitemap.expectedUrlCount, remainingHold: hold.length },
  contentFilesChecked: contentFiles.length,
  minimumBodyCharactersWithoutWhitespace: Number.isFinite(bodyCharactersMin) ? bodyCharactersMin : 0,
  rawVisibleRouteLines: rawRouteLines,
  emptyHeadings,
  imagePolicy: 'OPTIONAL_RELEVANT_ALT_REQUIRED_WHEN_PRESENT',
  visualPlacement: { homepageGenericCover: false, serviceGenericCover: false, areaGenericCover: false, trustLegalGenericImagery: false, articleCompactVisual: true },
  findings,
  errors,
  verdict: errors.length ? 'FAIL' : 'PASS',
};
const out = path.join(root, 'docs/architecture/final-content-hygiene-report.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');

console.log('FINAL CONTENT HYGIENE & VISUAL PLACEMENT — STATIC VALIDATION');
console.log(`Live/indexable/noindex: ${live.length}/${indexable.length}/${live.length-indexable.length}`);
console.log(`Sitemap: ${seo.sitemap.expectedUrlCount}`);
console.log(`Content files checked: ${contentFiles.length}`);
console.log(`SEO/editorial findings: ${findings.length}`);
console.log(`Raw visible route lines: ${rawRouteLines}`);
console.log(`Empty H2/H3: ${emptyHeadings}`);
console.log('Generic covers: homepage=REMOVED, service=REMOVED, area=REMOVED, trust/legal=REMOVED');
console.log('Article visual: COMPACT_RELEVANT_ONLY');
console.log('Image minimum/page: 0 (optional; alt validation retained when present)');
console.log(`Canon EOS R: ${hold.length === 1 ? 'HOLD' : 'DRIFT'}`);
console.log(`Report: ${path.relative(root, out)}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error('VERDICT: FAIL');
  process.exitCode = 1;
} else console.log('VERDICT: PASS');
