#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dryRun = process.argv.includes('--dry-run');

const required = [
  'src/config/site-architecture.json',
  'src/config/core-hub-release.json',
  'src/config/internal-link-recovery.json',
  'src/config/runtime-architecture.ts',
  'src/config/brand-model-series-foundation.json',
  'src/config/guide-authority-architecture.json',
  'src/config/guide-authority-architecture.ts',
];
for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`ERROR: missing prerequisite ${rel}`);
    console.error('Apply Architecture Batch 0–6 before Batch 7.');
    process.exit(1);
  }
}

const guide = JSON.parse(fs.readFileSync(path.join(root, 'src/config/guide-authority-architecture.json'), 'utf8'));
const edits = [];

function editJson(rel, updater) {
  const file = path.join(root, rel);
  const before = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(before);
  updater(data);
  const after = JSON.stringify(data, null, 2) + '\n';
  if (after !== before) edits.push({ file, before, after, rel });
}

editJson('src/config/site-architecture.json', (data) => {
  const live = data.routes.filter((n) => n.kind === 'LIVE');
  const indexable = live.filter((n) => n.indexState === 'INDEX');
  if (live.length !== 90 || indexable.length !== 89) {
    throw new Error(`Batch 7 baseline mismatch: live=${live.length}, indexable=${indexable.length}`);
  }
  data.meta.currentReleaseBatch = 'ARCHITECTURE BATCH 7 — Guide / Informational Authority Architecture';
  data.meta.currentRoutes = 90;
  data.meta.currentIndexable = 89;
  data.meta.currentNoindex = 1;
  data.meta.releasedNewRoutes = [];
  data.meta.releasePolicy =
    'Batch 7 organizes existing live guides into virtual topical clusters and strengthens guide→commercial/guide→guide discovery without changing live URLs or indexation.';
});

editJson('src/config/core-hub-release.json', (data) => {
  data.meta.guideAuthorityState = 'RUNTIME_GUIDE_GRAPH_BATCH_7';
  data.meta.guideAuthorityPolicy =
    'The live /บทความ hub remains the URL parent; virtual topical guide clusters are non-linkable organizational nodes.';
});

editJson('src/config/internal-link-recovery.json', (data) => {
  data.meta.guideAuthorityState = 'BATCH_7_CURATED';
  data.meta.guideCommercialTargetLimit = guide.meta.maxCommercialTargetsPerGuide;
  data.meta.guideRelatedLimit = guide.meta.maxRelatedGuidesPerGuide;

  data.conversionBridges ??= {};
  for (const item of guide.guides) {
    data.conversionBridges[item.url] = [...item.commercialTargets];
  }

  data.rules ??= [];
  const rules = [
    'Guide conversion bridges are authoritative from guide-authority-architecture.json.',
    'Guide-to-guide links stay inside the same virtual topical cluster and are circularly rotated.',
    'Virtual guide-cluster identifiers are never emitted as href/canonical/breadcrumb URLs.'
  ];
  for (const rule of rules) if (!data.rules.includes(rule)) data.rules.push(rule);
});

const runtimeFile = path.join(root, 'src/config/runtime-architecture.ts');
const runtimeBefore = fs.readFileSync(runtimeFile, 'utf8');
let runtimeAfter = runtimeBefore;

const importLine =
  "import { getGuideAuthorityRelatedUrls } from './guide-authority-architecture';";
if (!runtimeAfter.includes(importLine)) {
  const lastImport = [...runtimeAfter.matchAll(/^import .*;$/gm)].at(-1);
  if (!lastImport) throw new Error('Unable to find runtime import block');
  const end = lastImport.index + lastImport[0].length;
  runtimeAfter = runtimeAfter.slice(0, end) + '\n' + importLine + runtimeAfter.slice(end);
}

if (!runtimeAfter.includes("'GUIDE_RELATED'")) {
  const candidates = [
    "| 'LOCAL_RELATED'\n    | 'CONVERSION';",
    "| 'APPLE_FAMILY'\n    | 'CONVERSION';",
  ];
  let replaced = false;
  for (const marker of candidates) {
    if (runtimeAfter.includes(marker)) {
      runtimeAfter = runtimeAfter.replace(
        marker,
        marker.replace("| 'CONVERSION';", "| 'GUIDE_RELATED'\n    | 'CONVERSION';"),
      );
      replaced = true;
      break;
    }
  }
  if (!replaced) throw new Error('Unable to extend RuntimeArchitectureLink reason union safely');
}

const guideMarker = "const guideRelated = getGuideAuthorityRelatedUrls(current);";
if (!runtimeAfter.includes(guideMarker)) {
  const conversionBlock = `  for (const target of conversionBridges[current] ?? []) {
    pushUnique(out, seen, target, 'CONVERSION', current);
    if (out.length >= limit) return out;
  }
`;
  if (!runtimeAfter.includes(conversionBlock)) {
    throw new Error('Expected Batch 3+ conversion bridge block not found in runtime-architecture.ts');
  }
  const guideBlock = `
  const guideRelated = getGuideAuthorityRelatedUrls(current);
  for (const target of guideRelated) {
    pushUnique(out, seen, target, 'GUIDE_RELATED', current);
    if (out.length >= limit) return out;
  }
`;
  runtimeAfter = runtimeAfter.replace(conversionBlock, conversionBlock + guideBlock);
}

if (runtimeAfter !== runtimeBefore) {
  edits.push({
    file: runtimeFile,
    before: runtimeBefore,
    after: runtimeAfter,
    rel: 'src/config/runtime-architecture.ts',
  });
}

console.log('ARCHITECTURE BATCH 7 — GUIDE AUTHORITY RUNTIME APPLY');
console.log(`Mode: ${dryRun ? 'DRY_RUN' : 'WRITE'}`);
console.log(`Existing live guides: ${guide.guides.length}`);
console.log(`Virtual guide clusters: ${guide.clusters.length}`);
console.log(`Files to change: ${edits.length}`);

if (!dryRun) {
  for (const edit of edits) fs.writeFileSync(edit.file, edit.after, 'utf8');
}

console.log('VERDICT: PASS');
