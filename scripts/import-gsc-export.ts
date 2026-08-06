/**
 * Import Google Search Console CSV exports (offline, no API required).
 *
 * Usage:
 *   npx tsx scripts/import-gsc-export.ts --input path/to/export.csv --type queries|pages|dates|query-page --out docs/.../data
 *
 * Does NOT invent Query×Page joins from separate tables.
 * Writes NO DATA / quality report when files are missing or invalid.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type SheetType = "queries" | "pages" | "dates" | "query-page" | "unknown";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv: string[]) {
  const out: Record<string, string> = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith("--") && argv[i + 1]) {
      out[a.slice(2)] = argv[++i];
    }
  }
  return out;
}

function detectType(headers: string[], forced?: string): SheetType {
  if (forced === "queries" || forced === "pages" || forced === "dates" || forced === "query-page") {
    return forced;
  }
  const h = headers.map((x) => x.toLowerCase());
  const hasQuery = h.some((x) => x.includes("query") || x.includes("คำค้น"));
  const hasPage = h.some((x) => x.includes("page") || x.includes("หน้า") || x.includes("url"));
  const hasDate = h.some((x) => x.includes("date") || x.includes("วันที่"));
  if (hasQuery && hasPage) return "query-page";
  if (hasQuery) return "queries";
  if (hasPage) return "pages";
  if (hasDate) return "dates";
  return "unknown";
}

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const split = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else inQ = !inQ;
      } else if (ch === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  };
  const headers = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { headers, rows };
}

function main() {
  const args = parseArgs(process.argv);
  const outDir = path.resolve(root, args.out || "docs/batch-5-measurement-lead-feedback-2026-08-05/data");
  fs.mkdirSync(outDir, { recursive: true });

  const manifestPath = path.join(outDir, "gsc-import-manifest.json");
  const qualityPath = path.join(outDir, "gsc-data-quality-report.md");

  if (!args.input) {
    const manifest = {
      status: "NO_DATA_IMPORTED",
      checkedAt: new Date().toISOString(),
      note: "No --input provided. Place GSC CSV exports and re-run.",
      queryPageJoin: "FORBIDDEN_WITHOUT_NATIVE_QUERY_PAGE_EXPORT",
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    fs.writeFileSync(
      qualityPath,
      `# GSC Data Quality\n\nStatus: NO DATA IMPORTED\n\nDo not invent Query × Page joins from separate Queries and Pages tables.\n`,
    );
    console.log("NO_DATA_IMPORTED — wrote empty manifest");
    return;
  }

  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error("Input not found:", inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const { headers, rows } = parseCsv(raw);
  const type = detectType(headers, args.type);
  const issues: string[] = [];
  if (headers.length === 0) issues.push("empty headers");
  if (rows.length === 0) issues.push("empty sheet");
  const dup = new Set<string>();
  let dupCount = 0;
  for (const row of rows) {
    const key = row.join("\u0001");
    if (dup.has(key)) dupCount += 1;
    else dup.add(key);
  }
  if (dupCount > 0) issues.push(`duplicate_rows=${dupCount}`);

  const outName =
    type === "queries"
      ? "gsc-queries.csv"
      : type === "pages"
        ? "gsc-pages.csv"
        : type === "dates"
          ? "gsc-dates.csv"
          : type === "query-page"
            ? "gsc-query-page.csv"
            : "gsc-unknown.csv";

  fs.copyFileSync(inputPath, path.join(outDir, outName));

  const manifest = {
    status: issues.length ? "IMPORTED_WITH_WARNINGS" : "IMPORTED",
    checkedAt: new Date().toISOString(),
    sourceFile: path.basename(inputPath),
    detectedType: type,
    headerCount: headers.length,
    rowCount: rows.length,
    duplicateRows: dupCount,
    issues,
    queryPageJoin:
      type === "query-page"
        ? "NATIVE_EXPORT"
        : "FORBIDDEN_WITHOUT_NATIVE_QUERY_PAGE_EXPORT",
    prePostClassification: "NOT_PROVEN — set deployment windows manually",
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    qualityPath,
    `# GSC Data Quality\n\nStatus: ${manifest.status}\nType: ${type}\nRows: ${rows.length}\nIssues: ${issues.join("; ") || "none"}\n\nQuery×Page: ${manifest.queryPageJoin}\n`,
  );
  console.log("Imported", type, "rows=", rows.length);
}

main();
