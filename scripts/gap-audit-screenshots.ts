import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const OUT = path.resolve("docs/full-website-gap-audit-2026-08-05/screenshots");
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  ["home", "/"],
  ["hub", "/รับซื้อสินค้าไอที"],
  ["iphone", "/รับซื้อ-iphone-โคราช"],
  ["area", "/พื้นที่/เมืองนครราชสีมา"],
  ["article", "/บทความ/เช็กราคาสินค้าไอทีก่อนขายต้องดูอะไรบ้าง"],
  ["contact", "/ติดต่อ"],
  ["about", "/เกี่ยวกับเรา"],
  ["404", "/this-page-does-not-exist-gap-audit"],
];

function enc(p: string) {
  if (p === "/") return `${BASE}/`;
  return BASE + p.split("/").map((s) => (s ? encodeURIComponent(s) : "")).join("/");
}

const browser = await chromium.launch({ headless: true });
for (const width of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 } });
  const page = await ctx.newPage();
  for (const [name, route] of pages) {
    await page.goto(enc(route), { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`) });
  }
  await ctx.close();
}
await browser.close();
console.log("screenshots saved", OUT);
