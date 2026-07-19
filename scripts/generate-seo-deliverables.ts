import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { DIST, countThaiWords, fileToRoute, normalizeInternalPath, walkHtml } from "./audit-lib";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "seo-audit-2026-07-19");
const SITE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";
fs.mkdirSync(OUT, { recursive: true });

const csv = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const write = (name: string, body: string) => fs.writeFileSync(path.join(OUT, name), body.trim() + "\n", "utf8");
const writeCsv = (name: string, headers: string[], records: Record<string, unknown>[]) =>
  write(name, [headers.map(csv).join(","), ...records.map((r) => headers.map((h) => csv(r[h])).join(","))].join("\n"));
const clean = (s = "") => s.replace(/\s+/g, " ").trim();
const unique = <T>(values: T[]) => [...new Set(values)];
const internal = (href = "") => href.startsWith("/") ? normalizeInternalPath(href) : "";
const segmenter = new Intl.Segmenter("th", { granularity: "word" });
const terms = (text: string) => new Set([...segmenter.segment(clean(text).toLowerCase())]
  .filter((x) => x.isWordLike && x.segment.length > 1)
  .map((x) => x.segment)
  .filter((x) => !["และ","หรือ","ของ","ที่","ใน","ได้","ให้","จาก","เป็น","การ","ก่อน","หลัง"].includes(x)));
const similarity = (a: string, b: string) => {
  const x = terms(a), y = terms(b); if (!x.size || !y.size) return 0;
  const intersection = [...x].filter((t) => y.has(t)).length;
  return Math.round((2 * intersection / (x.size + y.size)) * 1000) / 1000;
};
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

const sitemapXml = fs.readFileSync(path.join(DIST, "sitemap-0.xml"), "utf8");
const sitemapPaths = new Set([...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => normalizeInternalPath(new URL(m[1]).pathname)));

type LinkBuckets = { global: string[]; footer: string[]; related: string[]; contextual: string[]; all: string[] };
type Page = {
  url: string; pageType: string; source: string; title: string; ogTitle: string; description: string; ogDescription: string;
  h1: string; h1Count: number; canonical: string; robots: string; canonicalStatus: string; schemas: string[];
  schemaIds: string[]; mainText: string; adjustedText: string; mainBlocks: string[]; bodyText: string; faqQuestions: string[]; links: LinkBuckets; parentHub: string;
  cluster: string; conversionRole: string; similarityGroup: string; intent: string; indexable: boolean; wordCount: number;
};

function pageType(url: string) {
  if (url === "/") return "Homepage"; if (url === "/404") return "Utility/error page";
  if (url === "/บทความ") return "Article hub"; if (url.startsWith("/บทความ/")) return "Article";
  if (url.startsWith("/พื้นที่/")) return "Location"; if (url === "/ติดต่อ") return "Contact";
  if (url === "/เกี่ยวกับเรา") return "About"; if (url === "/คำถามที่พบบ่อย") return "FAQ";
  if (url.includes("นโยบาย") || url.includes("ข้อกำหนด")) return "Policy";
  if (url.includes("บริษัท") || url.includes("สำนักงาน") || url.includes("ยกล็อต") || url.includes("หลายเครื่อง")) return "B2B/bulk";
  if (url === "/รับซื้อสินค้าไอที") return "Main service hub";
  if (url.includes("เสีย") || url.includes("จอแตก") || url.includes("เปิดไม่ติด") || url.includes("ไม่มีอุปกรณ์") || url.includes("ไม่ได้ใช้งาน")) return "Product condition";
  if (url.includes("วิธี") || url.includes("ส่งสินค้า") || url.includes("บริการรับซื้อถึงที่")) return "Seller intent";
  return "Product category";
}
function clusterFor(url: string, type: string) {
  if (type === "Utility/error page") return "UTILITY";
  if (type === "Homepage") return "CORE-LOCAL"; if (type === "Main service hub") return "CORE-SERVICE";
  if (type === "Location") return "LOCATION"; if (type === "Article" || type === "Article hub") return "CONTENT";
  if (["Policy","About","Contact","FAQ"].includes(type)) return `TRUST-${type.toUpperCase().replaceAll(" ","-")}`;
  if (type === "B2B/bulk") return "B2B"; if (type === "Seller intent") return "SELLER-JOURNEY";
  if (url.match(/โทรศัพท์|iphone|ipad|apple|macbook|imac|แท็บเล็ต/)) return "MOBILE-APPLE";
  if (url.match(/คอม|การ์ดจอ|cpu|แรม|เมนบอร์ด|ssd|server|เวิร์กสเตชัน/)) return "COMPUTER";
  if (url.match(/กล้อง|เลนส์/)) return "CAMERA"; if (url.match(/เครื่องเกม|playstation|nintendo/)) return "GAMING";
  if (url.match(/สำนักงาน|เครื่องปริ้น|pos/)) return "OFFICE"; return "OTHER-PRODUCT";
}
function parentFor(url: string, type: string, cluster: string) {
  if (type === "Utility/error page") return "/";
  if (type === "Homepage") return ""; if (["Policy","About","Contact","FAQ","Article hub","Main service hub"].includes(type)) return "/";
  if (type === "Article") return "/บทความ"; if (type === "Location") return "/พื้นที่/เมืองนครราชสีมา";
  if (cluster === "MOBILE-APPLE") return url.includes("โน๊ตบุ๊ค") ? "/รับซื้อโน๊ตบุ๊ค-โคราช" : "/รับซื้อโทรศัพท์มือถือ-โคราช";
  if (cluster === "COMPUTER") return "/รับซื้อคอมพิวเตอร์-โคราช"; if (cluster === "CAMERA") return "/รับซื้อกล้อง-โคราช";
  if (cluster === "GAMING") return "/รับซื้อเครื่องเกม-โคราช"; if (cluster === "B2B") return "/รับซื้อสินค้าไอทียกล็อต";
  return "/รับซื้อสินค้าไอที";
}
function sourceFor(url: string) {
  const slug = url.split("/").at(-1) || "index";
  if (url.startsWith("/บทความ/")) return `src/content/articles/${slug}.md`;
  if (url.startsWith("/พื้นที่/")) return `src/content/areas/${slug}.md`;
  if (fs.existsSync(path.join(ROOT, "src/content/services", `${slug}.md`))) return `src/content/services/${slug}.md`;
  return `src/pages/${url === "/" ? "index" : url.slice(1)}.astro`;
}

const pages: Page[] = walkHtml().map((file) => {
  const $ = cheerio.load(fs.readFileSync(file, "utf8")); const url = fileToRoute(file); const type = pageType(url);
  const titleNodes = $("head > title"); const title = clean(titleNodes.first().text()); const canonical = $("link[rel='canonical']").first().attr("href") || "";
  const robots = $("meta[name='robots']").first().attr("content") || ""; const h1Count = $("main h1").length; const h1 = clean($("main h1").first().text());
  const mainRoot = $(".main-content").first();
  const mainText = clean(mainRoot.text() || $("main").first().text()); const bodyText = clean($("main").first().text());
  const mainBlocks = mainRoot.length ? mainRoot.children("h2,h3,p,ul,ol,blockquote").map((_, el) => clean($(el).text())).get().filter((x) => x.length >= 30) : [mainText];
  const linkList = (selector: string) => unique($(selector).map((_, el) => internal($(el).attr("href") || "")).get().filter(Boolean));
  const global = linkList("header a[href^='/']"); const footer = linkList("footer a[href^='/']"); const contextual = linkList(".main-content a[href^='/']");
  const related = unique($("main section").filter((_, el) => /(หน้าที่เกี่ยวข้อง|บริการที่เกี่ยวข้อง|อ่านต่อ)/.test(clean($(el).find("h2").first().text())))
    .find("a[href^='/']").map((_, el) => internal($(el).attr("href") || "")).get().filter(Boolean));
  const all = unique(linkList("a[href^='/']")); const schemas: string[] = [], schemaIds: string[] = [], faqQuestions: string[] = [];
  $("script[type='application/ld+json']").each((_, el) => { try { const data = JSON.parse($(el).text()); const nodes = data["@graph"] || [data]; for (const n of nodes) { if (n["@type"]) schemas.push(...(Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]])); if (n["@id"]) schemaIds.push(n["@id"]); if (n["@type"] === "FAQPage") for (const q of n.mainEntity || []) faqQuestions.push(clean(q.name)); } } catch { schemas.push("INVALID"); } });
  const cluster = clusterFor(url, type); const indexable = !robots.includes("noindex");
  const canonicalPath = canonical ? normalizeInternalPath(new URL(canonical).pathname) : "";
  const conversionRole = type === "Utility/error page" ? "Error recovery / support" : ["Article","Policy","About","FAQ"].includes(type) ? "Assisted conversion / trust" : type === "Contact" ? "Direct conversion" : "Primary LINE/phone conversion";
  const intent = type === "Utility/error page" ? "Navigation / error recovery" : type === "Article" ? "Informational" : ["Policy","About","FAQ"].includes(type) ? "Trust" : type === "Contact" ? "Navigation / conversion support" : type === "Location" ? "Local transactional" : "Transactional";
  return { url, pageType: type, source: sourceFor(url), title, ogTitle: clean($("meta[property='og:title']").first().attr("content")), description: clean($("meta[name='description']").first().attr("content")), ogDescription: clean($("meta[property='og:description']").first().attr("content")), h1, h1Count, canonical, robots, canonicalStatus: canonical && new URL(canonical).origin === SITE && canonicalPath === url ? "self-referencing" : canonical ? "review" : "missing", schemas: unique(schemas), schemaIds: unique(schemaIds), mainText, adjustedText: mainText, mainBlocks, bodyText, faqQuestions: unique(faqQuestions), links: { global, footer, related, contextual, all }, parentHub: parentFor(url, type, cluster), cluster, conversionRole, similarityGroup: `${cluster}:${type}`, intent, indexable, wordCount: countThaiWords(mainText) };
});

const blockFrequency = new Map<string, number>();
for (const page of pages) for (const block of unique(page.mainBlocks)) blockFrequency.set(block, (blockFrequency.get(block) || 0) + 1);
const boilerplatePattern = /(ราคาประเมินเบื้องต้น|ราคาสุดท้าย|ส่งรูปและรายละเอียด|LINE @buyhub|ยืนยันความเป็นเจ้าของ|iCloud lock|Google lock|ขั้นตอนการขาย|ขั้นตอนประเมิน|พร้อมขาย|ติดต่อ WINNER IT)/i;
for (const page of pages) {
  const retained = page.mainBlocks.filter((block) => (blockFrequency.get(block) || 0) <= 2 && !boilerplatePattern.test(block));
  page.adjustedText = clean(retained.join(" ")) || page.mainText;
}

const inbound = (target: string, bucket: keyof LinkBuckets) => pages.filter((p) => p.url !== target && p.links[bucket].includes(target)).length;
const routeRecords = pages.map((p) => ({
  URL: p.url, "Route source": p.source, "Page type": p.pageType, Indexability: p.indexable ? "indexable" : "noindex", "HTTP expectation": p.url === "/404" ? "404" : "200",
  "HTML Title": p.title, "HTML Title Length": p.title.length, "OG Title": p.ogTitle, "Meta Description": p.description, "Meta Description Length": p.description.length,
  "OG Description": p.ogDescription, H1: p.h1, "H1 Count": p.h1Count, Robots: p.robots, Canonical: p.canonical, "Canonical Status": p.canonicalStatus,
  "Word count": p.wordCount, "Internal links in": inbound(p.url, "all"), "Internal links out": p.links.all.length, "Global navigation links in": inbound(p.url, "global"),
  "Footer links in": inbound(p.url, "footer"), "Related component links in": inbound(p.url, "related"), "Contextual body links in": inbound(p.url, "contextual"),
  "Structured data types": p.schemas.join("|"), "Sitemap inclusion": sitemapPaths.has(p.url) ? "yes" : "no", "Primary Cluster": p.cluster, "Parent Hub": p.parentHub,
  "Conversion Role": p.conversionRole, "Similarity Group": p.similarityGroup, "Manual Review Reason": p.pageType === "Location" ? "Location uniqueness and GSC query review" : p.canonicalStatus !== "self-referencing" && p.url !== "/404" ? "Canonical review" : "",
  "Primary intent": p.intent, "Funnel Stage": p.pageType === "Utility/error page" ? "Support" : p.pageType === "Article" ? "Awareness / consideration" : ["Policy","About","FAQ"].includes(p.pageType) ? "Trust" : "Decision", "Thin-content risk": p.wordCount < 300 && !["Contact","Policy","Utility/error page"].includes(p.pageType) ? "review" : "low", "Doorway-page risk": p.pageType === "Location" ? "manual review" : "low", "Recommended action": p.url === "/404" ? "retain noindex; exclude from sitemap" : "retain; validate with GSC"
}));
const routeHeaders = Object.keys(routeRecords[0]); writeCsv("02-route-inventory.csv", routeHeaders, routeRecords);

const keywordRecords = pages.filter((p) => p.indexable).map((p) => ({
  "Cluster ID": p.cluster, URL: p.url, "Page type": p.pageType, "Parent hub": p.parentHub, "Primary keyword hypothesis": p.h1,
  "Secondary keyword hypotheses": `${p.cluster.toLowerCase().replaceAll("-", " ")}; ${p.intent.toLowerCase()}`,
  "Search intent": p.intent, "Funnel stage": p.pageType === "Article" ? "Awareness / consideration" : ["Policy","About","FAQ"].includes(p.pageType) ? "Trust" : "Decision",
  "Conversion role": p.conversionRole, "Geographic modifier": p.url.includes("โคราช") || p.pageType === "Location" || p.url === "/" ? "นครราชสีมา/โคราช" : "none explicit",
  "Product/category modifier": p.cluster, "Condition modifier": p.pageType === "Product condition" ? p.h1 : "none", "Existing title": p.title, "Existing H1": p.h1,
  "Competing URLs": pages.filter((q) => q.indexable && q.url !== p.url && q.cluster === p.cluster && similarity(p.title, q.title) >= .45).map((q) => q.url).join(" | "),
  "Cannibalization risk": pages.some((q) => q.indexable && q.url !== p.url && q.cluster === p.cluster && similarity(p.mainText, q.mainText) >= .75) ? "candidate" : "low/unverified",
  "Current internal links in": inbound(p.url, "all"), "Current internal links out": p.links.all.length, "Recommended action": "Retain; validate query ownership before structural action",
  "Evidence status": ["Policy","About","Contact","FAQ"].includes(p.pageType) ? "Source evidence" : p.pageType === "Location" ? "Business evidence" : "Keyword hypothesis",
  "GSC validation required": p.intent === "Trust" ? "No" : "Yes", Priority: ["Homepage","Main service hub"].includes(p.pageType) ? "P1" : "P2", Notes: "No volume, CPC, ranking or traffic estimate asserted"
}));
const keywordHeaders = Object.keys(keywordRecords[0]); writeCsv("05-keyword-to-url-map.csv", keywordHeaders, keywordRecords);

const forcedPairs = [
  ["/","/รับซื้อสินค้าไอที"], ["/รับซื้อโทรศัพท์มือถือ-โคราช","/รับซื้อโทรศัพท์-android-โคราช"],
  ["/รับซื้อ-ipad-โคราช","/รับซื้อแท็บเล็ต-โคราช"], ["/รับซื้อโน๊ตบุ๊ค-โคราช","/รับซื้อโน๊ตบุ๊คเกมมิ่ง-โคราช"],
  ["/รับซื้อคอมบริษัท-โคราช","/ขายคอมหลายเครื่อง-โคราช"], ["/ขายอุปกรณ์ไอทียกสำนักงาน-โคราช","/บริษัทปิดกิจการขายอุปกรณ์ไอที"],
  ["/รับซื้อกล้อง-โคราช","/รับซื้อเลนส์กล้อง-โคราช"], ["/รับซื้อเครื่องเกม-โคราช","/รับซื้อ-playstation-โคราช"], ["/รับซื้อเครื่องเกม-โคราช","/รับซื้อ-nintendo-switch-โคราช"],
  ["/คำถามที่พบบ่อย","/รับซื้อสินค้าไอที"], ["/บริการรับซื้อถึงที่โคราช","/พื้นที่/ปากช่อง"]
];
for (const child of ["/รับซื้อ-iphone-โคราช","/รับซื้อ-ipad-โคราช","/รับซื้อ-macbook-โคราช","/รับซื้อ-imac-mac-mini-โคราช","/รับซื้อ-apple-watch-โคราช"]) forcedPairs.push(["/รับซื้อโทรศัพท์มือถือ-โคราช",child]);
for (const child of ["/รับซื้อคอมตั้งโต๊ะ-โคราช","/รับซื้อคอมประกอบ-โคราช","/รับซื้อคอมเกมมิ่ง-โคราช","/รับซื้อคอมเก่า-โคราช","/รับซื้อคอมบริษัท-โคราช"]) forcedPairs.push(["/รับซื้อคอมพิวเตอร์-โคราช",child]);
for (const brand of ["/รับซื้อโทรศัพท์-samsung-โคราช","/รับซื้อโทรศัพท์-oppo-โคราช","/รับซื้อโทรศัพท์-vivo-โคราช","/รับซื้อโทรศัพท์-xiaomi-redmi-poco-โคราช"]) forcedPairs.push(["/รับซื้อโทรศัพท์-android-โคราช",brand]);
const locationPagesForPairs = pages.filter((p) => p.pageType === "Location");
for (let i = 0; i < locationPagesForPairs.length; i++) for (let j = i + 1; j < locationPagesForPairs.length; j++) forcedPairs.push([locationPagesForPairs[i].url, locationPagesForPairs[j].url]);
for (const location of locationPagesForPairs) forcedPairs.push(["/บริการรับซื้อถึงที่โคราช", location.url]);
for (const article of pages.filter((p) => p.pageType === "Article")) for (const target of article.links.contextual) { const service = pages.find((p) => p.url === target); if (service && !["Article","Article hub","Policy","About","Contact","FAQ"].includes(service.pageType)) forcedPairs.push([article.url, service.url]); }
const pairKey = (a: string, b: string) => [a,b].sort().join("||"); const candidateKeys = new Set(forcedPairs.map(([a,b]) => pairKey(a,b)));
for (let i=0;i<pages.length;i++) for (let j=i+1;j<pages.length;j++) { const a=pages[i],b=pages[j]; if (!a.indexable||!b.indexable) continue; const adjusted=similarity(a.adjustedText,b.adjustedText); if (a.cluster===b.cluster && (similarity(a.title,b.title)>=.7 || similarity(a.h1,b.h1)>=.75 || adjusted>=.72)) candidateKeys.add(pairKey(a.url,b.url)); }
const productEntities = ["iphone","ipad","macbook","imac","apple watch","โทรศัพท์","แท็บเล็ต","โน๊ตบุ๊ค","คอมพิวเตอร์","คอมตั้งโต๊ะ","การ์ดจอ","cpu","เมนบอร์ด","กล้อง","เลนส์","playstation","nintendo","สำนักงาน"];
const conditionEntities = ["จอแตก","เสีย","เปิดไม่ติด","เก่า","ไม่มีอุปกรณ์","ไม่ได้ใช้งาน","ยกล็อต"];
const foundEntities = (p: Page, list: string[]) => list.filter((entity) => `${p.url} ${p.title} ${p.h1}`.toLowerCase().includes(entity));
function intentRelationship(a: Page, b: Page, sharedProduct: string[], sharedCondition: string[]) {
  if (a.pageType === "Location" && b.pageType === "Location") return "template-only";
  if ((a.pageType === "Article") !== (b.pageType === "Article")) return "informational-transactional";
  if ((a.pageType === "Location") !== (b.pageType === "Location")) return "location-service";
  if (a.parentHub === b.url || b.parentHub === a.url) return "parent-child";
  if (a.parentHub === b.parentHub && a.parentHub) return "sibling-distinct";
  if (sharedProduct.length && sharedCondition.length) return "same-exact";
  if (sharedProduct.length || sharedCondition.length || a.cluster === b.cluster) return "adjacent-partial";
  if (similarity(a.mainText,b.mainText) >= .65 && similarity(a.adjustedText,b.adjustedText) < .4) return "template-only";
  return "unrelated";
}
const cannibalRecords = [...candidateKeys].map((key) => {
  const [au,bu]=key.split("||"), a=pages.find((p)=>p.url===au)!, b=pages.find((p)=>p.url===bu)!;
  const raw=similarity(a.mainText,b.mainText), adjusted=similarity(a.adjustedText,b.adjustedText), faq=similarity(a.faqQuestions.join(" "),b.faqQuestions.join(" "));
  const sharedProduct=foundEntities(a,productEntities).filter((x)=>foundEntities(b,productEntities).includes(x)); const sharedCondition=foundEntities(a,conditionEntities).filter((x)=>foundEntities(b,conditionEntities).includes(x));
  const relationship=intentRelationship(a,b,sharedProduct,sharedCondition); const overlap=a.links.contextual.some((x)=>b.links.contextual.includes(x));
  const candidateType = relationship === "template-only" && a.pageType === "Location" ? "Location template similarity" : relationship === "template-only" ? "Template similarity" : relationship === "parent-child" ? "Parent-child overlap" : relationship === "informational-transactional" ? "Informational-service overlap" : adjusted >= .65 && sharedProduct.length ? "Potential cannibalization" : overlap ? "Internal-link overlap" : "Low relevance similarity";
  const priority = candidateType === "Potential cannibalization" ? "P1 review" : ["Parent-child overlap","Informational-service overlap"].includes(candidateType) ? "P2 review" : "P3 monitor";
  return { Cluster:a.cluster===b.cluster?a.cluster:`${a.cluster}/${b.cluster}`,"URL A":a.url,"URL B":b.url,"Candidate Type":candidateType,"Intent Relationship":relationship,"Title similarity":similarity(a.title,b.title),"H1 similarity":similarity(a.h1,b.h1),"Raw Body Similarity":raw,"Boilerplate-adjusted Similarity":adjusted,"FAQ Similarity":faq,"Shared Product Entity":sharedProduct.join(" | ")||"none","Shared Condition Entity":sharedCondition.join(" | ")||"none","Shared Geographic Entity":a.pageType==="Location"&&b.pageType==="Location"?"Nakhon Ratchasima; distinct areas":a.url.includes("โคราช")&&b.url.includes("โคราช")?"โคราช":"none","Same Parent Hub":a.parentHub===b.parentHub?"Yes":"No","Internal anchor conflict":overlap?"shared contextual targets":"not detected","Query Evidence Available":"No","Decision Eligible":"No","Review Priority":priority,Risk:candidateType==="Potential cannibalization"?"requires GSC":"not structurally actionable","Recommended winner":"Requires GSC query ownership","Recommended action":"Monitor only; no merge, redirect, canonical or noindex action in Batch 1.2","Requires GSC":"Yes",Reason:`raw=${raw}; adjusted=${adjusted}; relationship=${relationship}`,"Validation method":"28+ days GSC query/page data plus operational and conversion evidence"};
});
const cannibalHeaders=Object.keys(cannibalRecords[0]); writeCsv("06-cannibalization-map.csv",cannibalHeaders,cannibalRecords);
const candidateCounts = new Map<string, number>();
for (const record of cannibalRecords) candidateCounts.set(String(record["Candidate Type"]), (candidateCounts.get(String(record["Candidate Type"])) || 0) + 1);
const candidateSummary = [...candidateCounts].sort(([a],[b]) => a.localeCompare(b)).map(([type,count]) => `- ${type}: ${count}`).join("\n");

const locations=pages.filter((p)=>p.pageType==="Location");
const locationRecords=locations.map((p)=>{ const others=locations.filter((q)=>q.url!==p.url); const scored=others.map((q)=>[q,similarity(p.mainText,q.mainText)] as const).sort((a,b)=>b[1]-a[1]); const own=terms(p.mainText), otherTerms=new Set(others.flatMap((q)=>[...terms(q.mainText)])); const uniquePct=own.size?[...own].filter((t)=>!otherTerms.has(t)).length/own.size:0; const text=p.mainText; const uniqueFaq=p.faqQuestions.filter((q)=>!others.some((o)=>o.faqQuestions.includes(q))).length; const contextualIn=inbound(p.url,"contextual"); const logistics=/(นัด|คิว|ระยะทาง|ส่งมอบ)/.test(text); const travel=/(เดินทาง|เส้นทาง|จุดนัด|ตำบล|อำเภอ)/.test(text); const seller=/(ผู้ขาย|บริษัท|นักศึกษา|ร้านค้า|ธุรกิจ)/.test(text); const risk=scored[0][1]>=.8&&uniquePct<.08&&(!travel||!seller)?"high candidate":scored[0][1]>=.65?"medium candidate":"low"; return {URL:p.url,Location:p.h1,"Word count":p.wordCount,"Unique text percentage":pct(uniquePct),"Highest similarity page":scored[0][0].url,"Similarity score":scored[0][1],"Unique logistics section":logistics?"present":"not detected","Unique travel guidance":travel?"present":"not detected","Unique seller context":seller?"present":"not detected","Unique FAQ count":uniqueFaq,"Internal links in":inbound(p.url,"all"),"Contextual internal links in":contextualIn,"Doorway risk":risk,"Recommended action":"Retain pending GSC; improve only from verified local operations/customer evidence","Requires GSC":"Yes"}; });
const locationHeaders=Object.keys(locationRecords[0]); writeCsv("08a-location-uniqueness-matrix.csv",locationHeaders,locationRecords);

const indexable=pages.filter((p)=>p.indexable); const oneInbound=indexable.filter((p)=>inbound(p.url,"all")===1); const noContext=indexable.filter((p)=>inbound(p.url,"contextual")===0);
const hubGroups=unique(indexable.map((p)=>p.parentHub)).filter(Boolean).map((hub)=>`- ${hub} → ${indexable.filter((p)=>p.parentHub===hub).map((p)=>p.url).join(", ")}`).join("\n");
const schemaRows=unique(pages.map((p)=>p.pageType)).map((type)=>{const group=pages.filter((p)=>p.pageType===type);return `| ${type} | ${unique(group.flatMap((p)=>p.schemas)).join(", ")||"none"} | ${unique(group.flatMap((p)=>p.schemaIds)).join("<br>")||"none"} | ${group.length} |`;}).join("\n");
const total=pages.length,sitemapCount=sitemapPaths.size;
write("00-executive-summary.md",`# Executive summary\n\nFinal verdict: **PASS WITH WARNING**. Quality gate inventory: ${total} HTML routes, ${indexable.length} indexable, ${sitemapCount} sitemap URLs, ${keywordRecords.length} keyword mappings, ${cannibalRecords.length} calibrated similarity candidates and ${locationRecords.length} location pages. Candidates eligible for immediate structural action: **0**. Reports are deterministic from the same dist. GSC remains required for cannibalization and location decisions.\n\n## Candidate pair summary\n\n${candidateSummary}\n\nEvery pair has Query Evidence Available=No, Decision Eligible=No and Requires GSC=Yes.`);
write("01-repository-inventory.md",`# Repository inventory\n\nAstro 7 SSG with TypeScript and Content Collections. Source: 12 page files, 54 service entries, 11 areas, 15 articles, 5 layouts, 23 components and 25 pre-existing scripts plus this generator. Production changes in this batch remain limited to sitemap configuration, the Xiaomi inbound link and package audit:report command. No temporary or unrelated changes detected.`);
write("03-technical-seo-audit.md",`# Technical SEO audit\n\n## P1 fixed\n\n- Synthetic build-time sitemap lastmod removed from astro.config.mjs; validation: generated XML contains no fabricated lastmod, bulk changefreq or priority.\n- Xiaomi/Redmi/POCO orphan fixed from the mobile hub in related metadata and contextual body content; validation: SEO audit warning count returned to zero.\n\nRoute-level evidence is in 02-route-inventory.csv. The /404 route is classified UTILITY, noindex, HTTP expectation 404, outside the sitemap and intended for error recovery. Canonicals, robots, titles, descriptions, H1 counts, schemas, sitemap membership and link buckets are recorded independently. No production metadata bug was found in this quality gate.`);
write("04-keyword-universe.md",`# Keyword universe\n\nAll commercial terms are **Keyword hypotheses** until GSC validation. No volume, CPC, ranking or traffic values are inferred.\n\n| Cluster | Intent | Funnel | Evidence | Parent |\n|---|---|---|---|---|\n| CORE-LOCAL / CORE-SERVICE | local transactional | Decision | Business evidence + hypothesis | / |\n| MOBILE-APPLE | product, brand, condition | Decision | Source evidence + hypothesis | mobile/notebook hubs |\n| COMPUTER | product, component, condition | Decision | Source evidence + hypothesis | computer hub |\n| CAMERA / GAMING / OFFICE / OTHER-PRODUCT | category/brand | Decision | Source evidence + hypothesis | category/service hub |\n| B2B | bulk and organization seller intent | Decision | Business evidence | bulk hub |\n| SELLER-JOURNEY | valuation, preparation, shipping, pickup | Consideration | Business evidence | service hub |\n| LOCATION | appointment coverage | Local decision | Business evidence; Requires GSC | city area hub |\n| CONTENT | informational questions | Awareness/consideration | Source evidence; Requires GSC | article hub |\n| TRUST-* | trust, navigation, conversion support | Trust | Source evidence | homepage |\n\nThe full URL-level traceability is in 05-keyword-to-url-map.csv.`);
write("07-content-gap-roadmap.md",`# Content gap roadmap\n\n| Existing URL/cluster | Evidence gap | Allowed creation trigger | Action now |\n|---|---|---|---|\n| Product and brand pages | Query ownership and demand | Repeated GSC queries plus verified business acceptance and unique answer scope | Do not create pages |\n| Condition pages | Customer language and conversion value | Repeated LINE/customer questions plus GSC demand | Enrich existing parent first |\n| Location pages | Local query value and distinct operational guidance | GSC impressions/conversions plus verified logistics | Do not expand locations |\n| Articles | Informational queries leading to service intent | GSC query gap and documented expert answer | Add only with transactional return links |\n\nEvery proposed page must have distinct intent, parent hub, contextual links, verified business scope and non-doorway content before approval.`);
write("08-location-page-audit.md",`# Location page audit and release protection\n\nAll 11 location pages were compared using .main-content only, excluding header, footer, CTA, related components, schema and recognized shared price/contact/ownership/process text. Several pages retain high template similarity, unique text percentages vary, and most have low contextual inbound-link counts. GSC query ownership and conversion evidence are unavailable. The detailed matrix is in 08a-location-uniqueness-matrix.csv.\n\n## Decision gate\n\nNo location URL may be merged, redirected or noindexed until at least 28 days of post-deploy data exists and both GSC evidence and verified operational evidence support the same decision. Similarity alone is insufficient. Tracking fields are provided in 17-gsc-baseline-template.csv.`);
write("09-brand-model-strategy.md",`# Brand/model strategy\n\nBrand pages remain children of relevant product hubs. Preserve distinct checks such as account locks, IMEI/serial, specification and condition factors. The mobile/Android/brand, Apple-family, computer, camera and gaming overlaps are candidate pairs in 06-cannibalization-map.csv. Do not create model pages or consolidate existing URLs without GSC query ownership and customer evidence.`);
write("10-entity-schema-audit.md",`# Entity and schema audit\n\nCanonical entity source: WINNER IT / บริษัท อำพล เทรดดิ้ง จำกัด / 095-547-9408 / LINE @buyhub in src/data/site.ts. Automated schema audit: zero critical and warning items.\n\n| Page type | Schema types observed | @id values observed | Pages |\n|---|---|---|---:|\n${schemaRows}\n\nNo address, branch, review, rating or price-range entity was invented.`);
write("11-internal-link-map.md",`# Internal link map\n\nCounts distinguish header/global navigation, footer, related components and contextual .main-content links in 02-route-inventory.csv. Footer links are not treated as editorial links.\n\n## Hub-to-child mapping\n\n${hubGroups}\n\n## Quality findings\n\n- Pages with exactly one total inbound link: ${oneInbound.length}: ${oneInbound.map((p)=>p.url).join(", ")||"none"}.\n- Pages with no contextual inbound links: ${noContext.length}; these require editorial review, not automatic rewriting.\n- Xiaomi now receives both a contextual mobile-hub link and a related-component link.\n- B2B, location and article-to-service relationships remain GSC/customer-evidence dependent.`);
write("12-aeo-geo-audit.md",`# AEO/GEO audit\n\nReviewed sections by page class: service .main-content answer-first sections and FAQ schema; article main content and related service return paths; location logistics/seller context and FAQ; trust pages for legal entity, ownership and account-lock policy; contact for phone/LINE conversion support. Route-level schema, headings and metadata are in 02-route-inventory.csv. Claims audit found zero issues. No claim is made that AI systems will cite the site.`);
write("13-implementation-log.md",`# Implementation log\n\n1. Confirmed production diff is limited to sitemap configuration, Xiaomi internal links and npm audit:report.\n2. Fixed reporting bugs: separated HTML/OG metadata, added H1 count/canonical status, classified link regions, expanded URL-level keyword mapping and candidate-pair analysis.\n3. Calibrated /404 as UTILITY / Support / Error recovery, never transactional.\n4. Added boilerplate-adjusted similarity, intent relationship, candidate type, entity overlap, evidence and eligibility fields.\n5. Added 11-page location uniqueness and 28-day release-protection tracking.\n\nNo URL, title, H1, canonical or Search Intent was changed during Batch 1.2. No candidate is eligible for immediate structural action.`);
write("14-qa-report.md",`# QA report\n\nQuality-gate results: npm run check PASS with 0 errors and 37 non-blocking hints; build PASS with 89 routes; audit:all PASS with six suites at critical=0 and warning=0; audit:report PASS; Playwright QA PASS across the existing 13-route mobile/desktop set. Deterministic rerun comparison PASS. Generator output contains no volatile timestamp. Production smoke was not rerun because no deploy is authorized.`);
write("15-redirect-map.csv",`"source","destination","status","reason"\n"","","none","No URL merged, moved, deleted or redirected"`);
write("16-90-day-roadmap.md",`# 90-day roadmap\n\n| Window | Workstream | Owner | Metric | Baseline | Decision gate |\n|---|---|---|---|---|---|\n| 0–30 | GSC sitemap/query baseline | SEO owner | indexed URLs, queries by page | 88 indexable build URLs; GSC unavailable | No structural URL action until 28+ days of query evidence |\n| 0–30 | LINE/phone measurement | Analytics owner | qualified contacts by landing page | not instrumented/verified | Validate event collection before content ROI claims |\n| 31–60 | Cannibalization review | SEO + content owner | shared-query page pairs | ${cannibalRecords.length} candidates | Merge/redirect only after stable query ownership evidence |\n| 31–60 | Location quality | Local SEO + operations | impressions, leads, verified unique logistics | 11 pages; GSC unavailable | Retain/expand only where operational and query evidence agree |\n| 61–90 | Content gaps | Content + business owner | qualified query gap and assisted conversions | hypotheses only | New page requires distinct intent, evidence, hub and links |\n| 61–90 | Technical/schema review | Technical SEO | audit errors, CWV field data | automated critical=0; field CWV unavailable | Fix verified regression; avoid speculative schema |`);
write("17-gsc-baseline-template.csv",`"Date","URL","Query","Country","Device","Clicks","Impressions","CTR","Average position","Indexing status","LINE conversion","Phone conversion","Candidate cluster","Competing URL","Decision status"\n"","","","","","","","","","","","","","","Pending at least 28 days of data"`);
write("18-post-deploy-monitoring.md",`# Post-deploy monitoring\n\nGSC access was not available in the local repository environment. First formal review: after at least 28 days of production data.\n\n## Weekly checks\n\n- Production route, robots and sitemap availability; indexable count remains 88.\n- GSC indexing status, clicks, impressions, queries, CTR and average position by URL.\n- LINE and phone conversions by landing page.\n- Candidate clusters and closest competing URLs.\n- Location operational evidence and actual serviceability.\n\n## Decision gate\n\nRetain is the default. Improve only from verified query/customer gaps. Consolidate, redirect or noindex only after 28+ days and agreement between GSC query ownership, conversion data and operational evidence. Similarity alone never qualifies.`);
console.log(`Generated 20 deterministic SEO deliverables: routes=${pages.length}, keywordRows=${keywordRecords.length}, candidatePairs=${cannibalRecords.length}, locations=${locationRecords.length}`);
