#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dryRun = process.argv.includes('--dry-run');
const explicitLayoutArg = process.argv.find((arg) => arg.startsWith('--layout='));
const explicitLayout = explicitLayoutArg ? explicitLayoutArg.slice('--layout='.length) : null;

const IMPORT_BREADCRUMB = "import ArchitectureBreadcrumbs from '../components/architecture/ArchitectureBreadcrumbs.astro';";
const IMPORT_RELATED = "import ArchitectureRelatedServices from '../components/architecture/ArchitectureRelatedServices.astro';";
const BREADCRUMB_MARKER = '<!-- ARCHITECTURE:BATCH2:BREADCRUMBS -->';
const RELATED_MARKER = '<!-- ARCHITECTURE:BATCH2:RELATED -->';
const B1_START = '<!-- ARCHITECTURE:BATCH1:START -->';
const B1_END = '<!-- ARCHITECTURE:BATCH1:END -->';

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, ext));
    else if (entry.isFile() && full.endsWith(ext)) out.push(full);
  }
  return out;
}

function normalizeRel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function findLayout() {
  if (explicitLayout) {
    const target = path.resolve(root, explicitLayout);
    if (!fs.existsSync(target)) throw new Error(`--layout file does not exist: ${explicitLayout}`);
    return target;
  }
  const layouts = walk(path.join(root, 'src/layouts'), '.astro');
  const candidates = layouts.filter((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const mains = text.match(/<main\b/gi)?.length ?? 0;
    const closes = text.match(/<\/main>/gi)?.length ?? 0;
    return mains === 1 && closes === 1 && /<slot\b/i.test(text);
  });
  if (candidates.length !== 1) {
    const detail = candidates.length ? candidates.map(normalizeRel).join(', ') : 'none';
    throw new Error(`Safe layout auto-detection requires exactly 1 layout with one <main> and <slot>; found ${candidates.length}: ${detail}. Re-run with --layout=src/layouts/<file>.astro`);
  }
  return candidates[0];
}

function injectImports(text, layoutFile) {
  if (text.includes(IMPORT_BREADCRUMB) && text.includes(IMPORT_RELATED)) return text;
  if (!text.startsWith('---')) throw new Error(`${normalizeRel(layoutFile)} has no Astro frontmatter opening delimiter`);
  const close = text.indexOf('\n---', 3);
  if (close === -1) throw new Error(`${normalizeRel(layoutFile)} has no Astro frontmatter closing delimiter`);
  const relFromLayout = path.relative(path.dirname(layoutFile), path.join(root, 'src/components/architecture')).split(path.sep).join('/');
  const prefix = relFromLayout.startsWith('.') ? relFromLayout : `./${relFromLayout}`;
  const imports = [
    text.includes('ArchitectureBreadcrumbs') ? null : `import ArchitectureBreadcrumbs from '${prefix}/ArchitectureBreadcrumbs.astro';`,
    text.includes('ArchitectureRelatedServices') ? null : `import ArchitectureRelatedServices from '${prefix}/ArchitectureRelatedServices.astro';`,
  ].filter(Boolean).join('\n');
  return `${text.slice(0, close)}\n${imports}${text.slice(close)}`;
}

function injectRuntime(text, layoutFile) {
  let out = injectImports(text, layoutFile);
  if (!out.includes(BREADCRUMB_MARKER)) {
    const open = out.match(/<main\b[^>]*>/i);
    if (!open || open.index == null) throw new Error(`Could not find one <main> opening tag in ${normalizeRel(layoutFile)}`);
    const pos = open.index + open[0].length;
    out = `${out.slice(0, pos)}\n    ${BREADCRUMB_MARKER}\n    <ArchitectureBreadcrumbs />${out.slice(pos)}`;
  }
  if (!out.includes(RELATED_MARKER)) {
    const closeIndex = out.search(/<\/main>/i);
    if (closeIndex === -1) throw new Error(`Could not find </main> in ${normalizeRel(layoutFile)}`);
    out = `${out.slice(0, closeIndex)}    ${RELATED_MARKER}\n    <ArchitectureRelatedServices />\n  ${out.slice(closeIndex)}`;
  }
  return out;
}

function removeBatch1Block(text) {
  let out = text;
  while (true) {
    const start = out.indexOf(B1_START);
    if (start === -1) break;
    const end = out.indexOf(B1_END, start);
    if (end === -1) throw new Error('Found incomplete Batch 1 managed block; aborting cleanup');
    const before = out.slice(0, start).trimEnd();
    const after = out.slice(end + B1_END.length).replace(/^\s+/, '');
    out = `${before}${before && after ? '\n\n' : ''}${after}`;
  }
  return out.endsWith('\n') ? out : `${out}\n`;
}

function assertNoForbiddenMutation(before, after, file) {
  // Batch 2 may only change one layout and remove Batch 1 managed markdown blocks.
  // Frontmatter in Markdown must remain byte-identical.
  if (!file.endsWith('.md')) return;
  const fm = (text) => {
    if (!text.startsWith('---')) return '';
    const end = text.indexOf('\n---', 3);
    return end === -1 ? '' : text.slice(0, end + 4);
  };
  if (fm(before) !== fm(after)) throw new Error(`Markdown frontmatter changed unexpectedly: ${normalizeRel(file)}`);
}

const required = [
  'src/config/site-architecture.json',
  'src/config/core-hub-release.json',
  'src/config/runtime-architecture.ts',
  'src/components/architecture/ArchitectureBreadcrumbs.astro',
  'src/components/architecture/ArchitectureRelatedServices.astro',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`ERROR: missing required file ${rel}`);
    console.error('Apply ARCHITECTURE BATCH 0 and BATCH 1 before BATCH 2.');
    process.exit(1);
  }
}

let layout;
try { layout = findLayout(); }
catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}

const edits = [];
const layoutBefore = fs.readFileSync(layout, 'utf8');
const layoutAfter = injectRuntime(layoutBefore, layout);
if (layoutBefore !== layoutAfter) edits.push({ file: layout, before: layoutBefore, after: layoutAfter, kind: 'LAYOUT_RUNTIME' });

let cleanedBlocks = 0;
for (const file of walk(path.join(root, 'src/content/services'), '.md')) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes(B1_START) && !before.includes(B1_END)) continue;
  const after = removeBatch1Block(before);
  assertNoForbiddenMutation(before, after, file);
  if (after !== before) {
    cleanedBlocks += 1;
    edits.push({ file, before, after, kind: 'BATCH1_CLEANUP' });
  }
}

console.log('ARCHITECTURE BATCH 2 — PARENT/CHILD RUNTIME APPLY');
console.log(`Mode: ${dryRun ? 'DRY_RUN' : 'WRITE'}`);
console.log(`Layout: ${normalizeRel(layout)}`);
console.log(`Layout change: ${layoutBefore === layoutAfter ? 'UNCHANGED' : 'READY'}`);
console.log(`Batch 1 managed blocks to retire: ${cleanedBlocks}`);
console.log(`Total files to change: ${edits.length}`);

if (!dryRun) {
  for (const edit of edits) fs.writeFileSync(edit.file, edit.after, 'utf8');
}
console.log('VERDICT: PASS');
