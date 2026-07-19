import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_ROOTS = [path.join(ROOT, "src", "content"), path.join(ROOT, "src", "pages")];
const DIST = path.join(ROOT, "dist");
const PRODUCTION_ORIGIN = "https://www.buyitkorat.com";
const productionMode = process.argv.includes("--production");

function filesUnder(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    return entry.isDirectory() ? filesUnder(full) : [full];
  });
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase("th");
}

const sourcePatterns: { type: string; regex: RegExp }[] = [
  { type: "typo", regex: /แล้ววนัดตามพื้นที่|ขายเครื่องเครื่องเดียว|จอmonitor|รุ่นที่คึ้น/giu },
  { type: "keyword-injection", regex: /ราคาที่\s+[^\n.!?]{2,100}?\s+ได้รับวันนี้/giu },
  { type: "keyword-injection", regex: /การประเมิน\s+[^\n.!?]{2,100}?\s+รวดเร็วขึ้น/giu },
  { type: "unrendered-template", regex: /\{(?:title|serviceName)\}/gu },
];

const sourceIssues: Record<string, unknown>[] = [];
for (const file of SOURCE_ROOTS.flatMap(filesUnder).filter((file) => /\.(?:md|astro)$/i.test(file))) {
  const raw = fs.readFileSync(file, "utf8");
  for (const pattern of sourcePatterns.filter((pattern) => !file.endsWith(".astro") || pattern.type !== "unrendered-template")) {
    for (const match of raw.matchAll(pattern.regex)) {
      sourceIssues.push({
        file: path.relative(ROOT, file).replaceAll("\\", "/"),
        type: pattern.type,
        phrase: match[0],
        line: raw.slice(0, match.index).split(/\r?\n/).length,
      });
    }
  }
}

const distHtmlFiles = filesUnder(DIST).filter((file) => file.endsWith(".html"));
const renderedInputs = await Promise.all(distHtmlFiles.map(async (file) => {
  const route = path.relative(DIST, file).replaceAll("\\", "/").replace(/index\.html$/, "").replace(/\.html$/, "") || "/";
  const normalizedRoute = `/${route}`.replace("//", "/");
  if (!productionMode) return { route: normalizedRoute, html: fs.readFileSync(file, "utf8") };

  const response = await fetch(new URL(normalizedRoute, PRODUCTION_ORIGIN), { redirect: "follow" });
  if (!response.ok) throw new Error(`${normalizedRoute} returned HTTP ${response.status}`);
  return { route: normalizedRoute, html: await response.text() };
}));

const renderedIssues: Record<string, unknown>[] = [];
for (const { route, html } of renderedInputs) {
  const $ = cheerio.load(html);
  const paragraphs = $(".main-content p").toArray().map((element) => normalize($(element).text())).filter((text) => text.length >= 80);
  const seen = new Map<string, number>();
  paragraphs.forEach((text, index) => {
    if (seen.has(text)) renderedIssues.push({ route, type: "duplicate-paragraph", first: seen.get(text), duplicate: index, text });
    else seen.set(text, index);
  });
  const pairs = new Map<string, number>();
  for (let index = 0; index < paragraphs.length - 1; index++) {
    const pair = `${paragraphs[index]}\u241f${paragraphs[index + 1]}`;
    if (pairs.has(pair)) renderedIssues.push({ route, type: "duplicate-sequence", first: pairs.get(pair), duplicate: index });
    else pairs.set(pair, index);
  }
  const mainText = normalize($(".main-content").text());
  for (const pattern of sourcePatterns) {
    pattern.regex.lastIndex = 0;
    for (const match of mainText.matchAll(pattern.regex)) renderedIssues.push({ route, type: pattern.type, phrase: match[0] });
  }
}

const summary = {
  sourceFilesChecked: SOURCE_ROOTS.flatMap(filesUnder).filter((file) => /\.(?:md|astro)$/i.test(file)).length,
  target: productionMode ? PRODUCTION_ORIGIN : "local-dist",
  renderedRoutesChecked: renderedInputs.length,
  sourceIssues: sourceIssues.length,
  renderedIssues: renderedIssues.length,
  issues: [...sourceIssues, ...renderedIssues],
};

console.log(JSON.stringify(summary, null, 2));
if (sourceIssues.length || renderedIssues.length) process.exit(1);
