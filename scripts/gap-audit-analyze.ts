import fs from "node:fs";
const pages = JSON.parse(fs.readFileSync("docs/full-website-gap-audit-2026-08-05/crawl-data/pages.json", "utf8"));
const home = pages.find((p: { path: string }) => p.path === "/");
console.log("home tracking", { hasGA: home.hasGA, hasFB: home.hasFB, hasMaps: home.hasMaps, schema: home.schemaTypes });

const html = await (await fetch("https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/")).text();
const gaHits = {
  gtag: /gtag\(/i.test(html),
  gtm: /googletagmanager/i.test(html),
  ga: /google-analytics/i.test(html),
  gId: /G-[A-Z0-9]{6,}/.test(html),
  vercelInsights: /vercel.*insight|_vercel|va\.js/i.test(html),
};
console.log("gaHits", gaHits);

const money = pages.filter((p: { path: string }) => String(p.path).includes("โคราช") && !String(p.path).startsWith("/พื้นที่"));
const areas = pages.filter((p: { path: string }) => String(p.path).startsWith("/พื้นที่"));
const arts = pages.filter((p: { path: string }) => String(p.path).startsWith("/บทความ/"));
function stats(arr: { wordCount?: number }[]) {
  const s = arr.map((p) => p.wordCount).filter((n): n is number => typeof n === "number").sort((a, b) => a - b);
  return { n: s.length, min: s[0], median: s[Math.floor(s.length / 2)], max: s.at(-1) };
}
console.log({ money: stats(money), areas: stats(areas), articles: stats(arts) });
console.log("h1!=1", pages.filter((p: { status: number; h1Count: number }) => p.status === 200 && p.h1Count !== 1).map((p: { path: string }) => p.path));
console.log("not200", pages.filter((p: { status: number }) => p.status !== 200).map((p: { path: string; status: number }) => ({ p: p.path, s: p.status })));
