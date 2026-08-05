import fs from "node:fs";
import path from "node:path";
import {
  FORBIDDEN_CLAIMS,
  ensureDist,
  printIssues,
  walkHtml,
  loadHtml,
  fileToRoute,
  type Issue,
  DIST,
} from "./audit-lib";

ensureDist();
const issues: Issue[] = [];

const EXTRA = [
  "มีสาขาที่",
  "ที่อยู่: ถนน",
  "เปิดทุกวัน 24",
  "ลูกค้าพึงพอใจร้อยเปอร์เซ็นต์",
  "AggregateRating",
  "reviewRating",
];

const files = [
  ...walkHtml(),
  ...fs
    .readdirSync(path.join(DIST, "..", "src/content/services"))
    .map((f) => path.join(DIST, "..", "src/content/services", f)),
  ...fs
    .readdirSync(path.join(DIST, "..", "src/content/areas"))
    .map((f) => path.join(DIST, "..", "src/content/areas", f)),
  ...fs
    .readdirSync(path.join(DIST, "..", "src/content/articles"))
    .map((f) => path.join(DIST, "..", "src/content/articles", f)),
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const isHtml = file.endsWith(".html");
  const text = isHtml ? loadHtml(file).root().text() + loadHtml(file).html() : fs.readFileSync(file, "utf8");
  const label = isHtml ? fileToRoute(file) : path.relative(path.join(DIST, ".."), file);

  for (const claim of FORBIDDEN_CLAIMS) {
    let from = 0;
    while (true) {
      const idx = text.indexOf(claim, from);
      if (idx === -1) break;
      from = idx + claim.length;
      const before = text.slice(Math.max(0, idx - 12), idx);
      const window = text.slice(Math.max(0, idx - 60), idx + claim.length + 60);
      const negated =
        /ไม่\s*$/.test(before) ||
        /ไม่(มี|ได้|รับ|อ้าง|ใช่|ยืนยัน)|ห้าม|ไม่อ้าง|ไม่ได้อ้าง|ไม่ได้รับประกัน|หรือไม่|ไหม\?|ไม่บริการ|ไม่เปิด|ไม่ใช่/.test(window);
      if (negated) continue;
      issues.push({
        level: "critical",
        type: "forbidden-claim",
        message: claim,
        file: label,
      });
    }
  }

  for (const claim of EXTRA) {
    if (text.includes(claim)) {
      issues.push({ level: "critical", type: "risky-claim", message: claim, file: label });
    }
  }
}

const critical = printIssues("audit:claims", issues);
process.exit(critical > 0 ? 1 : 0);
