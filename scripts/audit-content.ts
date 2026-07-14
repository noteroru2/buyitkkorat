import fs from "node:fs";
import path from "node:path";
import matter from "./matter-lite";
import {
  countThaiWords,
  ensureDist,
  printIssues,
  type Issue,
  DIST,
  fileToRoute,
  loadHtml,
  walkHtml,
} from "./audit-lib";

ensureDist();

const ROOT = path.resolve(DIST, "..");
const servicesDir = path.join(ROOT, "src/content/services");
const issues: Issue[] = [];

const PLACEHOLDERS = [
  "lorem ipsum",
  "TODO",
  "TBD",
  "{{",
  "}}",
  "[insert",
  "placeholder",
  "xxx content",
];

function isMoneyPage(data: Record<string, unknown>): boolean {
  const intent = String(data.intent ?? "");
  return intent === "product" || intent === "condition";
}

for (const name of fs.readdirSync(servicesDir)) {
  if (!name.endsWith(".md")) continue;
  const full = path.join(servicesDir, name);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const slug = String(data.slug ?? name.replace(/\.md$/, ""));

  for (const token of PLACEHOLDERS) {
    if (raw.toLowerCase().includes(token.toLowerCase())) {
      issues.push({
        level: "critical",
        type: "placeholder",
        message: `found ${token}`,
        file: slug,
      });
    }
  }

  if (Array.isArray(data.faq) && data.faq.length) {
    for (const faq of data.faq as { question?: string; answer?: string }[]) {
      if (!faq.question?.trim() || !faq.answer?.trim()) {
        issues.push({ level: "critical", type: "faq", message: "empty FAQ", file: slug });
      }
    }
  }

  if (isMoneyPage(data)) {
    const words = countThaiWords(content);
    if (words < 1500) {
      issues.push({
        level: "critical",
        type: "wordcount",
        message: `main content words=${words} (<1500)`,
        file: slug,
      });
    }
    if ((data.faq as unknown[] | undefined)?.length && (data.faq as unknown[]).length < 8) {
      issues.push({
        level: "critical",
        type: "faq",
        message: `FAQ count ${(data.faq as unknown[]).length} < 8`,
        file: slug,
      });
    }
  }
}

// Also check dist main-content for money-ish pages rendered thin
for (const file of walkHtml()) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  const main = $(".main-content").text();
  if (!main) continue;
  if (/lorem ipsum/i.test(main)) {
    issues.push({ level: "critical", type: "lorem", message: "lorem in rendered page", file: route });
  }
}

const critical = printIssues("audit:content", issues);
fs.mkdirSync(path.join(ROOT, "docs/audits"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "docs/audits/content-summary.json"),
  JSON.stringify(issues, null, 2),
);
process.exit(critical > 0 ? 1 : 0);
