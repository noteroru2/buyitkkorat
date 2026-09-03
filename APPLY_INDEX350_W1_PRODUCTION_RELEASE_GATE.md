# APPLY — INDEX350 W1 Production Release Gate

1. Copy this package into the repository containing W1.
2. Run:

```powershell
npm run validate:architecture
npm run validate:index350:w1:prod
npm run build
npm run audit:architecture-build
npm run audit:index350:w1-build
```

3. Commit the exact release source.
4. Run strict predeploy:

```powershell
$sha = git rev-parse HEAD
node scripts/predeploy-index-350-w1.mjs --dist=dist --expected-sha=$sha
```

5. Push/deploy only on `VERDICT: GO`.
6. After production is Ready:

```powershell
node scripts/verify-index-350-w1-production.mjs --origin=https://รับซื้อไอทีโคราช.com --deployment-sha=$sha
```

W2 remains locked after verification.
