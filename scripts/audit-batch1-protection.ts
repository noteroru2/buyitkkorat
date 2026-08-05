/**
 * Batch 1 critical protection regressions.
 */
import fs from "node:fs";
import path from "node:path";
import {
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
  DIST,
} from "./audit-lib";
import { CONTACT_CHANNELS, SITE, STORE_LOCATION } from "../src/data/site";

ensureDist();
const issues: Issue[] = [];

const FORBIDDEN_PHRASES = ["สาขาโคราช", "หน้าร้านโคราช", "สำนักงานโคราช", "มีสาขาทั่วประเทศ"];

function isNegated(text: string, idx: number, claim: string): boolean {
  const before = text.slice(Math.max(0, idx - 16), idx);
  const window = text.slice(Math.max(0, idx - 80), idx + claim.length + 40);
  return (
    /ไม่\s*$/.test(before) ||
    /ไม่(มี|ได้|รับ|อ้าง|ใช่|ยืนยัน)|ห้าม|ไม่อ้าง|ไม่ได้อ้าง|ไม่ใช่/.test(window)
  );
}

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  const $ = loadHtml(file);
  const html = $.html();
  const text = $.root().text() + html;

  for (const phrase of FORBIDDEN_PHRASES) {
    let from = 0;
    while (true) {
      const idx = text.indexOf(phrase, from);
      if (idx === -1) break;
      from = idx + phrase.length;
      if (isNegated(text, idx, phrase)) continue;
      issues.push({
        level: "critical",
        type: "branch-claim",
        message: phrase,
        file: route,
      });
    }
  }

  // LocalBusiness Korat address
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html() ?? "";
    if (!raw.includes("LocalBusiness")) return;
    if (/LocalBusiness[\s\S]{0,800}(นครราชสีมา|โคราช)/.test(raw) && /streetAddress|addressLocality|addressRegion/.test(raw)) {
      // areaServed may mention Korat; only fail if address block has Korat
      try {
        const parsed = JSON.parse(raw) as { "@graph"?: Record<string, unknown>[] };
        const nodes = parsed["@graph"] ?? [];
        for (const node of nodes) {
          if (node["@type"] !== "LocalBusiness") continue;
          const address = JSON.stringify(node.address ?? {});
          if (/นครราชสีมา|โคราช/.test(address)) {
            issues.push({
              level: "critical",
              type: "localbusiness-korat-address",
              message: "LocalBusiness address points to Korat",
              file: route,
            });
          }
        }
      } catch {
        /* schema audit covers parse */
      }
    }
  });

  if (route === "/เกี่ยวกับเรา" || route === "/ติดต่อ") {
    if (!text.includes("อุบลราชธานี")) {
      issues.push({
        level: "critical",
        type: "missing-ubon",
        message: "Ubon storefront province missing",
        file: route,
      });
    }
    if (!text.includes("นครราชสีมา") && !text.includes("โคราช")) {
      issues.push({
        level: "critical",
        type: "missing-service-area",
        message: "Korat service area wording missing",
        file: route,
      });
    }
  }

  if (route === "/นโยบายคุกกี้") {
    if ($("h1").text().trim() !== "นโยบายคุกกี้") {
      issues.push({ level: "critical", type: "cookie-policy", message: "missing cookie policy h1", file: route });
    }
  }

  // Facebook CTA must not render fake URL
  $('a[data-event="facebook_click"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!CONTACT_CHANNELS.facebookUrl) {
      issues.push({
        level: "critical",
        type: "facebook-without-url",
        message: `facebook CTA rendered without configured URL: ${href}`,
        file: route,
      });
    } else if (href !== CONTACT_CHANNELS.facebookUrl) {
      issues.push({
        level: "critical",
        type: "facebook-url-mismatch",
        message: href,
        file: route,
      });
    }
  });

  // GA must not hardcode when disabled
  if (!SITE.analytics.enabled) {
    if (/googletagmanager\.com\/gtag\/js/.test(html) || /gtag\("config"/.test(html)) {
      issues.push({
        level: "critical",
        type: "ga-loaded-without-id",
        message: "GA snippets present without measurement id",
        file: route,
      });
    }
  }

  // PII param names must not appear in analytics helper payload keys
  if (/phone_number|customer_name|product_serial|exact_address/.test(html)) {
    issues.push({
      level: "critical",
      type: "analytics-pii-key",
      message: "blocked PII parameter key found in HTML/JS",
      file: route,
    });
  }
}

// Entity consistency: footer mentions store province
const home = path.join(DIST, "index.html");
if (fs.existsSync(home)) {
  const $ = loadHtml(home);
  const footer = $("footer").text();
  if (!footer.includes(STORE_LOCATION.province)) {
    issues.push({
      level: "critical",
      type: "footer-entity",
      message: "footer missing Ubon store province",
      file: "/",
    });
  }
  if (!footer.includes("นโยบายคุกกี้") && !$(`a[href="/นโยบายคุกกี้"]`).length) {
    issues.push({
      level: "critical",
      type: "cookie-footer-link",
      message: "cookie policy footer link missing",
      file: "/",
    });
  }
}

const critical = printIssues("audit:batch1-protection", issues);
process.exit(critical > 0 ? 1 : 0);
