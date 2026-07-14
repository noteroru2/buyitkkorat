import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "src/content/services");

function countThaiWords(text) {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (isWordLike && segment.trim()) count += 1;
  }
  return count;
}

function bodyFromMarkdown(raw) {
  const idx = raw.indexOf("---", 3);
  return idx === -1 ? raw : raw.slice(idx + 3).trim();
}

const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

const results = files.map((file) => {
  const raw = readFileSync(join(DIR, file), "utf8");
  const body = bodyFromMarkdown(raw);
  const words = countThaiWords(body);
  return { file, words, ok: words >= 1500 };
});

console.log(`Counted ${results.length} files in ${DIR}\n`);
for (const r of results) {
  console.log(`${r.ok ? "OK" : "FAIL"} ${r.file}: ${r.words} words`);
}
const failed = results.filter((r) => !r.ok);
console.log(`\nTotal: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
if (failed.length) process.exit(1);
