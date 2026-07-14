import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
export const DIST = path.join(ROOT, "dist");
export const SITE = "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com";

export type Issue = {
  level: "critical" | "warning";
  type: string;
  message: string;
  file?: string;
};

export function walkHtml(dir = DIST): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

export function relFromDist(file: string): string {
  return path.relative(DIST, file).replace(/\\/g, "/");
}

export function fileToRoute(file: string): string {
  const rel = relFromDist(file);
  if (rel === "index.html") return "/";
  if (rel === "404.html") return "/404";
  return decodePath(`/${rel.replace(/\.html$/, "")}`);
}

export function decodePath(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export function normalizeInternalPath(href: string): string {
  const cleaned = href.split("#")[0].split("?")[0];
  if (!cleaned) return "/";
  const decoded = decodePath(cleaned);
  return decoded.replace(/\/$/, "") || "/";
}

export function loadHtml(file: string) {
  const html = fs.readFileSync(file, "utf8");
  return cheerio.load(html);
}

export function ensureDist(): void {
  if (!fs.existsSync(DIST)) {
    throw new Error("dist/ not found. Run npm run build first.");
  }
}

export function printIssues(title: string, issues: Issue[]): number {
  const critical = issues.filter((i) => i.level === "critical");
  const warnings = issues.filter((i) => i.level === "warning");
  console.log(`\n=== ${title} ===`);
  console.log(`critical=${critical.length} warning=${warnings.length}`);
  for (const issue of issues) {
    console.log(`[${issue.level}] ${issue.type}: ${issue.message}${issue.file ? ` (${issue.file})` : ""}`);
  }
  return critical.length;
}

export function countThaiWords(text: string): number {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const { isWordLike } of segmenter.segment(text)) {
    if (isWordLike) count += 1;
  }
  return count;
}

export const FORBIDDEN_CLAIMS = [
  "อันดับ 1",
  "อันดับหนึ่ง",
  "ดีที่สุด",
  "ราคาสูงที่สุด",
  "ให้ราคาดีที่สุด",
  "แพงกว่าทุกร้าน",
  "รับซื้อทุกสภาพ",
  "รับซื้อทุกรุ่น",
  "เงินสดทันทีทุกกรณี",
  "ประเมินแม่นยำ 100%",
  "ลูกค้าพึงพอใจ 100%",
  "เปิด 24 ชั่วโมง",
  "ถึงที่ทันที",
  "มีทีมทุกอำเภอ",
  "มีสาขาในโคราช",
  "ได้ราคาตามที่แจ้งแน่นอน",
];

export const MONEY_INTENTS = new Set(["product", "condition"]);
