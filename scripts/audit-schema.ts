import {
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
  SITE,
} from "./audit-lib";
import { STORE_LOCATION } from "../src/data/site";

ensureDist();
const issues: Issue[] = [];
const FORBIDDEN_TYPES = ["AggregateRating", "Review"];

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  const scripts = $('script[type="application/ld+json"]');
  if (!scripts.length && route !== "/404") {
    issues.push({ level: "warning", type: "schema", message: "no JSON-LD", file: route });
    continue;
  }

  scripts.each((_, el) => {
    const raw = $(el).html() ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      issues.push({ level: "critical", type: "schema-parse", message: "invalid JSON-LD", file: route });
      return;
    }

    const nodes = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "@graph" in (parsed as object)
        ? ((parsed as { "@graph": unknown[] })["@graph"] ?? [])
        : [parsed];

    const root = parsed as Record<string, unknown>;
    if (root && typeof root === "object" && !Array.isArray(root)) {
      if (root["@graph"] && root["@context"] !== "https://schema.org") {
        issues.push({ level: "critical", type: "schema-context", message: "missing @context", file: route });
      }
    }

    const serialized = JSON.stringify(parsed);
    if (serialized.includes("localhost") || /vercel\.app/i.test(serialized)) {
      issues.push({ level: "critical", type: "schema-url", message: "non-production URL in schema", file: route });
    }
    if (serialized.includes("http://") && serialized.includes(SITE.replace("https://", "http://"))) {
      issues.push({ level: "critical", type: "schema-url", message: "http schema URL", file: route });
    }
    for (const bad of FORBIDDEN_TYPES) {
      if (serialized.includes(`"@type":"${bad}"`) || serialized.includes(`"@type": "${bad}"`)) {
        issues.push({ level: "critical", type: "schema-forbidden", message: bad, file: route });
      }
    }

    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as Record<string, unknown>;
      const type = n["@type"];
      if (type === "LocalBusiness" || type === "Store") {
        const address = n.address as Record<string, string> | undefined;
        const locality = `${address?.addressLocality ?? ""} ${address?.addressRegion ?? ""} ${address?.streetAddress ?? ""}`;
        if (/นครราชสีมา|โคราช/.test(locality)) {
          issues.push({
            level: "critical",
            type: "schema-korat-localbusiness",
            message: "LocalBusiness address must not be Korat",
            file: route,
          });
        }
        if (address?.addressRegion && address.addressRegion !== STORE_LOCATION.province) {
          issues.push({
            level: "critical",
            type: "schema-store-mismatch",
            message: `LocalBusiness region ${address.addressRegion} != entity ${STORE_LOCATION.province}`,
            file: route,
          });
        }
        if (address?.streetAddress && address.streetAddress !== STORE_LOCATION.streetAddress) {
          issues.push({
            level: "critical",
            type: "schema-address-mismatch",
            message: "streetAddress does not match STORE_LOCATION",
            file: route,
          });
        }
        if (!STORE_LOCATION.streetAddress && address?.streetAddress) {
          issues.push({
            level: "critical",
            type: "schema-address",
            message: "streetAddress present without verified entity value",
            file: route,
          });
        }
      }
      if (!n["@type"]) {
        issues.push({ level: "warning", type: "schema-type", message: "node missing @type", file: route });
      }
    }

    const faqNode = nodes.find(
      (n) => n && typeof n === "object" && (n as { "@type"?: string })["@type"] === "FAQPage",
    ) as { mainEntity?: { name?: string }[] } | undefined;
    if (faqNode?.mainEntity?.length) {
      const visibleQuestions = $("details summary")
        .map((_, s) => $(s).text().trim())
        .get();
      for (const entity of faqNode.mainEntity) {
        const name = entity.name?.trim() ?? "";
        if (name && !visibleQuestions.some((q) => q === name)) {
          issues.push({
            level: "critical",
            type: "schema-faq-mismatch",
            message: `FAQ schema not visible: ${name}`,
            file: route,
          });
        }
      }
    }
  });
}

const critical = printIssues("audit:schema", issues);
process.exit(critical > 0 ? 1 : 0);
