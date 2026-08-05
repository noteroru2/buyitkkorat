import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audits = [
  "audit-seo.ts",
  "audit-content.ts",
  "audit-links.ts",
  "audit-claims.ts",
  "audit-images.ts",
  "audit-schema.ts",
  "audit-batch1-protection.ts",
  "audit-batch2-seo.ts",
];

let failed = 0;
for (const file of audits) {
  console.log(`\n>>> Running ${file}`);
  const result = spawnSync("npx", ["tsx", path.join("scripts", file)], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) failed += 1;
}

if (failed > 0) {
  console.error(`\naudit:all failed (${failed} suites)`);
  process.exit(1);
}
console.log("\naudit:all passed");
