import fs from "node:fs";
import path from "node:path";
import {
  DIST,
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
} from "./audit-lib";

ensureDist();
const issues: Issue[] = [];

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  $("img").each((_, el) => {
    const src = $(el).attr("src") ?? "";
    const alt = $(el).attr("alt");
    const width = $(el).attr("width");
    const height = $(el).attr("height");

    if (!src) {
      issues.push({ level: "critical", type: "image", message: "img missing src", file: route });
      return;
    }
    if (/^https?:\/\//i.test(src) && !src.includes("xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com")) {
      issues.push({ level: "critical", type: "hotlink", message: src, file: route });
    }
    if (alt === undefined) {
      issues.push({ level: "critical", type: "alt", message: `missing alt for ${src}`, file: route });
    }
    if (!width || !height) {
      issues.push({ level: "warning", type: "dimensions", message: `missing width/height for ${src}`, file: route });
    }
    if (src.startsWith("/")) {
      const asset = path.join(DIST, src.replace(/^\//, ""));
      if (!fs.existsSync(asset)) {
        issues.push({ level: "critical", type: "broken-image", message: src, file: route });
      } else {
        const size = fs.statSync(asset).size;
        if (size > 1_500_000) {
          issues.push({ level: "warning", type: "large-image", message: `${src} ${size} bytes`, file: route });
        }
      }
    }
  });
}

const critical = printIssues("audit:images", issues);
process.exit(critical > 0 ? 1 : 0);
