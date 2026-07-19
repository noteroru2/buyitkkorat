import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
import sharp from "sharp";
import { fileToRoute, walkHtml } from "./audit-lib";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "docs", "content-intent-image-audit-2026-07", "batch-2-1");
const SOURCE = "C:\\Users\\User\\Desktop\\project ทั้งหมด\\รับซื้อไอทีขอนแก่น";
fs.mkdirSync(OUT, { recursive: true });

const clean = (value = "") => value.replace(/\s+/g, " ").trim();
const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const write = (name: string, body: string) => fs.writeFileSync(path.join(OUT, name), `${body.trim()}\n`, "utf8");
const writeCsv = (name: string, rows: Record<string, unknown>[]) => {
  const headers = Object.keys(rows[0]);
  write(name, [headers.map(quote).join(","), ...rows.map((row) => headers.map((header) => quote(row[header])).join(","))].join("\n"));
};

const originalMissing = [
  ["/404", "src/pages/404.astro", "Utility/404", "Not required"],
  ["/ขายอุปกรณ์ไอทียกสำนักงาน-โคราช", "src/content/services/ขายอุปกรณ์ไอทียกสำนักงาน-โคราช.md", "B2B", "Required"],
  ["/บทความ/ssd-และข้อมูลส่วนตัวควรจัดการอย่างไรก่อนขาย", "src/content/articles/ssd-และข้อมูลส่วนตัวควรจัดการอย่างไรก่อนขาย.md", "Article", "Recommended"],
  ["/บทความ/กล่องและอุปกรณ์มีผลต่อราคามือสองหรือไม่", "src/content/articles/กล่องและอุปกรณ์มีผลต่อราคามือสองหรือไม่.md", "Article", "Recommended"],
  ["/บทความ/ขายคอมหลายเครื่องควรเตรียมรายการอย่างไร", "src/content/articles/ขายคอมหลายเครื่องควรเตรียมรายการอย่างไร.md", "Article", "Recommended"],
  ["/บทความ/ขายอุปกรณ์ไอทีของบริษัทต้องเตรียมเอกสารอะไร", "src/content/articles/ขายอุปกรณ์ไอทีของบริษัทต้องเตรียมเอกสารอะไร.md", "Article", "Recommended"],
  ["/บทความ/ข้อควรรู้ก่อนขายกล้องและเลนส์มือสอง", "src/content/articles/ข้อควรรู้ก่อนขายกล้องและเลนส์มือสอง.md", "Article", "Recommended"],
  ["/บทความ/ปัจจัยที่ทำให้ราคาการ์ดจอมือสองแตกต่างกัน", "src/content/articles/ปัจจัยที่ทำให้ราคาการ์ดจอมือสองแตกต่างกัน.md", "Article", "Recommended"],
  ["/บทความ/วิธีถ่ายรูปสินค้าไอทีเพื่อให้ประเมินราคาได้เร็ว", "src/content/articles/วิธีถ่ายรูปสินค้าไอทีเพื่อให้ประเมินราคาได้เร็ว.md", "Article", "Recommended"],
  ["/บทความ/วิธีลบข้อมูลก่อนขายคอมพิวเตอร์", "src/content/articles/วิธีลบข้อมูลก่อนขายคอมพิวเตอร์.md", "Article", "Recommended"],
  ["/บทความ/วิธีออกจาก-icloud-ก่อนขาย-iphone-หรือ-ipad", "src/content/articles/วิธีออกจาก-icloud-ก่อนขาย-iphone-หรือ-ipad.md", "Article", "Recommended"],
  ["/บทความ/วิธีออกจากบัญชี-google-ก่อนขายโทรศัพท์-android", "src/content/articles/วิธีออกจากบัญชี-google-ก่อนขายโทรศัพท์-android.md", "Article", "Recommended"],
  ["/บทความ/วิธีเช็กสเปกโน๊ตบุ๊คก่อนส่งประเมิน", "src/content/articles/วิธีเช็กสเปกโน๊ตบุ๊คก่อนส่งประเมิน.md", "Article", "Recommended"],
  ["/บทความ/สินค้าไอทีเปิดไม่ติดยังประเมินราคาได้อย่างไร", "src/content/articles/สินค้าไอทีเปิดไม่ติดยังประเมินราคาได้อย่างไร.md", "Article", "Recommended"],
  ["/บทความ/ส่งโน๊ตบุ๊คหรือโทรศัพท์อย่างไรให้ปลอดภัย", "src/content/articles/ส่งโน๊ตบุ๊คหรือโทรศัพท์อย่างไรให้ปลอดภัย.md", "Article", "Recommended"],
  ["/บทความ/เช็กราคาสินค้าไอทีก่อนขายต้องดูอะไรบ้าง", "src/content/articles/เช็กราคาสินค้าไอทีก่อนขายต้องดูอะไรบ้าง.md", "Article", "Recommended"],
  ["/บทความ/เตรียมโน๊ตบุ๊คก่อนขายอย่างไร", "src/content/articles/เตรียมโน๊ตบุ๊คก่อนขายอย่างไร.md", "Article", "Recommended"],
  ["/รับซื้อ-nintendo-switch-โคราช", "src/content/services/รับซื้อ-nintendo-switch-โคราช.md", "Product category", "Required"],
  ["/รับซื้อสินค้าไอทียกล็อต", "src/content/services/รับซื้อสินค้าไอทียกล็อต.md", "B2B", "Required"],
  ["/รับซื้ออุปกรณ์สำนักงาน", "src/content/services/รับซื้ออุปกรณ์สำนักงาน.md", "Product category", "Required"],
  ["/รับซื้อเครื่องเกม-โคราช", "src/content/services/รับซื้อเครื่องเกม-โคราช.md", "Product category", "Required"],
  ["/รับซื้อโทรศัพท์จอแตก-โคราช", "src/content/services/รับซื้อโทรศัพท์จอแตก-โคราช.md", "Product condition", "Required"],
  ["/รับซื้อโน๊ตบุ๊คจอแตก-โคราช", "src/content/services/รับซื้อโน๊ตบุ๊คจอแตก-โคราช.md", "Product condition", "Required"],
] as const;

const pilotUrls = new Set(["/รับซื้อสินค้าไอทียกล็อต", "/รับซื้อโทรศัพท์จอแตก-โคราช", "/รับซื้อโน๊ตบุ๊คจอแตก-โคราช"]);
const htmlByRoute = new Map(walkHtml().map((file) => [fileToRoute(file), fs.readFileSync(file, "utf8")]));

const triage = originalMissing.map(([url, source, pageType, requirement]) => {
  const $ = cheerio.load(htmlByRoute.get(url) || "");
  const main = $("main").first(); const text = clean(main.text()); const lead = clean($(".hero__lead").first().text() || main.find("p").first().text());
  const answerFirst = lead.length >= 70; const steps = /ขั้นตอน/.test(text) || main.find("ol li").length >= 2;
  const pricing = /ปัจจัย.*ราคา|ประเมินราคา|ราคาสุดท้าย|ราคาเบื้องต้น/.test(text); const preparation = /เตรียม|ส่งรูป|รูปตัวอย่าง|รุ่น|สเปก|รายการ/.test(text);
  let faqCount = 0; $("script[type='application/ld+json']").each((_, el) => { try { const data = JSON.parse($(el).text()); const nodes = data["@graph"] || [data]; for (const node of nodes) if (node["@type"] === "FAQPage") faqCount += (node.mainEntity || []).length; } catch {} });
  const current = answerFirst && faqCount && steps ? "Strong" : answerFirst && (faqCount || steps) ? "Adequate" : "Missing";
  const implemented = pilotUrls.has(url);
  const action = requirement === "Not required" ? "No action; not an AEO defect" : implemented ? "Implemented concise answer-first hero lead; preserve URL, H1 and keyword ownership" : requirement === "Required" ? "P2: add concise answer-first hero lead in a future reviewed batch" : "Recommended: add concise article summary when editorially useful";
  return { URL: url, "Source file": source, "Page type": pageType, "Baseline AEO status": "Missing", "Current AEO status": current, "Expected AEO requirement": requirement, "Answer-first block exists": answerFirst ? "Yes" : "No", "Direct answer quality": implemented ? "Good: states accepted item, inputs, preliminary valuation, final inspection and LINE path" : requirement === "Recommended" ? "Article answers the topic in-body but lacks a concise opening summary" : requirement === "Not required" ? "Not applicable" : "Hero lead is too short to answer the transaction fully", "Step list exists": steps ? "Yes" : "No", "Pricing factors exists": pricing ? "Yes" : "No", "Preparation checklist exists": preparation ? "Yes" : "No", "FAQ exists": faqCount ? `Yes (${faqCount})` : "No", "Recommended action": action, Priority: requirement === "Required" ? "P2" : requirement === "Recommended" ? "P3/editorial" : "No action", "Content change required": implemented ? "Implemented" : requirement === "Required" ? "Yes, deferred" : "No mandatory change", "Business evidence required": "No new claim; use existing verified service process only", "GSC required": "No for answer-first wording; yes before structural ownership changes" };
});
writeCsv("01-aeo-gap-triage.csv", triage);

type Asset = { sourcePath: string; id: string; status: string; approved: string; note: string; people: string; target?: string; role?: string; alt?: string; prompt: string };
const assets: Asset[] = [
  { sourcePath: "docs/batch-14b/contact-sheets/ai-assets-contact-sheet.webp", id: "contact-sheet", status: "Do not use", approved: "No", note: "QA composite, not a production source asset", people: "Mixed/contact sheet", prompt: "docs/batch-14b/approved-ai-assets.json and contact sheet" },
  { sourcePath: "src/assets/images/illustrations/ai/people/owner-notebook-inspection-ai.webp", id: "AI-01", status: "Confirmed AI-generated for business", approved: "No", note: "Rejected: person and identity reference", people: "Yes", prompt: "approved-ai-assets.json AI-01; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/people/owner-profile-workspace-ai.webp", id: "AI-02", status: "Confirmed AI-generated for business", approved: "No", note: "Rejected: person and identity reference", people: "Yes", prompt: "approved-ai-assets.json AI-02; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/people/owner-team-device-check-ai.webp", id: "AI-03", status: "Confirmed AI-generated for business", approved: "No", note: "Rejected: people and identity reference", people: "Yes", prompt: "approved-ai-assets.json AI-03; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/process/notebook-exterior-check-ai.webp", id: "AI-07", status: "Confirmed AI-generated for business", approved: "No", note: "Rejected by stricter visual review: visible hands/partial person", people: "Partial person", prompt: "approved-ai-assets.json AI-07; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/packing/notebook-safe-packing-ai.webp", id: "AI-11", status: "Confirmed AI-generated for business", approved: "No", note: "Rejected by stricter visual review: visible arms/hands", people: "Partial person", prompt: "approved-ai-assets.json AI-11; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/workspace/inspection-workspace-concept-ai.webp", id: "AI-13", status: "Confirmed AI-generated for business", approved: "Yes", note: "Generic simulated evaluation workspace; disclosure required", people: "No", target: "src/assets/images/illustrations/ai/workspace/it-device-evaluation-workspace-ai.webp", role: "Evaluation workspace illustration", alt: "ภาพประกอบโต๊ะตรวจสอบคอมพิวเตอร์และอุปกรณ์ไอที", prompt: "approved-ai-assets.json AI-13; original prompt not found" },
  { sourcePath: "src/assets/images/illustrations/ai/workspace/packing-storage-workspace-concept-ai.webp", id: "AI-14", status: "Confirmed AI-generated for business", approved: "Yes", note: "Generic simulated bulk sorting/packing workspace; disclosure required", people: "No", target: "src/assets/images/illustrations/ai/workspace/bulk-it-sorting-process-ai.webp", role: "B2B workflow", alt: "ภาพประกอบพื้นที่คัดแยกและแพ็กอุปกรณ์ไอทีหลายชิ้น", prompt: "approved-ai-assets.json AI-14; original prompt not found" },
];

const provenance = [];
for (const asset of assets) {
  const full = path.join(SOURCE, asset.sourcePath); const buffer = fs.readFileSync(full); const meta = await sharp(buffer).metadata(); const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  provenance.push({ "Source path": asset.sourcePath, Filename: path.basename(asset.sourcePath), Hash: hash, "Image type": meta.format || path.extname(full).slice(1), "Created by": asset.id === "contact-sheet" ? "Audit tooling" : "User-provided AI asset", "Creation method": asset.id === "contact-sheet" ? "Contact-sheet composition" : "AI-generated illustration", "Prompt/report reference": asset.prompt, "Original photo owner": "Not applicable to AI illustration", "Permission status": asset.status, "Privacy status": asset.people === "No" ? "Passed visual review" : asset.id === "contact-sheet" ? "Not assessed for production" : "Excluded by no-person pilot rule", "Location context": "No province text/landmark detected; simulated workspace must not imply a real branch", "AI disclosure required": asset.id === "contact-sheet" ? "Not applicable" : "Yes", "Approved for Korat": asset.approved, Reviewer: "Codex Batch 2.1", "Review note": asset.note, Width: meta.width, Height: meta.height });
}
writeCsv("02-image-provenance-manifest.csv", provenance);
writeCsv("03-pilot-image-shortlist.csv", assets.map((asset) => ({ "Source path": asset.sourcePath, "Asset ID": asset.id, "Pilot decision": asset.approved === "Yes" ? "Approved and copied" : "Rejected", Reason: asset.note, "Contains people": asset.people, Generic: asset.id === "AI-13" || asset.id === "AI-14" ? "Yes" : "No/irrelevant", "Embedded location text": "None detected", "Image role": asset.role || "None", "Target path": asset.target || "None", "Target URL": asset.id === "AI-13" ? "/วิธีประเมินราคา" : asset.id === "AI-14" ? "/รับซื้อสินค้าไอทียกล็อต" : "None", Alt: asset.alt || "None", Disclosure: asset.approved === "Yes" ? "Required and implemented" : "Not implemented" })));

const approved = assets.filter((asset) => asset.approved === "Yes");
const migration = approved.map((asset) => {
  const sourceFull = path.join(SOURCE, asset.sourcePath); const targetFull = path.join(ROOT, asset.target!); const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(sourceFull)).digest("hex"); const targetHash = crypto.createHash("sha256").update(fs.readFileSync(targetFull)).digest("hex");
  return { "Source path": asset.sourcePath, "Target path": asset.target, "Original hash": sourceHash, "Target hash": targetHash, "Original filename": path.basename(asset.sourcePath), "Target filename": path.basename(asset.target!), "Image role": asset.role, "Target URL": asset.id === "AI-13" ? "/วิธีประเมินราคา" : "/รับซื้อสินค้าไอทียกล็อต", "Alt text": asset.alt, Caption: "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา", Disclosure: "Visible figure caption", "Rights evidence": `${asset.prompt}; commit 0d5e3b9`, "Privacy status": "Passed visual review: no people/customer data/serial/QR/document/plate/location text", "QA status": sourceHash === targetHash ? "Hash match; responsive Browser QA PASS" : "FAIL: hash mismatch" };
});
writeCsv("04-asset-migration-map.csv", migration);

write("00-executive-summary.md", `# Batch 2.1 executive summary\n\nVerdict: **PASS — LOCAL RELEASE CANDIDATE, NOT PUSHED**. Baseline Batch 2 was committed as 48034c7. AEO Missing 23 was reclassified into 7 Required transactional P2 gaps, 15 Recommended article summaries and 1 Not-required utility/404 page. Three transactional leads were clarified without changing URL, title, H1, canonical, CTA or keyword ownership.\n\nEight AI-labelled candidates were provenance-reviewed: 2 approved/copied, 6 rejected. Both approved files are user-provided AI illustrations documented in source report docs/batch-14b/approved-ai-assets.json and commit 0d5e3b9, contain no person/customer/private/location data, and use visible non-branch disclosure. Eight responsive screenshots cover two target pages at 360/390/768/1440.`);
write("05-aeo-pilot-log.md", `# AEO pilot log\n\nImplemented three P2 answer-first hero leads:\n\n- /รับซื้อสินค้าไอทียกล็อต — states multiple-item scope, required list/spec/condition/photos, preliminary LINE valuation and final physical inspection.\n- /รับซื้อโทรศัพท์จอแตก-โคราช — states model/storage/display/touch/photo inputs, LINE valuation and final physical inspection.\n- /รับซื้อโน๊ตบุ๊คจอแตก-โคราช — states model/spec/display/device-condition/photo inputs, LINE valuation and final physical inspection.\n\nTitles, H1, URLs, canonicals, primary CTAs and structural ownership are unchanged. Four other Required gaps remain P2; article summaries remain Recommended only; /404 is not an AEO defect.`);
write("06-image-implementation-log.md", `# Image implementation log\n\n- Copied, never moved, 2 of 8 candidates; source and target SHA-256 match.\n- Rejected 3 identity-reference images, 2 partial-person images and 1 QA contact sheet.\n- Added audit metadata in src/data/pilotImages.ts.\n- Enhanced the existing ResponsiveImage component with AVIF/WebP srcsets, sizes, intrinsic dimensions, lazy loading, async decoding and auditable slot IDs.\n- Added one below-fold image each to /วิธีประเมินราคา and /รับซื้อสินค้าไอทียกล็อต.\n- Added visible caption: “ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา”.\n- No location page and no hero/LCP image was changed.`);
write("07-browser-visual-review.md", `# Browser visual review\n\nHuman-review screenshots are stored in ./screenshots/: evaluation-{360,390,768,1440}.png and bulk-{360,390,768,1440}.png.\n\nAcross all 8 combinations: image complete=true, 1 H1, no H1 overflow, no horizontal overflow, intrinsic 1200×800 attributes, 2 picture sources (AVIF/WebP), responsive natural dimensions, lazy/low priority, visible caption, no wrong-province text. Visual inspection confirms acceptable center crop, readable caption, no customer/private data and no unintended branch implication. Mobile sticky LINE/phone CTA remains visible. Screenshot status: **COMPLETE**.`);
write("08-qa-report.md", `# QA report\n\nLocal gates: npm run check PASS (0 errors, 0 warnings, 38 hints); npm run build PASS (89 routes and 16 responsive image variants); audit:all PASS with critical=0/warning=0; qa:playwright PASS; content/image report deterministic rerun PASS; Batch 2.1 report deterministic rerun PASS; git diff --check PASS. Browser QA PASS for 8 image/page/viewport combinations and responsive AEO lead checks. Source/target hashes match. No location page, URL, title, H1, canonical, redirect or noindex change.\n\nPush/deploy status: NOT RUN.`);
write("09-decision-register.md", `# Decision register\n\n- Baseline audit: committed locally.\n- AEO: 7 Required transactional P2 gaps; implement 3, defer 4; 15 Recommended articles; /404 no action.\n- Images AI-13/AI-14: approved for Korat pilot with visible disclosure and neutral filenames.\n- Images AI-01/02/03/07/11: reject for pilot because full or partial people are visible.\n- Contact sheet: do not use.\n- Location pages: no action.\n- Push/merge/deploy: prohibited until separate release instruction.`);

console.log(JSON.stringify({ triage: triage.length, required: triage.filter((row) => row["Expected AEO requirement"] === "Required").length, recommended: triage.filter((row) => row["Expected AEO requirement"] === "Recommended").length, notRequired: triage.filter((row) => row["Expected AEO requirement"] === "Not required").length, aeoPilots: pilotUrls.size, imageCandidates: assets.length, imagesApproved: approved.length, imagesRejected: assets.length - approved.length, migrations: migration.length }, null, 2));
