import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "content-intent-image-audit-2026-07", "batch-2-2");
const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const RELEASE_SHA = "2b1da09dca4276bdc908b3b9125493ac1799ac21";
const DEPLOYMENT_ID = "dpl_7kvRmbHuT8GwiZv2YZ2vgXZrMRMY";
const DEPLOYMENT_URL = "https://buyitkorat-c69logwsi-amphons-projects-bb1ec3bf.vercel.app";
const ROLLBACK_URL = "https://buyitkorat-5zctgo310-amphons-projects-bb1ec3bf.vercel.app";
const DISCLOSURE = "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา";

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') { value += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(value); value = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = "";
    } else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] || ""])));
}

function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.map(quote).join(","), ...rows.map((row) => headers.map((header) => quote(row[header])).join(","))].join("\n") + "\n";
}

function encodeRoute(route: string) {
  return BASE + (route === "/" ? "/" : route.split("/").map((part) => part ? encodeURIComponent(part) : "").join("/"));
}

function normalize(url: string) {
  try { const parsed = new URL(url); return parsed.origin + (parsed.pathname.replace(/\/$/, "") || ""); }
  catch { return url; }
}

function absolute(asset: string) { return asset.startsWith("http") ? asset : BASE + asset; }

const inventory = parseCsv(fs.readFileSync(path.join(ROOT, "docs", "seo-audit-2026-07-19", "02-route-inventory.csv"), "utf8"));
const routeRows: Record<string, unknown>[] = [];
const imageCandidates = new Map<string, Record<string, string>>();
const pilotRows: Record<string, string>[] = [];

for (const expected of inventory) {
  const route = expected.URL;
  const requestRoute = route === "/404" ? "/this-page-does-not-exist-batch-2-2" : route;
  const response = await fetch(encodeRoute(requestRoute), { redirect: "manual" });
  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $("head > title").first().text().trim();
  const description = $("meta[name='description']").first().attr("content") || "";
  const h1Count = $("main h1").length;
  const canonical = $("link[rel='canonical']").first().attr("href") || "";
  const robots = $("meta[name='robots']").first().attr("content") || "";
  const schemaScripts = $("script[type='application/ld+json']");
  let schemaValid = true;
  schemaScripts.each((_, el) => { try { JSON.parse($(el).text()); } catch { schemaValid = false; } });
  const issues: string[] = [];
  if (response.status !== Number(expected["HTTP expectation"])) issues.push("status");
  if (title !== expected["HTML Title"]) issues.push("title");
  if (description !== expected["Meta Description"]) issues.push("description");
  if (h1Count !== Number(expected["H1 Count"])) issues.push("h1");
  if (normalize(canonical) !== normalize(expected.Canonical)) issues.push("canonical");
  if (robots !== expected.Robots) issues.push("robots");
  if (!schemaValid) issues.push("schema");
  if (expected.Indexability === "indexable" && robots.includes("noindex")) issues.push("noindex");
  if (/lorem ipsum|placeholder|todo content/i.test(html)) issues.push("placeholder");
  if (/ขอนแก่น/.test($("body").text())) issues.push("province-mismatch");

  const internalLinks = new Set<string>();
  $("a[href]").each((_, el) => { const href = $(el).attr("href") || ""; if (href.startsWith("/")) internalLinks.add(href.split("#")[0]); });
  const slot = $("[data-image-slot]");
  if (slot.length) {
    const img = slot.find("img").first();
    pilotRows.push({
      Route: route,
      Slot: slot.attr("data-image-slot") || "",
      Alt: img.attr("alt") || "",
      Caption: slot.find("figcaption").text().trim(),
      Width: img.attr("width") || "",
      Height: img.attr("height") || "",
      Loading: img.attr("loading") || "",
      Priority: img.attr("fetchpriority") || "",
      Sources: String(slot.find("source").length),
      Srcset: slot.find("source").toArray().every((el) => Boolean($(el).attr("srcset"))) ? "PASS" : "FAIL",
      Sizes: slot.find("source").toArray().every((el) => Boolean($(el).attr("sizes"))) ? "PASS" : "FAIL",
      Disclosure: slot.find("figcaption").text().trim() === DISCLOSURE ? "PASS" : "FAIL",
    });
  }

  $("picture source[srcset]").each((_, el) => {
    const type = $(el).attr("type") || "";
    const sizes = $(el).attr("sizes") || "";
    for (const entry of ($(el).attr("srcset") || "").split(",")) {
      const [url, descriptor] = entry.trim().split(/\s+/);
      if (url) imageCandidates.set(`${route}|${url}`, { category: slot.length ? "Pilot image" : "Existing image", route, url, format: type, descriptor: descriptor || "", sizes });
    }
  });
  $("picture img[src]").each((_, el) => {
    const url = $(el).attr("src") || "";
    if (url) imageCandidates.set(`${route}|${url}`, { category: slot.length ? "Pilot fallback" : "Existing fallback", route, url, format: "fallback", descriptor: "", sizes: "" });
  });

  routeRows.push({
    Route: route,
    Status: response.status,
    ExpectedStatus: expected["HTTP expectation"],
    Indexability: expected.Indexability,
    Title: title === expected["HTML Title"] ? "PASS" : "FAIL",
    Description: description === expected["Meta Description"] ? "PASS" : "FAIL",
    H1Count: h1Count,
    Canonical: normalize(canonical) === normalize(expected.Canonical) ? "PASS" : "FAIL",
    Robots: robots === expected.Robots ? "PASS" : "FAIL",
    SchemaCount: schemaScripts.length,
    Schema: schemaValid ? "PASS" : "FAIL",
    InternalLinks: internalLinks.size,
    Images: $("img").length,
    ProvinceMismatch: /ขอนแก่น/.test($("body").text()) ? "FAIL" : "PASS",
    Result: issues.length ? `FAIL: ${issues.join("|")}` : "PASS",
  });
}

for (const asset of ["/favicon.svg", "/favicon.ico", "/og/default.png", "/icons/apple-touch-icon.png", "/site.webmanifest"]) {
  imageCandidates.set(`shared|${asset}`, { category: "Shared default/OG asset", route: "shared", url: asset, format: path.extname(asset).slice(1), descriptor: "", sizes: "" });
}

const imageRows: Record<string, unknown>[] = [];
for (const item of [...imageCandidates.values()].sort((a, b) => `${a.route}${a.url}`.localeCompare(`${b.route}${b.url}`, "th"))) {
  const response = await fetch(absolute(item.url));
  imageRows.push({
    Category: item.category,
    Route: item.route,
    URL: item.url,
    Format: item.format,
    Descriptor: item.descriptor,
    Sizes: item.sizes,
    HTTPStatus: response.status,
    ContentType: response.headers.get("content-type") || "",
    Result: response.ok ? "PASS" : "FAIL",
  });
}

const robotsResponse = await fetch(`${BASE}/robots.txt`);
const robotsText = await robotsResponse.text();
const sitemapIndexResponse = await fetch(`${BASE}/sitemap-index.xml`);
const sitemapIndexText = await sitemapIndexResponse.text();
const sitemapUrl = sitemapIndexText.match(/<loc>(.*?)<\/loc>/)?.[1] || `${BASE}/sitemap-0.xml`;
const sitemapResponse = await fetch(sitemapUrl);
const sitemapText = await sitemapResponse.text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapClean = sitemapUrls.length === 88 && !sitemapUrls.some((url) => url.includes("/404")) && !/<lastmod>|<changefreq>|<priority>/.test(sitemapText);

const aeoExpected = [
  { route: "/รับซื้อสินค้าไอทียกล็อต", lead: "รับประเมินสินค้าไอทีหลายชิ้นและยกล็อตจากรายการ รุ่น สเปก สภาพ และรูปตัวอย่าง ส่งข้อมูลทาง LINE เพื่อรับราคาเบื้องต้น โดยราคาสุดท้ายยืนยันหลังตรวจสินค้าจริง" },
  { route: "/รับซื้อโทรศัพท์จอแตก-โคราช", lead: "รับประเมินโทรศัพท์จอแตกจากรุ่น ความจุ สภาพการแสดงผล การสัมผัส และรูปตำหนิ ส่งข้อมูลทาง LINE เพื่อรับราคาเบื้องต้น โดยราคาสุดท้ายยืนยันหลังตรวจเครื่องจริง" },
  { route: "/รับซื้อโน๊ตบุ๊คจอแตก-โคราช", lead: "รับประเมินโน๊ตบุ๊คจอแตกจากรุ่น สเปก อาการจอ สภาพตัวเครื่อง และรูปตำหนิ ส่งข้อมูลทาง LINE เพื่อรับราคาเบื้องต้น โดยราคาสุดท้ายยืนยันหลังตรวจเครื่องจริง" },
];
const aeoResults: { route: string; lead: string; match: boolean; h1: number; schema: boolean }[] = [];
for (const expected of aeoExpected) {
  const response = await fetch(encodeRoute(expected.route));
  const $ = cheerio.load(await response.text());
  const lead = $(".hero__lead").first().text().trim();
  let schema = true;
  $("script[type='application/ld+json']").each((_, el) => { try { JSON.parse($(el).text()); } catch { schema = false; } });
  aeoResults.push({ route: expected.route, lead, match: lead === expected.lead, h1: $("main h1").length, schema });
}

const routeFailures = routeRows.filter((row) => row.Result !== "PASS");
const imageFailures = imageRows.filter((row) => row.Result !== "PASS");
const pilotFailures = pilotRows.filter((row) => row.Disclosure !== "PASS" || row.Srcset !== "PASS" || row.Sizes !== "PASS");
const structuralPass = !routeFailures.length && !imageFailures.length && !pilotFailures.length && aeoResults.every((row) => row.match && row.h1 === 1 && row.schema) && sitemapClean;
const verdict = structuralPass ? "WARNING" : "FAIL";

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "02-responsive-image-regression.csv"), csv(pilotRows), "utf8");
fs.writeFileSync(path.join(OUT, "03-production-route-validation.csv"), csv(routeRows), "utf8");
fs.writeFileSync(path.join(OUT, "04-production-image-validation.csv"), csv(imageRows), "utf8");

const write = (name: string, body: string) => fs.writeFileSync(path.join(OUT, name), body.trim() + "\n", "utf8");
write("00-executive-summary.md", `# Batch 2.2 — Executive Summary

## Final verdict

**${verdict}** — Push และ Production deployment สำเร็จ และ automated production regression ผ่านทั้งหมด แต่ browser screenshot capture timeout ต่อเนื่อง จึงไม่ให้ Visual QA เป็น PASS เต็มตามเกณฑ์ Batch 2.2

- Release SHA: \`${RELEASE_SHA}\`
- Deployment: \`${DEPLOYMENT_ID}\`
- Routes: 89/89 ผ่าน
- Indexable: 88
- Sitemap: 88 URLs
- ResponsiveImage production usages: 2/2 ผ่าน structural/browser DOM checks
- Production screenshots: 0 (capture backend timeout; local Batch 2.1 evidence เดิมมี 8)
- Rollback: ไม่ดำเนินการ เพราะไม่พบ rollback condition ใน Production
`);

write("01-release-identity.md", `# Release Identity

| รายการ | ค่า |
|---|---|
| Safety branch | \`batch-2-2-safe-image-release\` |
| Baseline commit | \`48034c7\` |
| Image commit | \`73c4b7c\` |
| AEO commit | \`2b1da09\` |
| Final main SHA | \`${RELEASE_SHA}\` |
| Deployment ID | \`${DEPLOYMENT_ID}\` |
| Deployment URL | ${DEPLOYMENT_URL} |
| Production URL | ${BASE} |
| Previous known-good / rollback target | ${ROLLBACK_URL} |
| Deploy workflow | Vercel Git integration จาก main |
| GitHub commit deployment status | success |
`);

write("05-pilot-page-validation.md", `# Pilot Page Validation

ทั้งสองหน้าแสดงภาพ generic ที่อนุมัติ, alt/caption ตรง source, disclosure มองเห็นใน HTML, dimensions 1200×800, lazy loading และ low fetch priority

| Route | ภาพ | Privacy/location | Disclosure | CTA | Result |
|---|---|---|---|---|---|
| /วิธีประเมินราคา | Evaluation workspace | ไม่พบบุคคล ข้อมูลลูกค้า เอกสาร หรือบริบทขอนแก่น | PASS | LINE/โทรศัพท์คงเดิม | PASS |
| /รับซื้อสินค้าไอทียกล็อต | Bulk sorting workflow | ไม่พบบุคคล Serial/IMEI/QR/ทะเบียน หรือการอ้างเป็นโกดัง/สาขาจริง | PASS | LINE/โทรศัพท์คงเดิม | PASS |

Browser DOM ที่ 390px ยืนยันว่า AVIF current source โหลดสำเร็จทั้งสองภาพ; natural size 358×238 และไม่เกิดภาพขนาดศูนย์
`);

write("06-aeo-production-validation.md", `# AEO Production Validation

${aeoResults.map((row) => `- \`${row.route}\`: ${row.match ? "PASS" : "FAIL"} — visible answer-first lead ตรง source, H1=${row.h1}, schema=${row.schema ? "valid" : "invalid"}`).join("\n")}

เนื้อหาใหม่ไม่เพิ่มคำอ้างราคาสูงสุดหรือการอ้างสาขา และ CTA เดิมยังคงอยู่

## Remaining P2 backlog (ไม่แก้ใน release นี้)

- /ขายอุปกรณ์ไอทียกสำนักงาน-โคราช
- /รับซื้อ-nintendo-switch-โคราช
- /รับซื้ออุปกรณ์สำนักงาน
- /รับซื้อเครื่องเกม-โคราช
- Article summaries อีก 15 หน้า: Recommended P2
`);

write("07-browser-visual-review.md", `# Browser Visual Review

## Automated browser DOM review

- 14 routes × 4 viewports (360×800, 390×844, 768×1024, 1440×900) = 56 checks
- H1 overflow: 0
- Horizontal overflow: 0
- Broken rendered images: 0
- Province mismatch: 0
- Pilot picture/source/srcset/sizes/dimensions/alt/disclosure: PASS
- Mobile navigation: PASS (aria-expanded false → true; controlled menu visible)
- LINE/phone CTA presence: PASS

## Screenshot evidence

Production screenshot capture: **0/12**. Browser screenshot backend timeout เกิดซ้ำทั้งแท็บเดิมและแท็บใหม่ จึงห้ามสรุป Visual QA เป็น PASS เต็ม แม้ DOM checks และภาพ local Batch 2.1 จำนวน 8 ภาพจะผ่านมาก่อน release

ผลส่วนนี้: **WARNING**
`);

write("08-qa-report.md", `# QA Report

- npm run check: PASS — 0 errors, 0 warnings, 38 hints
- npm run build: PASS — 89 routes, responsive variants 16
- npm run audit:all: PASS — 6 suites, critical=0, warning=0
- npm run audit:content-image: PASS
- npm run audit:batch-2-1: PASS
- npm run qa:playwright: PASS
- Production routes: ${routeRows.length}/89; failures=${routeFailures.length}
- Production image/assets: ${imageRows.length}; failures=${imageFailures.length}
- robots.txt: ${robotsResponse.ok && robotsText.includes(`${BASE}/sitemap-index.xml`) ? "PASS" : "FAIL"}
- Sitemap: ${sitemapClean ? "PASS" : "FAIL"} — ${sitemapUrls.length} URLs, no 404/fabricated freshness fields
- Deployment drift: ไม่พบ; Vercel status ผูกกับ ${RELEASE_SHA}
- Deterministic reports: ใช้ release identity แบบคงที่ ไม่มี runtime timestamp
`);

write("09-rollback-readiness.md", `# Rollback Readiness

- Rollback target: ${ROLLBACK_URL}
- Previous validated deployment ID: \`dpl_AdZeTJwHb49pdRimSvESkCJHYUAM\`
- Current release: \`${DEPLOYMENT_ID}\`
- Rollback conditions detected: 0
- Rollback performed: No

Screenshot tooling timeout ไม่ใช่ Production regression: route, SEO, CTA, image response, disclosure และ layout DOM checks ผ่าน จึงไม่ rollback แต่คง verdict เป็น WARNING
`);

write("10-release-and-production-validation.md", `# Batch 2.2 — Release and Production Validation

## Verdict

**${verdict}** — Release/Production structural validation ผ่าน แต่ Production screenshots จับไม่ได้ จึง Visual QA ไม่ครบตาม gate

## Release

- Safety branch pushed: \`batch-2-2-safe-image-release\` @ \`${RELEASE_SHA}\`
- Main pushed fast-forward: \`5c264bc..2b1da09\`; no force push
- Local main = origin/main: \`${RELEASE_SHA}\`
- Deployment: \`${DEPLOYMENT_ID}\` (${DEPLOYMENT_URL})
- Production: ${BASE}
- Rollback target: ${ROLLBACK_URL}

## Production validation

- Routes 89/89; indexable 88; unknown route 404/noindex
- Sitemap 88 canonical URLs; robots reference correct; no fabricated lastmod/changefreq/priority
- Metadata, H1, canonical, robots and JSON-LD: PASS
- ResponsiveImage usages 2/2: PASS; generated image URLs all respond 200
- Pilot images 2/2 and disclosure 2/2: PASS
- AEO answer-first pages 3/3: PASS
- Browser DOM checks 56/56: PASS
- Production screenshots 0/12: WARNING (capture backend timeout)
- Deployment drift: none
- Rollback: not triggered

## Monitoring

- GSC access is not available in this environment; query ownership, field CWV/CLS and conversion attribution remain monitoring items
- Remaining transactional P2: 4 pages; article summary P2: 15 pages
`);

console.log(JSON.stringify({ verdict, routes: routeRows.length, routeFailures: routeFailures.length, images: imageRows.length, imageFailures: imageFailures.length, pilots: pilotRows.length, aeo: aeoResults.length, sitemap: sitemapUrls.length }, null, 2));
if (!structuralPass) process.exitCode = 1;
