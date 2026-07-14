import fs from "node:fs";
import path from "node:path";
import {
  DIST,
  ensureDist,
  fileToRoute,
  loadHtml,
  normalizeInternalPath,
  printIssues,
  walkHtml,
  type Issue,
} from "./audit-lib";

ensureDist();
const issues: Issue[] = [];
const files = walkHtml();
const routes = new Set(files.map(fileToRoute));

function normalize(href: string): string | null {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#") || href.startsWith("javascript:")) {
    return null;
  }
  if (href.startsWith("http://") || href.startsWith("https://")) {
    if (/localhost|127\.0\.0\.1|vercel\.app/i.test(href)) {
      return `EXTERNAL_BAD:${href}`;
    }
    return null;
  }
  return normalizeInternalPath(href);
}

for (const file of files) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const normalized = normalize(href);
    if (!normalized) return;
    if (normalized.startsWith("EXTERNAL_BAD:")) {
      issues.push({
        level: "critical",
        type: "bad-external",
        message: normalized.replace("EXTERNAL_BAD:", ""),
        file: route,
      });
      return;
    }
    // Skip asset links
    if (normalized.match(/\.(png|jpg|jpeg|svg|webp|pdf|xml|txt|webmanifest)$/i)) {
      const assetPath = path.join(DIST, normalized.replace(/^\//, ""));
      if (!fs.existsSync(assetPath)) {
        issues.push({ level: "critical", type: "broken-asset-link", message: normalized, file: route });
      }
      return;
    }
    if (!routes.has(normalized) && normalized !== "/404") {
      // also check if file exists as html
      const htmlPath = path.join(
        DIST,
        normalized === "/" ? "index.html" : `${normalized.replace(/^\//, "")}.html`,
      );
      const indexPath = path.join(DIST, normalized.replace(/^\//, ""), "index.html");
      if (!fs.existsSync(htmlPath) && !fs.existsSync(indexPath)) {
        issues.push({
          level: "critical",
          type: "broken-internal",
          message: normalized,
          file: route,
        });
      }
    }
  });
}

const critical = printIssues("audit:links", issues);
process.exit(critical > 0 ? 1 : 0);
