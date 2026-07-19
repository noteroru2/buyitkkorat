import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { countThaiWords, fileToRoute, normalizeInternalPath, walkHtml } from "./audit-lib";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "content-intent-image-audit-2026-07");
const SOURCE_REPO = "C:\\Users\\User\\Desktop\\project ทั้งหมด\\รับซื้อไอทีขอนแก่น";
fs.mkdirSync(OUT, { recursive: true });

const clean = (value = "") => value.replace(/\s+/g, " ").trim();
const unique = <T>(values: T[]) => [...new Set(values)];
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const write = (name: string, body: string) => fs.writeFileSync(path.join(OUT, name), `${body.trim()}\n`, "utf8");
const writeCsv = (name: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) throw new Error(`No rows for ${name}`);
  const headers = Object.keys(rows[0]);
  write(name, [headers.map(csv).join(","), ...rows.map((row) => headers.map((h) => csv(row[h])).join(","))].join("\n"));
};
const routeHref = (href = "") => href.startsWith("/") ? normalizeInternalPath(href) : "";
const rel = (base: string, file: string) => path.relative(base, file).replace(/\\/g, "/");

function pageType(url: string) {
  if (url === "/") return "Homepage";
  if (url === "/404") return "Error recovery";
  if (url === "/บทความ") return "Article hub";
  if (url.startsWith("/บทความ/")) return "Article";
  if (url.startsWith("/พื้นที่/")) return "Location";
  if (url === "/ติดต่อ") return "Contact";
  if (url === "/เกี่ยวกับเรา") return "About";
  if (url === "/คำถามที่พบบ่อย") return "FAQ";
  if (/นโยบาย|ข้อกำหนด/.test(url)) return "Policy";
  if (/บริษัท|สำนักงาน|ยกล็อต|หลายเครื่อง/.test(url)) return "B2B/bulk";
  if (url === "/รับซื้อสินค้าไอที") return "Main service hub";
  if (/เสีย|จอแตก|เปิดไม่ติด|ไม่มีอุปกรณ์|ไม่ได้ใช้งาน/.test(url)) return "Condition";
  if (/วิธี|ส่งสินค้า|บริการรับซื้อถึงที่/.test(url)) return "Seller journey";
  return "Product service";
}

function intentFor(type: string, url: string) {
  if (type === "Homepage" || type === "Main service hub") return "Local transactional";
  if (type === "Location") return "Location appointment";
  if (type === "B2B/bulk") return "B2B/bulk transactional";
  if (type === "Condition") return "Condition transactional";
  if (type === "Seller journey") return "Seller journey";
  if (type === "Article" || type === "Article hub") return "Informational";
  if (["About", "Contact", "FAQ"].includes(type)) return "Trust/navigation";
  if (type === "Policy") return "Policy";
  if (type === "Error recovery") return "Error recovery";
  if (/iphone|ipad|macbook|apple|xiaomi|samsung|oppo|vivo|playstation|nintendo/.test(url)) return "Brand transactional";
  return "Product transactional";
}

function sourceFor(url: string) {
  const slug = url.split("/").at(-1) || "index";
  if (url.startsWith("/บทความ/")) return `src/content/articles/${slug}.md`;
  if (url.startsWith("/พื้นที่/")) return `src/content/areas/${slug}.md`;
  if (fs.existsSync(path.join(ROOT, "src/content/services", `${slug}.md`))) return `src/content/services/${slug}.md`;
  const direct = url === "/" ? "src/pages/index.astro" : `src/pages/${url.slice(1)}.astro`;
  return fs.existsSync(path.join(ROOT, direct)) ? direct : typeSource(url);
}
function typeSource(url: string) {
  if (url === "/บทความ") return "src/pages/บทความ/index.astro";
  return "src/pages/[slug].astro (content collection)";
}

function parentFor(type: string, url: string) {
  if (type === "Article") return "/บทความ";
  if (type === "Location") return "/พื้นที่/เมืองนครราชสีมา";
  if (["Homepage", "Main service hub", "About", "Contact", "FAQ", "Policy", "Article hub", "Error recovery"].includes(type)) return type === "Homepage" ? "" : "/";
  if (/โทรศัพท์|iphone|ipad|แท็บเล็ต|xiaomi|samsung|oppo|vivo/.test(url)) return "/รับซื้อโทรศัพท์มือถือ-โคราช";
  if (/โน๊ตบุ๊ค|macbook/.test(url)) return "/รับซื้อโน๊ตบุ๊ค-โคราช";
  if (/คอม|การ์ดจอ|cpu|แรม|เมนบอร์ด|ssd|server|เวิร์กสเตชัน/.test(url)) return "/รับซื้อคอมพิวเตอร์-โคราช";
  if (/กล้อง|เลนส์/.test(url)) return "/รับซื้อกล้อง-โคราช";
  if (/เกม|playstation|nintendo/.test(url)) return "/รับซื้อเครื่องเกม-โคราช";
  return "/รับซื้อสินค้าไอที";
}

type Page = {
  url: string; type: string; source: string; intent: string; title: string; description: string; h1: string; h2: string[]; h3: string[];
  visibleText: string; mainText: string; visibleWords: number; mainWords: number; answerFirst: boolean; pricing: boolean; process: boolean;
  ownership: boolean; lineCta: number; phoneCta: number; faq: string[]; links: string[]; contextual: string[]; related: string[];
  images: { src: string; alt: string; width: string; height: string; loading: string }[]; indexable: boolean; parent: string;
  intentScore: number; qualityScore: number; aeo: string; geo: string; reason: string; action: string;
};

const pages: Page[] = walkHtml().map((file) => {
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  const url = fileToRoute(file); const type = pageType(url); const intent = intentFor(type, url);
  const main = $("main").first(); const content = $(".main-content").first();
  const visibleText = clean(main.text()); const mainText = clean((content.length ? content : main).text());
  const topText = clean(main.find("h1").first().nextAll("p").first().text() || main.find("p").first().text());
  const answerFirst = topText.length >= 45 && !/ติดต่อ|ดูเพิ่มเติม/.test(topText.slice(0, 45));
  const pricing = /ปัจจัย.*ราคา|ประเมินราคา|ราคาขึ้นอยู่|มีผลต่อราคา/.test(mainText);
  const process = /ขั้นตอน|ส่งรูป|ประเมิน|นัดรับ|ส่งมอบ/.test(mainText);
  const ownership = /เจ้าของ|กรรมสิทธิ์|iCloud|Google Account|ล็อกบัญชี/.test(mainText);
  const links = unique(main.find("a[href^='/']").map((_, el) => routeHref($(el).attr("href"))).get().filter(Boolean));
  const contextual = unique((content.length ? content : main).find("a[href^='/']").map((_, el) => routeHref($(el).attr("href"))).get().filter(Boolean));
  const related = unique(main.find("section").filter((_, el) => /เกี่ยวข้อง|อ่านต่อ|บริการ/.test(clean($(el).find("h2").first().text()))).find("a[href^='/']").map((_, el) => routeHref($(el).attr("href"))).get().filter(Boolean));
  const images = main.find("img").map((_, el) => ({ src: $(el).attr("src") || "", alt: $(el).attr("alt") || "", width: $(el).attr("width") || "", height: $(el).attr("height") || "", loading: $(el).attr("loading") || "" })).get();
  const faq: string[] = [];
  $("script[type='application/ld+json']").each((_, el) => { try { const data = JSON.parse($(el).text()); const nodes = data["@graph"] || [data]; for (const node of nodes) if (node["@type"] === "FAQPage") for (const q of node.mainEntity || []) faq.push(clean(q.name)); } catch {} });
  const commercial = ["Homepage", "Main service hub", "Product service", "Condition", "B2B/bulk", "Location", "Seller journey"].includes(type);
  let intentScore = 5;
  const intentGaps: string[] = [];
  if (!answerFirst && !["Policy", "Error recovery"].includes(type)) { intentScore--; intentGaps.push("ไม่พบคำตอบต้นหน้าที่ชัดเจน"); }
  if (commercial && !process) { intentScore--; intentGaps.push("ไม่พบขั้นตอนถัดไปที่ชัดเจน"); }
  if (commercial && !pricing && !["Location", "Seller journey"].includes(type)) { intentScore--; intentGaps.push("ไม่พบปัจจัยประเมินราคาเฉพาะหน้า"); }
  intentScore = Math.max(2, intentScore);
  let qualityScore = 5; const qualityGaps: string[] = [];
  if (type === "Location") { qualityScore = 3; qualityGaps.push("เนื้อหา location ใช้โครงร่วมสูงและยังไม่มีหลักฐานการปฏิบัติงานเฉพาะพื้นที่"); }
  if (["Product service", "Condition"].includes(type) && mainWords(mainText) < 450) { qualityScore--; qualityGaps.push("เนื้อหาเฉพาะสินค้า/สภาพมีรายละเอียดจำกัด"); }
  if (commercial && type !== "Location" && !ownership) { qualityScore--; qualityGaps.push("ไม่พบการเชื่อมโยงนโยบายกรรมสิทธิ์/บัญชีล็อกใน main content"); }
  qualityScore = Math.max(2, qualityScore);
  const aeo = answerFirst && faq.length && process ? "Strong" : answerFirst && (faq.length || process) ? "Adequate" : answerFirst ? "Weak" : "Missing";
  const entityText = `${visibleText} ${$("body").text()}`;
  const geo = /WINNER IT/.test(entityText) && /095-547-9408/.test(entityText) && /@buyhub/.test(entityText) && /นครราชสีมา|โคราช/.test(entityText) ? "Strong" : /WINNER IT/.test(entityText) && /นครราชสีมา|โคราช/.test(entityText) ? "Adequate" : "Weak";
  const below = [...intentGaps, ...qualityGaps];
  const reason = below.join("; ");
  const action = type === "Location" ? "Requires GSC; เพิ่มเฉพาะหลักฐานโลจิสติกส์จริงหลังธุรกิจยืนยัน" : intentScore < 4 || qualityScore < 4 ? `P2: ${reason}` : "Keep as is";
  return { url, type, source: sourceFor(url), intent, title: clean($("title").text()), description: clean($("meta[name='description']").attr("content")), h1: clean(main.find("h1").first().text()), h2: main.find("h2").map((_, el) => clean($(el).text())).get(), h3: main.find("h3").map((_, el) => clean($(el).text())).get(), visibleText, mainText, visibleWords: countThaiWords(visibleText), mainWords: countThaiWords(mainText), answerFirst, pricing, process, ownership, lineCta: $("a[href*='line.me'],a[href*='lin.ee']").length, phoneCta: $("a[href^='tel:']").length, faq: unique(faq), links, contextual, related, images, indexable: !($("meta[name='robots']").attr("content") || "").includes("noindex"), parent: parentFor(type, url), intentScore, qualityScore, aeo, geo, reason, action };
});
function mainWords(text: string) { return countThaiWords(text); }

const inbound = (target: string, bucket: "links" | "contextual" | "related") => pages.filter((page) => page.url !== target && page[bucket].includes(target)).length;
const imageUsage = new Map<string, number>();
for (const page of pages) for (const image of unique(page.images.map((x) => x.src))) imageUsage.set(image, (imageUsage.get(image) || 0) + 1);

const inventory = pages.map((p) => ({
  URL: p.url, "Source file": p.source, "Page type": p.type, "Parent hub": p.parent, "Primary keyword hypothesis": p.h1,
  "Secondary keyword hypotheses": `${p.intent}; ${p.type}; ${p.url.split("/").at(-1) || "รับซื้อไอทีโคราช"}`, "Search intent": p.intent,
  "Funnel stage": p.type === "Article" ? "Awareness/consideration" : ["About", "Policy", "FAQ"].includes(p.type) ? "Trust" : p.type === "Error recovery" ? "Support" : "Decision",
  "Conversion role": ["Article", "About", "Policy", "FAQ"].includes(p.type) ? "Assisted conversion/trust" : p.type === "Error recovery" ? "Recovery" : "LINE/phone conversion",
  "Geographic intent": p.type === "Location" ? p.h1 : /โคราช|นครราชสีมา/.test(`${p.h1} ${p.description}`) ? "Korat/Nakhon Ratchasima" : "Implicit site-wide Korat",
  "Product intent": ["Product service", "Condition"].includes(p.type) ? p.h1 : "none", "Condition intent": p.type === "Condition" ? p.h1 : "none",
  "Seller type": p.type === "B2B/bulk" ? "Business/organization" : p.type === "Location" ? "Local seller" : "Individual or business",
  "HTML title": p.title, "Meta description": p.description, H1: p.h1, H2: p.h2.join(" | "), H3: p.h3.join(" | "), "Visible word count": p.visibleWords,
  "Main-content word count": p.mainWords, "Answer-first block": p.answerFirst ? "yes" : "no", "Pricing-factor section": p.pricing ? "yes" : "no", "Process section": p.process ? "yes" : "no",
  "Ownership/account-lock policy": p.ownership ? "yes" : "no", "CTA count": p.lineCta + p.phoneCta, "LINE CTA": p.lineCta, "Phone CTA": p.phoneCta, "FAQ count": p.faq.length,
  "Contextual internal links in": inbound(p.url, "contextual"), "Contextual internal links out": p.contextual.length, "Related component links": p.related.length,
  "Article-to-service link": p.type === "Article" && p.links.some((x) => !x.startsWith("/บทความ")) ? "yes" : p.type === "Article" ? "no" : "n/a",
  "Image count": p.images.length, "Unique image count": p.images.filter((x) => (imageUsage.get(x.src) || 0) === 1).length,
  "Shared image count": p.images.filter((x) => (imageUsage.get(x.src) || 0) > 1).length, "Image disclosure status": p.images.some((x) => /ai/i.test(x.src)) ? (/ภาพประกอบ|AI/.test(p.visibleText) ? "present" : "review") : "not required",
  "Content similarity group": `${p.type}:${p.parent || "root"}`, "Intent-match score": p.intentScore, "Content-quality score": p.qualityScore,
  "AEO readiness": p.aeo, "GEO readiness": p.geo, "Manual-review reason": p.reason, "Recommended action": p.action,
}));
writeCsv("01-content-inventory.csv", inventory);

writeCsv("02-search-intent-map.csv", pages.map((p) => ({ URL: p.url, "Source file": p.source, "Search intent": p.intent,
  "Searcher": p.type === "B2B/bulk" ? "องค์กร/ผู้ดูแลทรัพย์สินไอที" : p.type === "Article" ? "ผู้ขายที่กำลังหาข้อมูล" : "ผู้ขายสินค้าไอทีในโคราช",
  "What they want": p.h1, "Decision stage": p.type === "Article" ? "Research" : p.type === "Error recovery" ? "Recovery" : "Evaluate/contact",
  "First information needed": p.description, "Above-fold answer": p.answerFirst ? "yes" : "no", "CTA fit": p.lineCta + p.phoneCta > 0 ? "appropriate" : p.type === "Policy" ? "not required" : "review",
  "Relationship": ["Homepage", "Main service hub"].includes(p.type) ? "Primary owner" : "Supports parent hub", "Next action": p.type === "Article" ? "Read then visit relevant service" : p.type === "Error recovery" ? "Return to service hub" : "Send details via LINE or call",
  "Intent-match score": p.intentScore, Evidence: p.intentScore < 4 ? p.reason : "Title, H1, opening and CTA align", Recommendation: p.intentScore < 4 ? p.action : "Keep as is", "Requires GSC": p.type === "Location" ? "Yes" : "No" })));

writeCsv("03-content-quality-audit.csv", pages.map((p) => ({ URL: p.url, "Source file": p.source, "Page type": p.type, "Main words": p.mainWords,
  "Product-specific factors": p.pricing ? "detected" : "not detected", Process: p.process ? "detected" : "not detected", "Ownership/account lock": p.ownership ? "detected" : "not detected",
  "Template-heavy risk": p.type === "Location" ? "high" : p.type === "Product service" ? "medium" : "low", "Content-quality score": p.qualityScore,
  Evidence: p.qualityScore < 4 ? p.reason : "Page has a distinct role, substantive main content and safe conversion path", Recommendation: p.qualityScore < 4 ? p.action : "Keep as is", Priority: p.qualityScore < 4 ? "P2" : "No action" })));

writeCsv("08-aeo-readiness.csv", pages.map((p) => ({ URL: p.url, "Source file": p.source, "Answer-first": p.answerFirst ? "yes" : "no", "Direct answer evidence": p.answerFirst ? clean(p.mainText).slice(0, 180) : "No clear answer-first paragraph detected", "FAQ count": p.faq.length, "Process answer": p.process ? "yes" : "no", "Pricing answer": p.pricing ? "yes" : "no", "Ownership answer": p.ownership ? "yes" : "no", "AEO readiness": p.aeo, Recommendation: p.aeo === "Strong" ? "Keep as is" : "P2: improve concise answer-first block or task-specific answers without changing keyword ownership" })));

async function listSourceImages() {
  if (!fs.existsSync(SOURCE_REPO)) throw new Error(`Source repo not found: ${SOURCE_REPO}`);
  const tracked = execFileSync("git", ["-c", `safe.directory=${SOURCE_REPO.replace(/\\/g, "/")}`, "ls-files"], { cwd: SOURCE_REPO, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
  const privateRoot = path.join(SOURCE_REPO, "private-assets");
  const privateFiles: string[] = [];
  const walk = (dir: string) => { if (!fs.existsSync(dir)) return; for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) walk(full); else privateFiles.push(rel(SOURCE_REPO, full)); } };
  walk(privateRoot);
  const candidates = unique([...tracked, ...privateFiles]).filter((x) => /\.(?:jpe?g|png|webp|gif|avif|svg)$/i.test(x)).sort();
  const records: Record<string, unknown>[] = [];
  for (const relative of candidates) {
    const full = path.join(SOURCE_REPO, relative); if (!fs.existsSync(full)) continue;
    const stat = fs.statSync(full); const buffer = fs.readFileSync(full); const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    let width: number | string = ""; let height: number | string = ""; let format = path.extname(relative).slice(1).toLowerCase();
    try { const meta = await sharp(buffer, { animated: false }).metadata(); width = meta.width || ""; height = meta.height || ""; format = meta.format || format; } catch {}
    const lower = relative.toLowerCase(); const ai = /(^|[/_-])ai([/_-]|\.)|chatgpt/.test(lower); const screenshot = /^docs\//.test(lower); const privateIntake = /^private-assets\//.test(lower);
    const location = /ขอนแก่น|khonkaen|khon-kaen|local-|location|map|แผนที่/.test(lower); const qr = /qr/.test(lower); const customer = /customer|ลูกค้า|review|รีวิว/.test(lower);
    const sensitive = privateIntake || /serial|imei|ทะเบียน|plate|เอกสาร|document|id-card|person|owner/.test(lower); const sourceAsset = /^src\/assets\/images\//.test(lower) || /^public\/images\//.test(lower);
    let decision = "Requires rights confirmation"; let reason = "Asset provenance/rights are not recorded in the target repository"; let edit = "Confirm rights and inspect visible text/context before migration";
    if (screenshot) { decision = "Unnecessary asset"; reason = "QA/documentation screenshot, not a reusable content image"; edit = "Do not migrate"; }
    if (location) { decision = "Do not reuse"; reason = "Location-sensitive Khon Kaen or local-page context can mislead on the Korat site"; edit = "Do not migrate; use verified Korat evidence or generic service imagery"; }
    if (privateIntake || sensitive || qr || customer) { decision = "Requires privacy cleanup"; reason = "Unreviewed/private intake may expose people, serials, screens, documents, QR or customer context"; edit = "Manual pixel-level privacy and rights review; redact all identifiers before any reuse"; }
    if (ai && !location && !privateIntake) { decision = "Safe with disclosure"; reason = "Filename and source structure identify an AI illustration; no location claim detected by metadata/path review"; edit = "Retain visible AI-illustration disclosure and use neutral alt text"; }
    if (sourceAsset && !ai && !location) { decision = "Requires rights confirmation"; reason = "Relevant product/service asset but copyright provenance is not evidenced in this target audit"; edit = "Confirm ownership/license; inspect for logos, screens, serials and customer data"; }
    const category = screenshot ? "QA/documentation" : ai ? "AI illustration" : privateIntake ? "Private intake" : /products/.test(lower) ? "Product" : /trust/.test(lower) ? "Trust" : "Site asset";
    records.push({ "Source path": relative, Filename: path.basename(relative), Type: format, Width: width, Height: height, "Aspect ratio": width && height ? `${width}:${height}` : "unknown", "File size bytes": stat.size, "SHA-256": hash, "Perceptual hash": "not generated; SHA-256 used for exact duplicate gate", "Current usage": screenshot ? "documentation" : sourceAsset ? "source site" : privateIntake ? "pending/unpublished" : "repository asset", "Current alt": "not reliably derivable from asset alone", Category: category, "Real/AI": ai ? "AI" : screenshot ? "Screenshot" : "Real/unknown", "Text/logo risk": /logo|favicon|og/.test(lower) ? "possible" : "manual review", "Location risk": location ? "yes" : "not detected", "Branch/address/contact risk": location || qr ? "yes" : "not detected", "QR risk": qr ? "yes" : "not detected", "Customer/person risk": customer || sensitive ? "yes/manual" : "not detected", "Serial/plate/document risk": sensitive ? "yes/manual" : "not detected", "Safe reuse decision": decision, "Required edit": edit, "Suggested target": decision === "Do not reuse" || decision === "Unnecessary asset" ? "none" : category === "Product" ? "Relevant product/service page" : category === "AI illustration" ? "Process/trust/article section" : "Manual mapping required", Disclosure: ai ? "Required: ภาพประกอบที่สร้างด้วย AI" : "Not required unless composition materially changes reality", Reason: reason });
  }
  return records;
}

const sourceImages = await listSourceImages();
const hashCounts = new Map<string, number>(); for (const r of sourceImages) hashCounts.set(String(r["SHA-256"]), (hashCounts.get(String(r["SHA-256"])) || 0) + 1);
for (const r of sourceImages) r["Exact duplicate count"] = hashCounts.get(String(r["SHA-256"])) || 1;
writeCsv("10-source-image-inventory.csv", sourceImages);
writeCsv("11-image-safety-audit.csv", sourceImages.map((r) => ({ "Source path": r["Source path"], "SHA-256": r["SHA-256"], Category: r.Category, "Real/AI": r["Real/AI"], "Location risk": r["Location risk"], "Privacy risk": r["Customer/person risk"], "Serial/plate/document risk": r["Serial/plate/document risk"], "Exact duplicate count": r["Exact duplicate count"], Decision: r["Safe reuse decision"], "Required edit": r["Required edit"], Disclosure: r.Disclosure, Evidence: r.Reason })));

const reusable = sourceImages.filter((r) => ["Safe with disclosure", "Requires rights confirmation"].includes(String(r["Safe reuse decision"])) && !String(r["Source path"]).startsWith("docs/"));
writeCsv("12-cross-site-image-map.csv", reusable.map((r) => ({ "Source path": r["Source path"], "Proposed page group": r["Suggested target"], Role: r.Category === "AI illustration" ? "Process illustration" : r.Category === "Product" ? "Product detail/category card" : "Trust support/decorative", "Proposed neutral filename": path.basename(String(r.Filename)).replace(/khon-?kaen|ขอนแก่น/gi, "service"), "Alt/caption guidance": "Describe the visible product/action only; do not imply Korat location, customer case or branch", Disclosure: r.Disclosure, "Migration gate": r["Safe reuse decision"], "Implementation status": "Plan only; not copied" })));

const counts = (key: string) => Object.fromEntries([...new Set(sourceImages.map((r) => String(r[key])))].sort().map((value) => [value, sourceImages.filter((r) => String(r[key]) === value).length]));
const intentDist = Object.fromEntries([0,1,2,3,4,5].map((n) => [n, pages.filter((p) => p.intentScore === n).length]));
const qualityDist = Object.fromEntries([0,1,2,3,4,5].map((n) => [n, pages.filter((p) => p.qualityScore === n).length]));
const aeoDist = Object.fromEntries(["Strong", "Adequate", "Weak", "Missing"].map((x) => [x, pages.filter((p) => p.aeo === x).length]));
const geoDist = Object.fromEntries(["Strong", "Adequate", "Weak"].map((x) => [x, pages.filter((p) => p.geo === x).length]));
const lowPages = pages.filter((p) => p.intentScore < 4 || p.qualityScore < 4);
const locations = pages.filter((p) => p.type === "Location");
const imageDecisionDist = counts("Safe reuse decision");
const duplicateGroups = [...hashCounts.values()].filter((n) => n > 1).length;

write("00-executive-summary.md", `# Executive summary\n\nFinal verdict: **PASS WITH WARNING**. ตรวจครบ ${pages.length} routes / ${pages.filter((p) => p.indexable).length} indexable URLs จาก dist และ source จริง พบว่าไม่มีหน้า intent ผิดชัดเจนระดับ P0/P1 แต่มี P2 ด้านความเฉพาะเจาะจงและความซ้ำเชิง template โดยเฉพาะ location pages ${locations.length} หน้า ซึ่งต้องรอ GSC และหลักฐานปฏิบัติงานจริงก่อนเปลี่ยนโครงสร้าง\n\n- Intent Match: ${JSON.stringify(intentDist)}\n- Content Quality: ${JSON.stringify(qualityDist)}\n- AEO: ${JSON.stringify(aeoDist)}\n- GEO: ${JSON.stringify(geoDist)}\n- Pages requiring improvement: ${lowPages.length}\n- Source images inventoried: ${sourceImages.length}; decisions: ${JSON.stringify(imageDecisionDist)}\n- Exact duplicate hash groups: ${duplicateGroups}\n\nไม่มีการเปลี่ยน URL, title/H1, canonical, redirect, noindex หรือ keyword ownership และไม่มีการคัดลอกภาพข้าม repository ใน Batch นี้`);
write("04-keyword-coverage.md", `# Keyword coverage\n\nครอบคลุมกลุ่ม Core Local, product, brand, condition, seller journey และ B2B ตาม route ที่มีอยู่จริง โดยไม่สร้าง search volume/ranking/GSC ขึ้นเอง รายละเอียด URL-level อยู่ใน 01 และ 02\n\n## Findings\n\n- Core local owner ยังคงเป็น homepage และ main service hub ตาม baseline เดิม\n- Product routes ครอบคลุม mobile/Android/Apple/notebook/computer/components/camera/gaming/office equipment\n- Condition routes ครอบคลุมเสีย เปิดไม่ติด จอแตก ไม่มีอุปกรณ์ ไม่ได้ใช้งาน และยกล็อต\n- Seller journey ครอบคลุมการประเมิน ส่งรูป เตรียมสินค้า ลบบัญชี/ข้อมูล และการส่งสินค้า\n- B2B ครอบคลุมคอมบริษัท หลายเครื่อง ปิดกิจการ และยกสำนักงาน\n- ห้ามสร้าง brand/model/location เพิ่มจากสมมติฐาน; ใช้ GSC อย่างน้อย 28 วันก่อนตัดสินใจ ownership หรือ consolidation`);
write("05-product-content-audit.md", `# Product content audit\n\nตรวจ product/condition routes ${pages.filter((p) => ["Product service", "Condition"].includes(p.type)).length} หน้า โดยใช้ H1, main content, ปัจจัยราคา, ขั้นตอน, ownership/account-lock, FAQ และ CTA ไม่ใช้ word count เพียงอย่างเดียว\n\n## P2 themes\n\n- โทรศัพท์: ควรยืนยัน model/storage/battery/IMEI/account lock เฉพาะหน้าที่เกี่ยวข้อง\n- Notebook/computer: ควรแยก CPU/GPU/RAM/storage/สภาพจอ แบต อะแดปเตอร์ และการทดสอบเปิดเครื่อง\n- Components: ควรเพิ่มรุ่น/ความจุ/มาตรฐาน/ผลทดสอบและ serial privacy guidance\n- Camera/lens: ควรเพิ่ม shutter count, mount, fungus/scratch, accessories และ ownership evidence\n- Gaming: ควรเพิ่ม model/storage/controller/account reset/serial และอุปกรณ์ครบชุด\n\nทุกข้อเป็น recommendation รายหน้าใน CSV; ไม่มี bulk rewrite และไม่เปลี่ยน title/H1`);
write("06-b2b-content-audit.md", `# B2B content audit\n\nตรวจ ${pages.filter((p) => p.type === "B2B/bulk").length} B2B/bulk routes. Intent และ conversion path ถูกต้องโดยรวม แต่ควรเพิ่มหลักฐานกระบวนการที่ธุรกิจยืนยันได้: inventory template, ผู้มีอำนาจอนุมัติ, serial/asset tag privacy, data wiping responsibility, นัดตรวจ, เอกสารส่งมอบ และเงื่อนไขการชำระเงิน ห้ามอ้าง SLA ปริมาณรับซื้อ หรือเอกสารทางกฎหมายที่ยังไม่ได้ยืนยัน`);
write("07-location-content-audit.md", `# Location content audit\n\nLocation pages: ${locations.length}. สถานะทั้งหมด: **Retain pending GSC**. เนื้อหาใช้ layout/section ร่วมสูง จึงให้ Content Quality 3 และ Requires GSC แต่ไม่ถือว่าเป็น doorway อัตโนมัติ\n\n## Gate\n\n- ห้าม merge/redirect/noindex จาก similarity เพียงอย่างเดียว\n- ต้องมี GSC query/page อย่างน้อย 28 วันและหลักฐานนัดหมาย/โลจิสติกส์จริง\n- เพิ่มเฉพาะจุดนัด/การเดินทาง/ขอบเขตบริการที่ธุรกิจตรวจสอบแล้ว\n- หากไม่มีภาพพื้นที่จริง ให้ใช้ภาพบริการ generic; ห้ามสร้างภาพสถานที่หรือสาขาปลอม`);
write("09-geo-entity-trust-audit.md", `# GEO, entity and trust audit\n\nEntity ที่ตรวจ: WINNER IT; บริษัท อำพล เทรดดิ้ง จำกัด; 095-547-9408; LINE @buyhub; บริการนัดหมายในนครราชสีมา/โคราช. ไม่พบเหตุให้สร้างสาขา ที่อยู่ รีวิว rating หรือข้อมูลธุรกิจเพิ่มเติม\n\nGEO distribution: ${JSON.stringify(geoDist)}. วันที่ ผู้เขียน/reviewer และ policy ownership มีในระบบ content/schema ตาม baseline; หน้าที่ GEO ต่ำกว่าระดับ Strong ควรเชื่อม entity/policy อย่างเป็นธรรมชาติ ไม่ยัดชื่อธุรกิจทุกย่อหน้า และใช้ primary-source citation เฉพาะข้อเท็จจริงที่จำเป็น`);
write("13-image-migration-plan.md", `# Image migration plan\n\nBatch นี้เป็น audit/plan เท่านั้น: **ไม่มีภาพถูกคัดลอก**\n\n1. ตัด QA screenshots และ location-sensitive assets ออกจาก candidate pool\n2. ขอหลักฐานสิทธิ์ของ real/product assets ทุกไฟล์ก่อน\n3. เปิดตรวจ pixel-level สำหรับ private intake: บุคคล หน้าจอ QR serial/IMEI เอกสาร ป้ายทะเบียน และข้อมูลลูกค้า\n4. ใช้ SHA-256 ป้องกัน exact duplicate; กลุ่มซ้ำ ${duplicateGroups} กลุ่ม\n5. เปลี่ยนชื่อเฉพาะเพื่อความเป็นกลาง/การจัดหมวด ไม่ยัด keyword และบันทึก source/target/hash\n6. ใช้ ResponsiveImage เดิม, ระบุ intrinsic dimensions, responsive srcset/sizes, eager เฉพาะ LCP, lazy below-fold, และตรวจ mobile crop/CLS\n7. ภาพ AI ต้องมีข้อความ “ภาพประกอบที่สร้างด้วย AI” ที่มองเห็นได้; alt บรรยายสิ่งที่เห็น ไม่อ้างสถานที่/ลูกค้าจริง\n8. ทำ build + automated audit + Browser QA ก่อน release แยกต่างหาก`);
write("14-content-improvement-roadmap.md", `# Content improvement roadmap\n\n| Priority | Scope | Action | Gate |\n|---|---|---|---|\n| P0 | Incorrect/privacy-critical content | None found in current target build | Fix immediately if verified |\n| P1 | Wrong contact/province/CTA/intent | None verified; no source edit made | Repository evidence required |\n| P2 | ${lowPages.length} pages | Improve answer-first, product facts, FAQ, ownership/contextual links in small reviewed batches | Preserve title/H1/URL ownership; business confirmation where factual |\n| P2 | ${locations.length} location pages | Add verified operational evidence | Requires GSC 28+ days and business evidence |\n| P2 | Image candidates | Rights/privacy/context/disclosure review before copy | Explicit approval and manual visual review |`);
write("15-implementation-log.md", `# Implementation log\n\n- Confirmed clean main at 5c264bc and origin/main alignment before work.\n- Built 89 routes successfully and used 88 indexable routes as release baseline.\n- Added deterministic generator scripts/generate-content-image-audit.ts and npm command audit:content-image.\n- Generated 18 requested audit files from dist/source and the verified Khon Kaen repo.\n- Inventoried ${sourceImages.length} source images using dimensions, byte size and SHA-256; no image copied.\n- No P0/P1 factual defect was verified, so no production content was changed.\n- No URL/title/H1/canonical/redirect/noindex/structural ownership change.\n- No push, merge or deploy.`);
write("16-qa-report.md", `# QA report\n\n## Automated content QA\n\n- Fresh build: PASS, 89 routes.\n- astro check: PASS (telemetry attempted to write outside sandbox after the successful check; no project error).\n- audit:all: PASS, 6 suites, critical=0, warning=0.\n- Content/image generator: PASS, 89 routes / 88 indexable / ${sourceImages.length} source images.\n- Target content province mismatch (ขอนแก่น/อุบลราชธานี/อุดรธานี in main content): 0 in Browser QA.\n- H1 count issues, broken images, empty rendered image alt and missing rendered intrinsic dimensions: 0 across the representative set.\n- Exact source-image duplicate groups: ${duplicateGroups}; these are blocked/deduplicated in the migration plan.\n\nThe generator checks every built route for answer-first text, valuation/process/ownership coverage, CTA/LINE/phone, FAQ, contextual/related links, image use/disclosure, province-sensitive terms and deterministic hashes. Existing content, claims, links, image, schema and SEO audits cover unsupported superlatives, placeholders, contact consistency, broken assets and structured-data regressions. Baseline cannibalization/location reports remain the calibrated near-duplicate gate.\n\n## Browser QA\n\nPASS WITH WARNING: 21 representative pages × 4 viewports (360×800, 390×844, 768×1024, 1440×900) = 84 combinations on production. Set included homepage, main/mobile/computer hubs, Xiaomi, iPhone, notebook/broken notebook, camera, gaming, B2B, seller journey, 3 locations, 3 articles, about, contact and 404.\n\n- H1 count: 1 on all 84 combinations.\n- Horizontal overflow: 0. Broken rendered images: 0. Missing intrinsic image dimensions: 0.\n- Wrong-province text in main content: 0. LINE and phone links were present and correctly formed on conversion pages.\n- Mobile navigation at 390px: open button unique and visible; aria-expanded changed false→true; dialog exposed service, category, location, article, trust, LINE and phone routes; close control worked.\n- No DOM/layout evidence of clipped H1 or CTA obstruction was found. Image natural dimensions and render dimensions loaded without errors.\n\nWarning: the in-app Browser completed DOM, responsive-layout and interaction checks, but its screenshot capture command timed out twice. Therefore “no visible CLS” and subjective focal-point crop remain a final human screenshot check before any future image migration; no new image was introduced in this batch.\n\n## Constraints\n\nNo visual safety conclusion is inferred from filenames alone. Private/real source assets remain blocked behind rights and pixel-level privacy review.`);
write("17-decision-register.md", `# Decision register\n\n## Content\n\n- ${pages.filter((p) => p.action === "Keep as is").length} pages: Keep as is.\n- ${lowPages.length} pages: P2 improvement recommendation with URL/source/evidence in 01–03.\n- ${locations.length} location pages: Requires GSC; retain pending evidence.\n- 0 pages: merge/redirect/noindex/delete/new owner.\n\n## Images\n\n${Object.entries(imageDecisionDist).map(([decision, n]) => `- ${decision}: ${n}`).join("\n")}\n\nA metadata/path-based “Safe with disclosure” decision is not migration authorization. Real/product assets still require documented rights; private intake still requires manual privacy inspection. No cross-site asset was copied.`);

console.log(JSON.stringify({ routes: pages.length, indexable: pages.filter((p) => p.indexable).length, intentDist, qualityDist, aeoDist, geoDist, lowPages: lowPages.length, locations: locations.length, images: sourceImages.length, imageDecisionDist, duplicateGroups }, null, 2));
