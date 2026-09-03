# Predeploy Windows Hotfix

## Symptom

Manual commands pass:

```text
npm run build
npm run audit:architecture-build
```

but:

```text
npm run predeploy:round1
```

reports:

```text
Build: BUILD_FAILED
Crawl: BUILD_NOT_ATTESTED
```

## Root cause

`predeploy-expansion-round-1.mjs` launched `npm` directly through `spawnSync()`.
On Windows, npm is normally a `.cmd` shim and must be launched through the Windows command processor.

## Fix

The predeploy runner now:

- uses `%ComSpec% /d /s /c npm ...` on Windows,
- keeps direct process execution on Linux/macOS,
- records `launchedAs`, signal, and process-launch error details,
- distinguishes `BUILD_LAUNCH_FAILED:*` from a real build failure.

No architecture, route, index, sitemap or content state is changed.

## Retest

```powershell
npm run predeploy:round1
```

Expected after the existing 99-page build/crawl state is healthy:

```text
State: PREDEPLOY_READY
Production release allowed: true
Static validators: PASS
Build: PASS
Crawl: PASS
Blockers: NONE
VERDICT: GO
```
