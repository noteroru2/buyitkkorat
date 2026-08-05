import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const out = "docs/batch-4-trust-evidence-2026-08-05/screenshots";
fs.mkdirSync(out, { recursive: true });

const desktop = [
  { name: "home", path: "/" },
  { name: "home-trust", path: "/", scroll: 0.35 },
  { name: "about", path: "/เกี่ยวกับเรา" },
  { name: "contact", path: "/ติดต่อ" },
  { name: "service-hub", path: "/รับซื้อสินค้าไอที" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "macbook", path: "/รับซื้อ-macbook-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "camera", path: "/รับซื้อกล้อง-โคราช" },
  { name: "korat-hub", path: "/พื้นที่/เมืองนครราชสีมา" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
];

const mobile = [
  { name: "home", path: "/" },
  { name: "contact", path: "/ติดต่อ" },
  { name: "about", path: "/เกี่ยวกับเรา" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "macbook", path: "/รับซื้อ-macbook-โคราช" },
  { name: "korat-hub", path: "/พื้นที่/เมืองนครราชสีมา" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
];

const browser = await chromium.launch();

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const p of desktop) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    if (p.scroll) {
      await page.evaluate((r) => window.scrollTo(0, document.body.scrollHeight * r), p.scroll);
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: path.join(out, `desktop-${p.name}.png`), fullPage: false });
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const p of mobile) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: path.join(out, `mobile-${p.name}.png`), fullPage: false });
  }
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("winner_cookie_consent_v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(out, "mobile-cookie.png") });
  await page.goto(base + "/ติดต่อ", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.screenshot({ path: path.join(out, "mobile-valuation-checklist.png") });
  await context.close();
}

await browser.close();
console.log("screenshots saved", out);
