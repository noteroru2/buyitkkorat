#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dryRun = process.argv.includes('--dry-run');
const layoutArg = process.argv.find((x) => x.startsWith('--layout='));
const layoutRel = layoutArg ? layoutArg.slice('--layout='.length) : null;

const required = [
  'src/config/site-architecture.json',
  'src/config/core-hub-release.json',
  'src/config/internal-link-recovery.json',
  'src/config/navigation-architecture.json',
  'src/config/brand-model-series-foundation.json',
  'src/config/guide-authority-architecture.json',
  'src/components/architecture/ArchitectureHeader.astro',
  'src/components/architecture/ArchitectureFooter.astro',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`ERROR: missing prerequisite ${rel}`);
    console.error('Apply Architecture Batch 0–7 before Batch 8.');
    process.exit(1);
  }
}

const navigation = JSON.parse(fs.readFileSync(path.join(root, 'src/config/navigation-architecture.json'), 'utf8'));
const edits = [];
const warnings = [];

function editJson(rel, updater) {
  const file = path.join(root, rel);
  const before = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(before);
  updater(data);
  const after = JSON.stringify(data, null, 2) + '\n';
  if (after !== before) edits.push({file, rel, before, after});
}

editJson('src/config/site-architecture.json', (data) => {
  const live = data.routes.filter((n) => n.kind === 'LIVE');
  const indexable = live.filter((n) => n.indexState === 'INDEX');
  if (live.length !== 90 || indexable.length !== 89) {
    throw new Error(`Batch 8 baseline mismatch: live=${live.length}, indexable=${indexable.length}`);
  }
  data.meta.currentReleaseBatch = 'ARCHITECTURE BATCH 8 — Navigation / Header / Footer / Discovery Architecture';
  data.meta.currentRoutes = 90;
  data.meta.currentIndexable = 89;
  data.meta.currentNoindex = 1;
  data.meta.releasedNewRoutes = [];
  data.meta.releasePolicy =
    'Batch 8 exposes the released architecture through bounded global navigation. No candidate or virtual URL becomes live.';
});

editJson('src/config/core-hub-release.json', (data) => {
  data.meta.navigationArchitectureState = 'GLOBAL_NAV_CONFIG_BATCH_8';
  data.meta.navigationPolicy =
    'Header/Footer use bounded hub-first global discovery; contextual child/sibling discovery remains delegated to runtime architecture.';
});

editJson('src/config/internal-link-recovery.json', (data) => {
  data.meta.globalNavigationState = 'BATCH_8';
  data.meta.globalHeaderPrimaryLimit = navigation.meta.primaryItemLimit;
  data.meta.globalFooterColumnLimit = navigation.meta.footerColumnLimit;
  data.rules ??= [];
  const rule =
    'Global Header/Footer discover released Hub/Tier-A owners only; unreleased Brand/Series/Guide candidates never enter global navigation.';
  if (!data.rules.includes(rule)) data.rules.push(rule);
});

function addImport(text, line) {
  if (text.includes(line)) return text;
  const imports = [...text.matchAll(/^import .*;$/gm)];
  if (!imports.length) {
    const fence = text.indexOf('---');
    const second = text.indexOf('---', fence + 3);
    if (fence === 0 && second > 0) {
      return text.slice(0, second) + line + '\n' + text.slice(second);
    }
    throw new Error('Unable to locate Astro import block');
  }
  const last = imports.at(-1);
  const end = last.index + last[0].length;
  return text.slice(0, end) + '\n' + line + text.slice(end);
}

if (layoutRel) {
  const layoutFile = path.resolve(root, layoutRel);
  if (!layoutFile.startsWith(root + path.sep)) throw new Error('Layout path must be inside repository root');
  if (!fs.existsSync(layoutFile)) throw new Error(`Layout not found: ${layoutRel}`);

  const before = fs.readFileSync(layoutFile, 'utf8');
  let after = before;

  const alreadyManaged =
    after.includes('data-architecture-shell="header"') ||
    after.includes('<ArchitectureHeader');
  const hasUnmanagedHeader = /<header[\s>]/i.test(after) && !alreadyManaged;
  const hasUnmanagedFooter = /<footer[\s>]/i.test(after) &&
    !after.includes('data-architecture-shell="footer"') &&
    !after.includes('<ArchitectureFooter');

  if (hasUnmanagedHeader || hasUnmanagedFooter) {
    warnings.push(
      `REVIEW_REQUIRED: ${layoutRel} already contains an unmanaged ${[
        hasUnmanagedHeader ? 'header' : '',
        hasUnmanagedFooter ? 'footer' : '',
      ].filter(Boolean).join(' + ')}. Config was applied, but shell was NOT duplicated/replaced automatically.`
    );
  } else {
    after = addImport(after, "import ArchitectureHeader from '../components/architecture/ArchitectureHeader.astro';");
    after = addImport(after, "import ArchitectureFooter from '../components/architecture/ArchitectureFooter.astro';");

    if (!after.includes('<ArchitectureHeader')) {
      const bodyOpen = after.match(/<body(?:\s[^>]*)?>/i);
      if (!bodyOpen) throw new Error('Unable to locate <body> in selected layout');
      const at = bodyOpen.index + bodyOpen[0].length;
      after = after.slice(0, at) + '\n    <ArchitectureHeader />' + after.slice(at);
    }
    if (!after.includes('<ArchitectureFooter')) {
      const bodyClose = after.search(/<\/body>/i);
      if (bodyClose < 0) throw new Error('Unable to locate </body> in selected layout');
      after = after.slice(0, bodyClose) + '    <ArchitectureFooter />\n  ' + after.slice(bodyClose);
    }

    if (after !== before) edits.push({file:layoutFile, rel:layoutRel, before, after});
  }
} else {
  warnings.push(
    'SOURCE_INTEGRATION_PENDING: pass --layout=src/layouts/<shared-layout>.astro in the real repository. ' +
    'Batch 8 will not guess or duplicate an existing Header/Footer.'
  );
}

console.log('ARCHITECTURE BATCH 8 — GLOBAL NAVIGATION APPLY');
console.log(`Mode: ${dryRun ? 'DRY_RUN' : 'WRITE'}`);
console.log(`Header primary groups: ${navigation.header.primary.length}`);
console.log(`Footer columns: ${navigation.footer.columns.length}`);
console.log(`Files to change: ${edits.length}`);
console.log(`Layout integration: ${layoutRel ?? 'NOT_REQUESTED'}`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (!dryRun) {
  for (const edit of edits) fs.writeFileSync(edit.file, edit.after, 'utf8');
}

console.log(warnings.some((x)=>x.startsWith('REVIEW_REQUIRED'))
  ? 'VERDICT: PASS_WITH_REVIEW_REQUIRED'
  : 'VERDICT: PASS_WITH_SOURCE_INTEGRATION_WARNING');
