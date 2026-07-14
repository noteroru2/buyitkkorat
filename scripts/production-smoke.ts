import fs from "node:fs";

const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const paths = [
  "/",
  "/รับซื้อสินค้าไอที",
  "/รับซื้อ-iphone-โคราช",
  "/รับซื้อโน๊ตบุ๊ค-โคราช",
  "/รับซื้อคอมพิวเตอร์-โคราช",
  "/รับซื้อการ์ดจอ-โคราช",
  "/รับซื้อกล้อง-โคราช",
  "/รับซื้อสินค้าไอทียกล็อต",
  "/พื้นที่/เมืองนครราชสีมา",
  "/พื้นที่/ปากช่อง",
  "/เกี่ยวกับเรา",
  "/ติดต่อ",
  "/นโยบายความเป็นส่วนตัว",
  "/robots.txt",
  "/sitemap-index.xml",
  "/sitemap-0.xml",
  "/this-page-does-not-exist-404-qa",
];

function absEncode(path: string): string {
  if (path === "/") return `${BASE}/`;
  return (
    BASE +
    path
      .split("/")
      .map((s) => (s ? encodeURIComponent(s) : ""))
      .join("/")
  );
}

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].replace(/<[^>]+>/g, "").trim() : null;
}

type Result = Record<string, unknown>;
const results: Result[] = [];

for (const p of paths) {
  const url = absEncode(p);
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    const title = pick(text, /<title>([^<]+)<\/title>/i);
    const h1s = [...text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    const canonical =
      pick(text, /rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
      pick(text, /href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
    const robots = pick(text, /name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    results.push({
      path: p,
      requestUrl: url,
      status: res.status,
      finalUrl: res.url,
      title: title?.slice(0, 100) ?? null,
      h1: h1s.length,
      canonical,
      hasLine: text.includes("line.me/R/ti/p/@buyhub"),
      hasTel: text.includes("tel:+66955479408"),
      hasSchema: text.includes("application/ld+json"),
      robotsMeta: robots,
      snippet:
        p.endsWith(".txt") || p.endsWith(".xml")
          ? text.slice(0, 240).replace(/\s+/g, " ")
          : undefined,
    });
  } catch (e) {
    results.push({ path: p, status: "ERR", error: String(e) });
  }
}

for (const u of [
  "http://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/",
  "https://www.xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/",
]) {
  try {
    const res = await fetch(u, { redirect: "manual" });
    results.push({
      path: u,
      status: res.status,
      location: res.headers.get("location"),
      finalUrl: res.url,
    });
  } catch (e) {
    results.push({ path: u, status: "ERR", error: String(e) });
  }
}

fs.mkdirSync("docs/audits", { recursive: true });
fs.writeFileSync("docs/audits/production-smoke.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
