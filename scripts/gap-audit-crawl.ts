/**
 * Full production crawl for gap audit — read-only evidence collection.
 * Writes JSON to docs/full-website-gap-audit-2026-08-05/crawl-data/
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const OUT = path.resolve("docs/full-website-gap-audit-2026-08-05/crawl-data");
fs.mkdirSync(OUT, { recursive: true });

function enc(p: string): string {
  if (p === "/") return `${BASE}/`;
  return (
    BASE +
    p
      .split("/")
      .map((s) => (s ? encodeURIComponent(s) : ""))
      .join("/")
  );
}

function decodePath(u: string): string {
  try {
    const url = new URL(u);
    return decodeURIComponent(url.pathname.replace(/\/$/, "") || "/");
  } catch {
    return u;
  }
}

function countWords(text: string): number {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let n = 0;
  for (const { isWordLike } of segmenter.segment(text)) if (isWordLike) n++;
  return n;
}

async function fetchText(url: string, redirect: RequestRedirect = "follow") {
  const res = await fetch(url, { redirect, headers: { "user-agent": "WinnerIT-GapAudit/2026-08-05" } });
  const text = await res.text();
  return { res, text };
}

// 1) Headers
const headerChecks: Record<string, unknown>[] = [];
for (const u of [
  `${BASE}/`,
  `http://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/`,
  `https://www.xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/`,
]) {
  const res = await fetch(u, { redirect: "manual" });
  headerChecks.push({
    url: u,
    status: res.status,
    location: res.headers.get("location"),
    headers: {
      "strict-transport-security": res.headers.get("strict-transport-security"),
      "content-security-policy": res.headers.get("content-security-policy"),
      "x-frame-options": res.headers.get("x-frame-options"),
      "x-content-type-options": res.headers.get("x-content-type-options"),
      "referrer-policy": res.headers.get("referrer-policy"),
      "permissions-policy": res.headers.get("permissions-policy"),
      "x-robots-tag": res.headers.get("x-robots-tag"),
      "cache-control": res.headers.get("cache-control"),
      server: res.headers.get("server"),
    },
  });
}

// 2) robots + sitemaps
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
const smIndex = await (await fetch(`${BASE}/sitemap-index.xml`)).text();
const sm0 = await (await fetch(`${BASE}/sitemap-0.xml`)).text();
const sitemapUrls = [...sm0.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

// 3) Seed from sitemap + known core
const seedPaths = new Set<string>(["/", "/404", "/บทความ"]);
for (const loc of sitemapUrls) seedPaths.add(decodePath(loc));

type PageRow = Record<string, unknown>;
const pages: PageRow[] = [];
const inbound = new Map<string, number>();
const outboundBroken: { from: string; to: string; status?: number }[] = [];

for (const p of [...seedPaths].sort()) {
  inbound.set(p, inbound.get(p) ?? 0);
}

for (const p of [...seedPaths].sort()) {
  const url = enc(p === "/404" ? "/this-page-does-not-exist-gap-audit" : p);
  try {
    const { res, text } = await fetchText(url);
    const $ = cheerio.load(text);
    const title = $("title").first().text().trim();
    const desc = $('meta[name="description"]').attr("content") ?? "";
    const robotsMeta = $('meta[name="robots"]').attr("content") ?? "";
    const canonical = $('link[rel="canonical"]').attr("href") ?? "";
    const h1 = $("h1")
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get();
    const mainText = $(".main-content").text() || $("main").text() || $("body").text();
    const wordCount = countWords(mainText.replace(/\s+/g, " "));
    const jsonLd = $('script[type="application/ld+json"]')
      .map((_, el) => {
        try {
          return JSON.parse($(el).html() || "");
        } catch {
          return { parseError: true };
        }
      })
      .get();
    const schemaTypes = JSON.stringify(jsonLd).match(/"@type"\s*:\s*"([^"]+)"/g)?.map((s) => s.replace(/.*"([^"]+)"/, "$1")) ?? [];
    const imgs = $("img")
      .map((_, el) => ({
        src: $(el).attr("src"),
        alt: $(el).attr("alt"),
        w: $(el).attr("width"),
        h: $(el).attr("height"),
      }))
      .get();
    const links = $("a[href]")
      .map((_, el) => $(el).attr("href") || "")
      .get()
      .filter(Boolean);
    const internal = links
      .filter((h) => h.startsWith("/") || h.includes("xn--42cmb2cn7ce1fa0bs7aw2n0a2f") || h.includes("รับซื้อไอทีโคราช"))
      .map((h) => {
        if (h.startsWith("http")) return decodePath(h);
        return decodeURIComponent(h.split("#")[0].split("?")[0].replace(/\/$/, "") || "/");
      });
    for (const t of internal) {
      inbound.set(t, (inbound.get(t) ?? 0) + 1);
    }
    const hasLine = text.includes("line.me/R/ti/p/@buyhub") || text.includes("@buyhub");
    const hasTel = text.includes("tel:+66955479408");
    const hasFB = /facebook\.com|fb\.me/i.test(text);
    const hasGA = /gtag|googletagmanager|google-analytics|G-[A-Z0-9]+|GTM-/i.test(text);
    const hasMaps = /maps\.google|google\.com\/maps/i.test(text);
    const og = {
      title: $('meta[property="og:title"]').attr("content"),
      desc: $('meta[property="og:description"]').attr("content"),
      image: $('meta[property="og:image"]').attr("content"),
      url: $('meta[property="og:url"]').attr("content"),
    };
    pages.push({
      path: p,
      requestUrl: url,
      status: res.status,
      finalUrl: res.url,
      title,
      description: desc,
      robotsMeta,
      canonical,
      h1Count: h1.length,
      h1,
      wordCount,
      schemaTypes: [...new Set(schemaTypes)],
      inSitemap: sitemapUrls.some((u) => decodePath(u) === (p === "/" ? "/" : p)),
      hasLine,
      hasTel,
      hasFB,
      hasGA,
      hasMaps,
      og,
      imgCount: imgs.length,
      missingAlt: imgs.filter((i) => i.alt === undefined || i.alt === null).length,
      missingDims: imgs.filter((i) => !i.w || !i.h).length,
      outInternal: [...new Set(internal)].length,
      lang: $("html").attr("lang"),
    });
  } catch (e) {
    pages.push({ path: p, status: "ERR", error: String(e) });
  }
}

const orphans = pages
  .filter((p) => {
    const path = String(p.path);
    if (path === "/" || path === "/404") return false;
    return (inbound.get(path) ?? 0) === 0;
  })
  .map((p) => p.path);

const thin = pages.filter((p) => typeof p.wordCount === "number" && (p.wordCount as number) < 400 && p.status === 200 && !String(p.path).match(/นโยบาย|ข้อกำหนด|คำถาม|ติดต่อ|เกี่ยวกับ|404|บทความ$/));
const titles = new Map<string, string[]>();
const descs = new Map<string, string[]>();
for (const p of pages) {
  if (p.status !== 200) continue;
  const t = String(p.title || "");
  const d = String(p.description || "");
  if (t) titles.set(t, [...(titles.get(t) ?? []), String(p.path)]);
  if (d) descs.set(d, [...(descs.get(d) ?? []), String(p.path)]);
}
const dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1);
const dupDescs = [...descs.entries()].filter(([, v]) => v.length > 1);

const home = pages.find((p) => p.path === "/");
const summary = {
  crawledAt: new Date().toISOString(),
  base: BASE,
  pageCount: pages.length,
  status200: pages.filter((p) => p.status === 200).length,
  status404: pages.filter((p) => p.status === 404).length,
  sitemapUrlCount: sitemapUrls.length,
  orphanCount: orphans.length,
  orphans: orphans.slice(0, 40),
  thinCount: thin.length,
  thin: thin.map((p) => ({ path: p.path, wordCount: p.wordCount })),
  dupTitleCount: dupTitles.length,
  dupDescCount: dupDescs.length,
  hasGA: Boolean(home?.hasGA),
  hasFB: Boolean(home?.hasFB),
  hasMaps: Boolean(home?.hasMaps),
  headerChecks,
  robots,
};

fs.writeFileSync(path.join(OUT, "crawl-summary.json"), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(OUT, "pages.json"), JSON.stringify(pages, null, 2));
fs.writeFileSync(path.join(OUT, "sitemap-urls.json"), JSON.stringify(sitemapUrls, null, 2));
fs.writeFileSync(path.join(OUT, "headers.json"), JSON.stringify(headerChecks, null, 2));
fs.writeFileSync(path.join(OUT, "robots.txt"), robots);
console.log(JSON.stringify(summary, null, 2));
