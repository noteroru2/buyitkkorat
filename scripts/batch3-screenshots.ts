import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const out = "docs/batch-3-content-authority-2026-08-05/screenshots";
fs.mkdirSync(out, { recursive: true });

const desktop = [
  { name: "home", path: "/" },
  { name: "service-hub", path: "/รับซื้อสินค้าไอที" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "macbook", path: "/รับซื้อ-macbook-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "camera", path: "/รับซื้อกล้อง-โคราช" },
  { name: "article-battery", path: "/บทความ/วิธีเช็กสุขภาพแบตเตอรี่ก่อนขายมือถือและโน้ตบุ๊ก" },
  { name: "article-cycle", path: "/บทความ/cycle-count-และ-activation-lock-ก่อนขาย-macbook" },
  { name: "article-quote", path: "/บทความ/ราคาประเมินจากรูปกับราคาหลังตรวจต่างกันอย่างไร" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
  { name: "korat-hub", path: "/พื้นที่/เมืองนครราชสีมา" },
  { name: "about", path: "/เกี่ยวกับเรา" },
  { name: "contact", path: "/ติดต่อ" },
];

const mobile = [
  { name: "home", path: "/" },
  { name: "service-hub", path: "/รับซื้อสินค้าไอที" },
  { name: "computer", path: "/รับซื้อคอมพิวเตอร์-โคราช" },
  { name: "notebook", path: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
  { name: "macbook", path: "/รับซื้อ-macbook-โคราช" },
  { name: "iphone", path: "/รับซื้อ-iphone-โคราช" },
  { name: "article-battery", path: "/บทความ/วิธีเช็กสุขภาพแบตเตอรี่ก่อนขายมือถือและโน้ตบุ๊ก" },
  { name: "article-shutter", path: "/บทความ/shutter-count-คืออะไรก่อนขายกล้องดิจิทัล" },
  { name: "article-quote", path: "/บทความ/ราคาประเมินจากรูปกับราคาหลังตรวจต่างกันอย่างไร" },
  { name: "faq", path: "/คำถามที่พบบ่อย" },
];

const browser = await chromium.launch();

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const p of desktop) {
    await page.goto(base + p.path, { waitUntil: "networkidle", timeout: 60000 });
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
  const menu = page.locator("button").filter({ hasText: /เมนู|Menu/i }).first();
  if (await menu.count()) {
    await menu.click().catch(() => undefined);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, "mobile-menu.png") });
  }
  await page.goto(base + "/รับซื้อ-iphone-โคราช", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.55));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, "mobile-cta-related.png") });
  await context.close();
}

await browser.close();
console.log("screenshots saved", out);
