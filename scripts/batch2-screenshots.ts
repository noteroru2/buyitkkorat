import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const out = "docs/batch-2-high-impact-seo-2026-08-05/screenshots";
fs.mkdirSync(out, { recursive: true });

const desktopPages = [
  { name: "home", path: "/" },
  { name: "service-hub", path: "/รับซื้อสินค้าไอที" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "korat-hub", path: "/พื้นที่/เมืองนครราชสีมา" },
  { name: "amphoe-dankhuntod", path: "/พื้นที่/ด่านขุนทด" },
  { name: "amphoe-buayai", path: "/พื้นที่/บัวใหญ่" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
  { name: "about", path: "/เกี่ยวกับเรา" },
  { name: "contact", path: "/ติดต่อ" },
];

const mobilePages = [
  { name: "home", path: "/" },
  { name: "service-hub", path: "/รับซื้อสินค้าไอที" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "korat-hub", path: "/พื้นที่/เมืองนครราชสีมา" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
];

const browser = await chromium.launch();

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const p of desktopPages) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: path.join(out, `desktop-${p.name}.png`), fullPage: false });
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const p of mobilePages) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: path.join(out, `mobile-${p.name}.png`), fullPage: false });
  }

  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("winner_cookie_consent_v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "mobile-cookie-preference.png") });

  // mobile menu open if present
  const menu = page.locator("button[aria-label*='เมนู'], button[aria-expanded], .nav-toggle, [data-menu-toggle]").first();
  if (await menu.count()) {
    await menu.click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, "mobile-menu.png") });
  }

  await page.goto(base + "/ติดต่อ", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "mobile-cta.png"), fullPage: true });
  await context.close();
}

await browser.close();
console.log("screenshots saved", out);
