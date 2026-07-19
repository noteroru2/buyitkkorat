import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const inventoryPath = path.join(ROOT, "docs", "seo-audit-2026-07-19", "02-route-inventory.csv");

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted && ch === '"' && text[i + 1] === '"') { value += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(value); value = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(value); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += ch;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] || ""])));
}
function encodeRoute(route: string) {
  return BASE + (route === "/" ? "/" : route.split("/").map((part) => part ? encodeURIComponent(part) : "").join("/"));
}
function normalize(url: string) {
  try { const parsed = new URL(url); return parsed.origin + (parsed.pathname.replace(/\/$/, "") || ""); } catch { return url; }
}
const inventory = parseCsv(fs.readFileSync(inventoryPath, "utf8"));
const issues: string[] = []; const results: Record<string, unknown>[] = []; const assets = new Set<string>();

for (const expected of inventory) {
  const route = expected.URL; const requestRoute = route === "/404" ? "/this-page-does-not-exist-release-validation" : route;
  try {
    const response = await fetch(encodeRoute(requestRoute), { redirect: "manual" });
    const html = await response.text(); const $ = cheerio.load(html);
    const expectedStatus = Number(expected["HTTP expectation"]); const title = $("head > title").first().text().trim();
    const description = $("meta[name='description']").first().attr("content") || ""; const h1Count = $("main h1").length;
    const canonical = $("link[rel='canonical']").first().attr("href") || ""; const robots = $("meta[name='robots']").first().attr("content") || "";
    const schemaScripts = $("script[type='application/ld+json']"); let schemaValid = true;
    schemaScripts.each((_, el) => { try { JSON.parse($(el).text()); } catch { schemaValid = false; } });
    $("img[src]").each((_, el) => { const src = $(el).attr("src") || ""; if (src.startsWith("/")) assets.add(src); });
    if (response.status !== expectedStatus) issues.push(`${route}: status ${response.status}, expected ${expectedStatus}`);
    if (!html.toLowerCase().includes("<!doctype html")) issues.push(`${route}: response is not HTML`);
    if (title !== expected["HTML Title"]) issues.push(`${route}: title drift`);
    if (description !== expected["Meta Description"]) issues.push(`${route}: description drift`);
    if (h1Count !== Number(expected["H1 Count"])) issues.push(`${route}: H1 count ${h1Count}`);
    if (normalize(canonical) !== normalize(expected.Canonical)) issues.push(`${route}: canonical drift`);
    if (robots !== expected.Robots) issues.push(`${route}: robots drift`);
    if (!schemaValid) issues.push(`${route}: invalid JSON-LD`);
    if (/lorem ipsum|placeholder|todo content/i.test(html)) issues.push(`${route}: placeholder text detected`);
    if (expected.Indexability === "indexable" && robots.includes("noindex")) issues.push(`${route}: accidental noindex`);
    results.push({ route, status: response.status, title, h1Count, canonical, robots, schemaCount: schemaScripts.length, schemaValid });
  } catch (error) { issues.push(`${route}: ${String(error)}`); }
}

for (const asset of assets) {
  try { const response = await fetch(BASE + asset, { method: "HEAD" }); if (!response.ok) issues.push(`asset ${asset}: ${response.status}`); }
  catch (error) { issues.push(`asset ${asset}: ${String(error)}`); }
}

const robotsResponse = await fetch(`${BASE}/robots.txt`); const robotsText = await robotsResponse.text();
const sitemapIndexResponse = await fetch(`${BASE}/sitemap-index.xml`); const sitemapIndex = await sitemapIndexResponse.text();
const sitemapUrl = sitemapIndex.match(/<loc>(.*?)<\/loc>/)?.[1] || `${BASE}/sitemap-0.xml`;
const sitemapResponse = await fetch(sitemapUrl); const sitemapText = await sitemapResponse.text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (!robotsResponse.ok || !robotsText.includes(`${BASE}/sitemap-index.xml`)) issues.push("robots.txt unavailable or sitemap reference drift");
if (!sitemapIndexResponse.ok || !sitemapResponse.ok) issues.push("sitemap unavailable");
if (sitemapUrls.length !== 88) issues.push(`sitemap count ${sitemapUrls.length}, expected 88`);
if (sitemapUrls.some((url) => url.includes("/404"))) issues.push("404 present in sitemap");
if (/<lastmod>|<changefreq>|<priority>/.test(sitemapText)) issues.push("fabricated sitemap freshness/priority field present");
const mobileHub = await (await fetch(encodeRoute("/รับซื้อโทรศัพท์มือถือ-โคราช"))).text();
if (!mobileHub.includes("/รับซื้อโทรศัพท์-xiaomi-redmi-poco-โคราช")) issues.push("Xiaomi link missing from mobile hub");

const summary = { productionUrl: BASE, checkedAt: new Date().toISOString(), routesChecked: results.length, indexableExpected: 88, sitemapCount: sitemapUrls.length, assetsChecked: assets.size, issues };
console.log(JSON.stringify(summary, null, 2));
if (issues.length) process.exit(1);
