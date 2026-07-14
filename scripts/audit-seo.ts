import fs from "node:fs";
import path from "node:path";
import {
  DIST,
  SITE,
  decodePath,
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
const titles = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();
const routes = new Set(files.map(fileToRoute));

const sitemapPath = path.join(DIST, "sitemap-index.xml");
const sitemapUrlPath = path.join(DIST, "sitemap-0.xml");
const robotsPath = path.join(DIST, "robots.txt");

if (!fs.existsSync(robotsPath)) {
  issues.push({ level: "critical", type: "robots", message: "missing robots.txt in dist" });
} else {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!robots.includes(`${SITE}/sitemap-index.xml`) && !robots.includes(`${SITE}/sitemap-0.xml`)) {
    issues.push({ level: "critical", type: "robots", message: "robots.txt missing production sitemap URL" });
  }
  if (/disallow:\s*\/(assets|_astro|.*\.(css|js))/i.test(robots)) {
    issues.push({ level: "critical", type: "robots", message: "robots blocks css/js incorrectly" });
  }
}

if (!fs.existsSync(sitemapPath) && !fs.existsSync(sitemapUrlPath)) {
  issues.push({ level: "critical", type: "sitemap", message: "missing sitemap in dist" });
}

const sitemapUrls = new Set<string>();
for (const candidate of [sitemapPath, sitemapUrlPath, path.join(DIST, "sitemap.xml")]) {
  if (!fs.existsSync(candidate)) continue;
  const xml = fs.readFileSync(candidate, "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    sitemapUrls.add(decodePath(match[1]));
  }
}

for (const file of files) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const robots = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const h1s = $("h1");

  if (!title) {
    issues.push({ level: "critical", type: "title", message: "missing title", file: route });
  } else {
    const list = titles.get(title) ?? [];
    list.push(route);
    titles.set(title, list);
  }

  if (!description) {
    issues.push({ level: "critical", type: "description", message: "missing description", file: route });
  } else {
    const list = descriptions.get(description) ?? [];
    list.push(route);
    descriptions.set(description, list);
  }

  if (h1s.length === 0) {
    issues.push({ level: "critical", type: "h1", message: "missing H1", file: route });
  } else if (h1s.length > 1) {
    issues.push({ level: "critical", type: "h1", message: `multiple H1 (${h1s.length})`, file: route });
  }

  if (route !== "/404" && !robots.includes("noindex")) {
    if (!canonical) {
      issues.push({ level: "critical", type: "canonical", message: "missing canonical", file: route });
    } else {
      if (canonical.includes("localhost") || canonical.includes("127.0.0.1") || /vercel\.app/i.test(canonical)) {
        issues.push({ level: "critical", type: "canonical", message: `bad canonical host ${canonical}`, file: route });
      }
      if (!canonical.startsWith(SITE)) {
        issues.push({ level: "critical", type: "canonical", message: `canonical not production domain: ${canonical}`, file: route });
      }
    }

    const expected = route === "/" ? `${SITE}/` : `${SITE}${route}`;
    const altExpected = route === "/" ? SITE : `${SITE}${route}`;
    if (canonical && canonical !== expected && canonical !== altExpected && canonical !== `${expected}/`) {
      // allow either with or without trailing slash consistency; prefer never trailing
      if (!(route === "/" && (canonical === SITE || canonical === `${SITE}/`))) {
        issues.push({
          level: "warning",
          type: "canonical",
          message: `canonical path mismatch ${canonical} vs ${altExpected}`,
          file: route,
        });
      }
    }

    const inSitemap = [...sitemapUrls].some((u) => {
      const decoded = decodePath(u);
      return (
        decoded === expected ||
        decoded === altExpected ||
        decoded === `${altExpected}/` ||
        (route === "/" && (decoded === SITE || decoded === `${SITE}/`))
      );
    });
    if (sitemapUrls.size && !inSitemap) {
      issues.push({ level: "critical", type: "sitemap", message: "indexable page missing from sitemap", file: route });
    }
  }
}

for (const [title, pages] of titles) {
  if (pages.length > 1) {
    issues.push({
      level: "critical",
      type: "duplicate-title",
      message: `"${title}" on ${pages.join(", ")}`,
    });
  }
}

for (const [description, pages] of descriptions) {
  if (pages.length > 1) {
    issues.push({
      level: "critical",
      type: "duplicate-description",
      message: `duplicate description on ${pages.join(", ")}`,
    });
  }
}

// Orphan check: pages with no inbound internal links (except home)
const inbound = new Map<string, number>();
for (const route of routes) inbound.set(route, 0);
for (const file of files) {
  const $ = loadHtml(file);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;
    const clean = normalizeInternalPath(href);
    if (inbound.has(clean)) inbound.set(clean, (inbound.get(clean) ?? 0) + 1);
  });
}
for (const [route, count] of inbound) {
  if (route === "/" || route === "/404") continue;
  if (count === 0) {
    issues.push({ level: "warning", type: "orphan", message: "no inbound internal links", file: route });
  }
}

const critical = printIssues("audit:seo", issues);
process.exit(critical > 0 ? 1 : 0);
