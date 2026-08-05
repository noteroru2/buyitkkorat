import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const out = "docs/batch-1-1-verified-business-data-2026-08-05/screenshots";
fs.mkdirSync(out, { recursive: true });

const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/เกี่ยวกับเรา" },
  { name: "contact", path: "/ติดต่อ" },
  { name: "cookie", path: "/นโยบายคุกกี้" },
  { name: "hub", path: "/รับซื้อสินค้าไอที" },
  { name: "area", path: "/พื้นที่/เมืองนครราชสีมา" },
];

const browser = await chromium.launch();
for (const viewport of [
  { w: 1440, h: 900, label: "1440" },
  { w: 390, h: 844, label: "390" },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.w, height: viewport.h },
  });
  const page = await context.newPage();
  for (const p of pages) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({
      path: path.join(out, `${p.name}-${viewport.label}.png`),
      fullPage: false,
    });
  }
  if (viewport.label === "390") {
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("winner_cookie_consent_v1"));
    await page.reload({ waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(out, "home-cookie-banner-390.png") });
    await page.goto(base + "/ติดต่อ", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(out, "contact-cta-390.png"), fullPage: true });
  }
  if (viewport.label === "1440") {
    await page.goto(base + "/ติดต่อ", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(out, "footer-facebook-maps-1440.png") });
  }
  await context.close();
}
await browser.close();
console.log("screenshots saved", out);
