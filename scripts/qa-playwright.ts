import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, type ChildProcess } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotDir = path.join(root, "docs/audits/screenshots");
fs.mkdirSync(shotDir, { recursive: true });
const PORT = 4321;
const BASE = `http://127.0.0.1:${PORT}`;

const pages: [string, string][] = [
  ["home", "/"],
  ["hub", "/รับซื้อสินค้าไอที"],
  ["iphone", "/รับซื้อ-iphone-โคราช"],
  ["notebook", "/รับซื้อโน๊ตบุ๊ค-โคราช"],
  ["computer", "/รับซื้อคอมพิวเตอร์-โคราช"],
  ["gpu", "/รับซื้อการ์ดจอ-โคราช"],
  ["camera", "/รับซื้อกล้อง-โคราช"],
  ["bulk", "/รับซื้อสินค้าไอทียกล็อต"],
  ["area-city", "/พื้นที่/เมืองนครราชสีมา"],
  ["area-pakchong", "/พื้นที่/ปากช่อง"],
  ["article", "/บทความ/เช็กราคาสินค้าไอทีก่อนขายต้องดูอะไรบ้าง"],
  ["contact", "/ติดต่อ"],
  ["notfound", "/this-page-does-not-exist-404-test"],
];

function startPreview(): ChildProcess {
  return spawn("npx", ["astro", "preview", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: root,
    shell: true,
    stdio: "ignore",
  });
}

async function waitForServer(timeoutMs = 20000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok || res.status === 404) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("Preview server did not start");
}

const preview = startPreview();
const issues: string[] = [];

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  for (const [label, width, height] of [
    ["mobile-390", 390, 844],
    ["desktop-1440", 1440, 900],
  ] as const) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    for (const [name, route] of pages) {
      const url = `${BASE}${route.split("/").map(encodeURIComponent).join("/").replace(/%2F/g, "/")}`;
      // safer encoding: encode each segment
      const encoded =
        BASE +
        route
          .split("/")
          .map((seg) => (seg ? encodeURIComponent(seg) : ""))
          .join("/");
      const res = await page.goto(encoded, { waitUntil: "domcontentloaded" });
      if (!res) {
        issues.push(`${label}/${name}: navigation failed`);
        continue;
      }
      const h1 = await page.locator("h1").count();
      if (name !== "notfound" && h1 !== 1) issues.push(`${label}/${name}: h1 count=${h1}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      );
      if (overflow) issues.push(`${label}/${name}: horizontal overflow @${width}`);
      const line = await page.locator('a[href*="line.me"]').first().getAttribute("href");
      if (line && !line.includes("buyhub")) issues.push(`${label}/${name}: LINE href ${line}`);
      const tel = await page.locator('a[href^="tel:"]').first().getAttribute("href");
      if (tel && tel !== "tel:+66955479408") issues.push(`${label}/${name}: tel ${tel}`);
      if (width === 390) {
        await page.screenshot({ path: path.join(shotDir, `${name}-390.png`) });
      }
      if (width === 1440 && name === "home") {
        await page.screenshot({ path: path.join(shotDir, `home-1440.png`) });
      }
    }
    await context.close();
  }
  await browser.close();
} catch (error) {
  issues.push(String(error));
} finally {
  preview.kill("SIGTERM");
}

if (issues.length) {
  console.error("QA issues:\n" + issues.join("\n"));
  process.exit(1);
}
console.log(`Playwright QA passed. Screenshots: ${shotDir}`);
