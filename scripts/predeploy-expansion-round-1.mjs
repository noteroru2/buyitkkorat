#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function arg(name) {
  const hit = process.argv.find((x) => x.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}
const dist = arg('dist') ?? 'dist';
const expectedSha = arg('expected-sha');
const output = arg('output') ?? 'docs/architecture/expansion-round-1-predeploy-report.json';

const gate = JSON.parse(fs.readFileSync(path.join(root,'src/config/expansion-round-1-production-gate.json'),'utf8'));

function run(command, args, options = {}) {
  const isWindowsCmd = process.platform === 'win32' && options.windowsShell === true;
  const executable = isWindowsCmd
    ? (process.env.ComSpec || 'cmd.exe')
    : command;
  const executableArgs = isWindowsCmd
    ? ['/d', '/s', '/c', [command, ...args].join(' ')]
    : args;

  const r = spawnSync(executable, executableArgs, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  });

  return {
    command: [command, ...args].join(' '),
    launchedAs: [executable, ...executableArgs].join(' '),
    exitCode: r.status,
    signal: r.signal ?? null,
    passed: r.status === 0 && !r.error,
    error: r.error ? {
      name: r.error.name,
      message: r.error.message,
      code: r.error.code ?? null,
      errno: r.error.errno ?? null,
      syscall: r.error.syscall ?? null,
      path: r.error.path ?? null,
    } : null,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
  };
}

function runNpm(args) {
  return run('npm', args, {windowsShell: true});
}

const results = [];
for (const script of [
  'scripts/validate-expansion-release-round-1.mjs',
  'scripts/run-architecture-quality-gate.mjs',
]) {
  results.push(run(process.execPath, [script]));
}

let git = {available:false, clean:null, head:null, expectedShaMatch:null};
const gitHead = run('git',['rev-parse','HEAD']);
if (gitHead.passed) {
  git.available = true;
  git.head = gitHead.stdout.trim();
  const status = run('git',['status','--porcelain']);
  git.clean = status.passed ? status.stdout.trim() === '' : null;
  git.expectedShaMatch = expectedSha ? git.head === expectedSha : null;
}

let build = {attempted:false, passed:false, reason:'PACKAGE_JSON_NOT_FOUND'};
let crawl = {attempted:false, passed:false, reason:'BUILD_NOT_ATTESTED'};
if (fs.existsSync(path.join(root,'package.json'))) {
  build.attempted = true;
  const r = runNpm(['run','build']);
  results.push(r);
  build.passed = r.passed;
  build.reason = r.passed
    ? 'PASS'
    : r.error
      ? `BUILD_LAUNCH_FAILED:${r.error.code ?? r.error.name}`
      : 'BUILD_FAILED';

  if (build.passed && fs.existsSync(path.join(root,dist))) {
    crawl.attempted = true;
    const c = run(process.execPath,['scripts/audit-production-build-architecture.mjs',`--dist=${dist}`]);
    results.push(c);
    crawl.passed = c.passed;
    crawl.reason = c.passed ? 'PASS' : 'CRAWL_FAILED';
  }
}

const validatorPass = results
  .filter((r)=>r.command.includes('validate-expansion-release-round-1') || r.command.includes('run-architecture-quality-gate'))
  .every((r)=>r.passed);

const sourceReady =
  validatorPass &&
  build.attempted && build.passed &&
  crawl.attempted && crawl.passed &&
  (!expectedSha || git.expectedShaMatch === true);

const report = {
  round:'EXPANSION ROUND 1',
  generatedAt:new Date().toISOString(),
  state: sourceReady ? 'PREDEPLOY_READY' : 'PREDEPLOY_PENDING',
  productionReleaseAllowed: sourceReady,
  expectedCounts:{
    live:gate.meta.expectedLiveRoutes,
    indexable:gate.meta.expectedIndexableRoutes,
    sitemap:gate.meta.expectedSitemapUrls,
  },
  git,
  build,
  crawl,
  validatorPass,
  expectedSha: expectedSha ?? null,
  results: results.map(({stdout,stderr,...rest})=>rest),
  blockers: [
    ...(!validatorPass ? ['STATIC_VALIDATION'] : []),
    ...(!build.attempted ? ['REAL_SOURCE_BUILD_NOT_RUN'] : build.passed ? [] : ['BUILD_FAILED']),
    ...(!crawl.attempted ? ['REAL_BUILD_CRAWL_NOT_RUN'] : crawl.passed ? [] : ['BUILD_CRAWL_FAILED']),
    ...(expectedSha && git.expectedShaMatch !== true ? ['EXPECTED_SHA_NOT_ATTESTED'] : []),
  ],
};

const out = path.resolve(root,output);
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');

console.log('EXPANSION ROUND 1 — PREDEPLOY GATE');
console.log(`State: ${report.state}`);
console.log(`Production release allowed: ${report.productionReleaseAllowed}`);
console.log(`Static validators: ${validatorPass ? 'PASS' : 'FAIL'}`);
console.log(`Build: ${build.reason}`);
console.log(`Crawl: ${crawl.reason}`);
console.log(`Git HEAD: ${git.head ?? 'UNATTESTED'}`);
console.log(`Blockers: ${report.blockers.length ? report.blockers.join(', ') : 'NONE'}`);
console.log(`Report: ${path.relative(root,out)}`);
console.log(sourceReady ? 'VERDICT: GO' : 'VERDICT: HOLD');
if (!sourceReady) process.exitCode = 3;
