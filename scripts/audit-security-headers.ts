/**
 * Verify required security headers in vercel.json and optionally against production.
 * Usage: npx tsx scripts/audit-security-headers.ts [--production]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prod = process.argv.includes("--production");
const required = [
  "X-Content-Type-Options",
  "Referrer-Policy",
  "X-Frame-Options",
  "Permissions-Policy",
];

let failed = 0;

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8")) as {
  headers?: { source: string; headers: { key: string; value: string }[] }[];
};
const configured = new Map<string, string>();
for (const block of vercel.headers ?? []) {
  for (const h of block.headers) configured.set(h.key, h.value);
}

console.log("=== audit:security-headers (vercel.json) ===");
for (const key of required) {
  if (!configured.has(key)) {
    console.log(`[critical] missing ${key}`);
    failed += 1;
  } else {
    console.log(`[ok] ${key}=${configured.get(key)}`);
  }
}
if (!configured.has("Content-Security-Policy") && !configured.has("Content-Security-Policy-Report-Only")) {
  console.log("[critical] missing CSP or CSP-Report-Only");
  failed += 1;
} else {
  console.log(`[ok] CSP mode=${configured.has("Content-Security-Policy") ? "enforced" : "report-only"}`);
}

if (prod) {
  const url = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/";
  const res = await fetch(url, { redirect: "follow" });
  console.log("\n=== production headers ===");
  console.log(`status=${res.status}`);
  for (const key of [...required, "Strict-Transport-Security", "Content-Security-Policy-Report-Only", "Content-Security-Policy"]) {
    const value = res.headers.get(key);
    if (!value && required.includes(key)) {
      console.log(`[critical] production missing ${key}`);
      failed += 1;
    } else {
      console.log(`[${value ? "ok" : "skip"}] ${key}=${value}`);
    }
  }
}

if (failed > 0) {
  console.error(`security-headers failed (${failed})`);
  process.exit(1);
}
console.log("security-headers passed");
