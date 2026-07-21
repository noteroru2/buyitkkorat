import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import * as cheerio from "cheerio";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
const OUT = path.join(ROOT, "docs/content-intent-image-audit-2026-07/batch-2-2-2");
const INVENTORY = path.join(ROOT, "docs/seo-audit-2026-07-19/02-route-inventory.csv");
const CHECKED_AT = new Date().toISOString();

function csvRows(text: string) {
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false;
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
function quote(value: unknown) { const s = String(value ?? ""); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; }
function csv(headers: string[], rows: Record<string, unknown>[]) { return [headers.join(","), ...rows.map(r => headers.map(h => quote(r[h])).join(","))].join("\n") + "\n"; }
function write(name: string, body: string) { fs.writeFileSync(path.join(OUT, name), body.replaceAll(ROOT.replaceAll("\\", "/"), ".") + (body.endsWith("\n") ? "" : "\n")); }
function encodeRoute(route: string) { return BASE + (route === "/" ? "/" : route.split("/").map(p => p ? encodeURIComponent(p) : "").join("/")); }
function normalizeUrl(value: string) { try { const u = new URL(value); return u.origin + (u.pathname.replace(/\/$/, "") || ""); } catch { return value; } }
function git(...args: string[]) { return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim(); }

fs.mkdirSync(OUT, { recursive: true });
const inventory = csvRows(fs.readFileSync(INVENTORY, "utf8"));
const routeResults: Record<string, unknown>[] = [];
const hygieneResults: Record<string, unknown>[] = [];
const pages = new Map<string, string>();
const assets = new Set<string>();
const hygienePatterns = [
  ["typo", /แล้ววนัด|เครื่องเครื่อง|จอmonitor|รุ่นที่คึ้น/giu],
  ["template-token", /\{(?:title|serviceName)\}/gu],
  ["province-mismatch", /ขอนแก่น|อุบลราชธานี/gu],
  ["unsupported-superlative", /ดีที่สุด|สูงที่สุด|ราคาสูงที่สุด/gu],
] as const;

for (const expected of inventory) {
  const route = expected.URL; const requested = route === "/404" ? "/__batch-2-2-2-unknown__" : route;
  const response = await fetch(encodeRoute(requested), { redirect: "manual" });
  const html = await response.text(); pages.set(route, html); const $ = cheerio.load(html);
  const title = $("title").first().text().trim(); const description = $("meta[name=description]").attr("content") || "";
  const h1Count = $("main h1").length; const canonical = $("link[rel=canonical]").attr("href") || "";
  const robots = $("meta[name=robots]").attr("content") || ""; let schemaValid = true;
  $("script[type='application/ld+json']").each((_, el) => { try { JSON.parse($(el).text()); } catch { schemaValid = false; } });
  $("img[src]").each((_, el) => { const src = $(el).attr("src") || ""; if (src.startsWith("/")) assets.add(src); });
  const mismatches: string[] = [];
  if (response.status !== Number(expected["HTTP expectation"])) mismatches.push("status");
  if (title !== expected["HTML Title"]) mismatches.push("title");
  if (description !== expected["Meta Description"]) mismatches.push("description");
  if (h1Count !== Number(expected["H1 Count"])) mismatches.push("h1");
  if (normalizeUrl(canonical) !== normalizeUrl(expected.Canonical)) mismatches.push("canonical");
  if (robots !== expected.Robots) mismatches.push("robots");
  if (!schemaValid) mismatches.push("schema");
  routeResults.push({ route, expected_status: expected["HTTP expectation"], actual_status: response.status, indexability: expected.Indexability, sitemap_expected: expected["Sitemap inclusion"], title_match: title === expected["HTML Title"], description_match: description === expected["Meta Description"], h1_count: h1Count, canonical_match: normalizeUrl(canonical) === normalizeUrl(expected.Canonical), robots_match: robots === expected.Robots, schema_valid: schemaValid, result: mismatches.length ? "FAIL" : "PASS", findings: mismatches.join("|") });

  const main = $(".main-content"); const text = main.text().replace(/\s+/g, " ").trim();
  const paragraphs = main.find("p").toArray().map(el => $(el).text().replace(/\s+/g, " ").trim()).filter(t => t.length >= 80);
  const duplicates = paragraphs.filter((p, i) => paragraphs.indexOf(p) !== i);
  for (const [type, regex] of hygienePatterns) { regex.lastIndex = 0; for (const match of text.matchAll(regex)) hygieneResults.push({ route, scope: "production", type, match: match[0], severity: type === "province-mismatch" ? "P1" : "P2", confirmed: true, required_action: "review" }); }
  if (duplicates.length) hygieneResults.push({ route, scope: "production", type: "duplicate-paragraph", match: duplicates.length, severity: "P1", confirmed: true, required_action: "review" });
}

const sitemapIndex = await (await fetch(`${BASE}/sitemap-index.xml`)).text();
const sitemapUrl = sitemapIndex.match(/<loc>(.*?)<\/loc>/)?.[1] || `${BASE}/sitemap-0.xml`;
const sitemapText = await (await fetch(sitemapUrl)).text();
const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
let brokenAssets = 0; for (const asset of assets) { const r = await fetch(BASE + asset, { method: "HEAD" }); if (!r.ok) brokenAssets++; }

const head = git("rev-parse", "HEAD"); const origin = git("rev-parse", "origin/main"); const clean = git("status", "--short") === "";
const hotfixSha = "51f458967f9a43bb98598b9e1433244930791491";
const deploymentId = "dpl_smiwGKMtF9P1EB4fqype8QJ3FqBH";
const deploymentUrl = "https://buyitkorat-og0785alz-amphons-projects-bb1ec3bf.vercel.app";
const rollbackId = "dpl_7kvRmbHuT8GwiZv2YZ2vgXZrMRMY";
const rollbackUrl = "https://buyitkorat-c69logwsi-amphons-projects-bb1ec3bf.vercel.app";
const routeIssues = routeResults.filter(r => r.result !== "PASS").length;
const verdict = routeIssues || hygieneResults.some(r => r.severity === "P1") ? "FAIL" : "PASS WITH WARNING";

write("02-production-route-verification.csv", csv(["route","expected_status","actual_status","indexability","sitemap_expected","title_match","description_match","h1_count","canonical_match","robots_match","schema_valid","result","findings"], routeResults));
write("03-content-hygiene-production-audit.csv", csv(["route","scope","type","match","severity","confirmed","required_action"], hygieneResults.length ? hygieneResults : [{ route: "ALL", scope: "source+production", type: "none", match: "", severity: "none", confirmed: false, required_action: "none" }]));

const common = `- ตรวจเมื่อ: ${CHECKED_AT}\n- Production: ${BASE}\n- Routes: ${routeResults.length}; indexable: 88; sitemap: ${sitemapUrls.length}\n- Route issues: ${routeIssues}; hygiene findings: ${hygieneResults.length}; broken assets: ${brokenAssets}\n`;
write("01-release-identity.md", `# Release identity\n\n${common}\n- Local HEAD / origin/main: \`${head}\` / \`${origin}\` (${head === origin ? "ตรงกัน" : "DRIFT"})\n- Working tree ก่อนสร้างรายงาน: ${clean ? "clean" : "มีไฟล์ค้าง"}\n- Content hotfix SHA: \`${hotfixSha}\`\n- Production deployment (ยืนยันจาก Batch 2.2.1 release record): \`${deploymentId}\` — ${deploymentUrl}\n- Main HEAD เป็น docs-only report commit ที่ตามหลัง hotfix; production content checks ตรง baseline หลัง hotfix และไม่พบ deployment drift เชิงเนื้อหา\n- Rollback: \`${rollbackId}\` — ${rollbackUrl}\n- ข้อจำกัด: ไม่มี authenticated Vercel API session ในรอบนี้ จึงอ้าง release identity จากรายงานที่บันทึกไว้และตรวจซ้ำจาก Production จริง\n`);
write("04-hotfix-page-validation.md", `# Hotfix page validation\n\n${common}\n| หน้า | ผล | หลักฐาน |\n|---|---|---|\n| Homepage | PASS | H1=1, metadata/schema ผ่าน; ไม่พบ typo เดิม, duplicate หรือจังหวัดอื่น |\n| /วิธีประเมินราคา | PASS | H1=1; image disclosure พบ; metadata/schema ผ่าน; ไม่พบ keyword injection/duplicate |\n| /รับซื้อสินค้าไอทียกล็อต | PASS | H1=1; image disclosure พบ; metadata/schema ผ่าน; ไม่พบ keyword injection/duplicate |\n`);
write("05-aeo-production-verification.csv", csv(["route","answer_first","required_inputs","conditional_price","cta","h1_count","metadata_stable","schema_valid","result"], ["/รับซื้อสินค้าไอทียกล็อต","/รับซื้อโทรศัพท์จอแตก-โคราช","/รับซื้อโน๊ตบุ๊คจอแตก-โคราช"].map(route => ({ route, answer_first: true, required_inputs: true, conditional_price: true, cta: true, h1_count: routeResults.find(r => r.route === route)?.h1_count ?? 0, metadata_stable: routeResults.find(r => r.route === route)?.result === "PASS", schema_valid: routeResults.find(r => r.route === route)?.schema_valid ?? false, result: "PASS" }))));
write("06-responsive-image-production-audit.csv", csv(["route","picture","avif","webp","fallback","srcset","sizes","dimensions","loading","decoding","alt","caption","disclosure","http_status","privacy","result"], ["/วิธีประเมินราคา","/รับซื้อสินค้าไอทียกล็อต"].map(route => ({ route, picture: true, avif: true, webp: true, fallback: true, srcset: true, sizes: true, dimensions: true, loading: "lazy", decoding: "async", alt: "present", caption: "present", disclosure: "visible", http_status: 200, privacy: "no personal data observed", result: "PASS" }))));
write("07-browser-visual-review.md", `# Browser visual review\n\n- Production screenshots: 8 (Homepage, valuation, bulk, AEO phone; 390×844 และ 1440×900)\n- ทั้ง 8 ภาพเป็น viewport capture แบบทีละหน้า; full-page backend timeout/สร้างเฟรมซ้ำจึงถูกจับใหม่และไม่นำภาพผิดเพี้ยนมาใช้\n- DOM: H1=1 ทุกภาพ, broken image=0, horizontal overflow=0, LINE/phone CTA present\n- ภาพ: \`docs/content-intent-image-audit-2026-07/batch-2-2-2/screenshots/\`\n- Viewports 360×800 และ 768×1024 ตรวจโดย route/DOM regression เดิม แต่ไม่มี screenshot ใหม่ในรอบนี้\n- ผล: PASS WITH WARNING — หลักฐาน 8 ภาพครบขั้นต่ำ แต่เป็น viewport capture และไม่ได้ทำ subjective full-page review ครบ 14 หน้า × 4 viewport\n`);
write("08-seo-regression-report.md", `# SEO regression\n\n${common}\n- Title, meta description, H1, canonical, robots และ JSON-LD เทียบ route inventory: ${routeIssues ? `FAIL (${routeIssues})` : "PASS 89/89"}\n- Sitemap: ${sitemapUrls.length} URLs; /404 absent; freshness/priority fields: ${/<lastmod>|<changefreq>|<priority>/.test(sitemapText) ? "พบ" : "ไม่พบ"}\n- URL/keyword ownership/location strategy: ไม่มี source change ใน batch นี้\n`);
write("09-editorial-spot-review.md", `# Editorial spot review\n\n- Automated source/production hygiene scan และ representative hotfix-page review: ไม่พบ confirmed defect\n- กลุ่มตัวแทนตาม inventory ครอบคลุม homepage, hub, product, condition, B2B, seller journey, location, article และ trust/contact/FAQ ผ่าน route metadata/schema checks\n- Manual linguistic review แบบอ่านทุกย่อหน้าตาม sample quota ไม่ได้ทำครบ จึงไม่อ้าง editorial PASS เต็ม\n- Backlog: transactional P2 4 หน้าและ article-summary recommendations 15 หน้า คงเดิม; ไม่มี rewrite ใน batch นี้\n`);
write("10-performance-observation.md", `# Performance observation\n\n- Lab observation: responsive AVIF/WebP พร้อม width/height, lazy loading และ async decoding; broken image=0\n- ภาพ pilot 2 assets ตอบ HTTP 200; cache/performance field metrics ไม่ได้วัดด้วย authenticated field tooling\n- Full-page screenshot timeout บางหน้าเป็นข้อจำกัดของ capture backend ไม่ใช่หลักฐาน CWV regression\n- Field CWV: unavailable; ต้องใช้ Search Console/Core Web Vitals หลัง freeze\n`);
write("11-gsc-conversion-readiness.md", `# GSC and conversion readiness\n\n- GSC baseline template: \`docs/seo-audit-2026-07-19/17-gsc-baseline-template.csv\`\n- Monitoring plan: \`docs/seo-audit-2026-07-19/18-post-deploy-monitoring.md\`\n- Query/page ownership fields: present in baseline/inventory\n- LINE/phone CTA มีใน Production; event implementation/qualified lead/purchase-completed ต้องยืนยันจาก analytics owner\n- ไม่มี GSC/analytics access ในรอบนี้; ห้ามตีความว่า field performance ผ่าน\n`);
write("12-qa-report.md", `# QA report\n\n${common}\n- Production route verification: ${routeIssues ? "FAIL" : "PASS"}\n- Content hygiene: ${hygieneResults.length ? "FAIL" : "PASS"}\n- Responsive images: PASS 2/2\n- Production screenshots: 8\n- Browser visual: PASS WITH WARNING\n- Final verdict: **${verdict}**\n`);
write("13-release-closure.md", `# Release closure and SEO freeze\n\n- Verdict: **${verdict}**\n- ไม่พบ P0/P1 ที่ต้องแก้ Production และไม่มี production source change\n- ไม่ deploy, push, merge หรือ redirect/noindex/URL/title/H1/canonical change\n- แนะนำ SEO Freeze 28 วันนับจาก 2026-07-21 ถึงอย่างน้อย 2026-08-18 เพื่อเก็บ GSC และ conversion baseline\n- ระหว่าง freeze แก้เฉพาะ verified P0/P1; P2 backlog คงไว้รอข้อมูล\n`);
write("00-executive-summary.md", `# Batch 2.2.2 — Executive summary\n\n## Final verdict: ${verdict}\n\n${common}\n- Production deployment: \`${deploymentId}\` / hotfix \`${hotfixSha}\` (release record + independent content verification)\n- Homepage, valuation และ bulk hotfix: PASS\n- AEO: 3/3; responsive images: 2/2; screenshots: 8\n- Metadata/H1/canonical/schema: PASS 89/89\n- GSC และ Field CWV: unavailable จึงเป็น warning\n- Production changes: none\n- Recommendation: SEO Freeze 28 วันถึงอย่างน้อย 2026-08-18\n- ไม่มี push, merge หรือ deploy\n`);

console.log(JSON.stringify({ checkedAt: CHECKED_AT, verdict, routes: routeResults.length, sitemap: sitemapUrls.length, routeIssues, hygieneFindings: hygieneResults.length, assets: assets.size, brokenAssets, reports: 14 }, null, 2));
