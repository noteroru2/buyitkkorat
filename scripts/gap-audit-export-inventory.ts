import fs from "node:fs";
import path from "node:path";

const root = "docs/full-website-gap-audit-2026-08-05/crawl-data";
const pages = JSON.parse(fs.readFileSync(path.join(root, "pages.json"), "utf8")) as Array<
  Record<string, unknown>
>;

const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const header = [
  "path",
  "status",
  "indexable",
  "canonical",
  "robots",
  "title",
  "h1",
  "wordCount",
  "inSitemap",
  "schemas",
  "hasLine",
  "hasTel",
  "hasFB",
  "hasMaps",
  "outInternal",
];
const rows = [header.join(",")];
for (const p of pages) {
  const robots = String(p.robotsMeta ?? "");
  rows.push(
    [
      esc(p.path),
      p.status,
      /noindex/i.test(robots) ? "no" : "yes",
      esc(p.canonical),
      esc(robots),
      esc(p.title),
      esc(((p.h1 as string[]) || []).join("|")),
      p.wordCount,
      p.inSitemap,
      esc(((p.schemaTypes as string[]) || []).join("|")),
      p.hasLine,
      p.hasTel,
      p.hasFB,
      p.hasMaps,
      p.outInternal,
    ].join(","),
  );
}
fs.writeFileSync(path.join(root, "url-inventory.csv"), rows.join("\n"), "utf8");
console.log(`wrote ${rows.length - 1} rows`);
