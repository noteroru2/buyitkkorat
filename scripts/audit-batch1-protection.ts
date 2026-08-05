/**
 * Batch 1 / 1.1 critical protection regressions.
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
import {
  CONTACT_CHANNELS,
  SITE,
  STORE_LOCATION,
  formatStoreFullAddress,
} from "../src/data/site";

ensureDist();
const issues: Issue[] = [];
const fullAddress = formatStoreFullAddress();
const FORBIDDEN_PHRASES = [
  "สาขาโคราช",
  "หน้าร้านโคราช",
  "สำนักงานโคราช",
  "มีสาขาทั่วประเทศ",
  "มีทีมงานประจำทุกจังหวัด",
];

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

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html() ?? "";
    if (!raw.includes("LocalBusiness")) return;
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
        if (!address.includes("34000") || !address.includes("อุบลราชธานี")) {
          issues.push({
            level: "critical",
            type: "localbusiness-ubon-incomplete",
            message: "LocalBusiness missing Ubon postal/region",
            file: route,
          });
        }
        if (String(node.hasMap ?? "") !== CONTACT_CHANNELS.mapsUrl) {
          issues.push({
            level: "critical",
            type: "localbusiness-hasmap",
            message: String(node.hasMap ?? ""),
            file: route,
          });
        }
        if (!String(node.openingHours ?? "").includes("Mo-Su 09:00-21:00")) {
          issues.push({
            level: "critical",
            type: "localbusiness-hours",
            message: String(node.openingHours ?? ""),
            file: route,
          });
        }
      }
      const org = nodes.find((n) => n["@type"] === "Organization") as
        | { sameAs?: string[] }
        | undefined;
      if (org && CONTACT_CHANNELS.facebookUrl) {
        const sameAs = org.sameAs ?? [];
        if (!sameAs.includes(CONTACT_CHANNELS.facebookUrl)) {
          issues.push({
            level: "critical",
            type: "organization-sameas-facebook",
            message: "Facebook missing from Organization sameAs",
            file: route,
          });
        }
      }
    } catch {
      /* schema audit covers parse */
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
    if (!text.includes("740/8") || !text.includes("34000")) {
      issues.push({
        level: "critical",
        type: "missing-full-address",
        message: "Full verified address missing",
        file: route,
      });
    }
    if (!text.includes("09:00") || !text.includes("21:00")) {
      issues.push({
        level: "critical",
        type: "missing-hours",
        message: "Opening hours missing",
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
    const mapsLinks = $(`a[href="${CONTACT_CHANNELS.mapsUrl}"]`);
    if (!mapsLinks.length) {
      issues.push({
        level: "critical",
        type: "missing-maps-cta",
        message: "Maps CTA missing",
        file: route,
      });
    } else if (!mapsLinks.filter((_, el) => $(el).attr("data-event") === "maps_click").length) {
      issues.push({
        level: "critical",
        type: "maps-event",
        message: "maps_click missing",
        file: route,
      });
    }
    const fbLinks = $(`a[href="${CONTACT_CHANNELS.facebookUrl}"]`);
    if (!fbLinks.length) {
      issues.push({
        level: "critical",
        type: "missing-facebook-cta",
        message: "Facebook CTA missing",
        file: route,
      });
    } else if (!fbLinks.filter((_, el) => $(el).attr("data-event") === "facebook_click").length) {
      issues.push({
        level: "critical",
        type: "facebook-event",
        message: "facebook_click missing",
        file: route,
      });
    }
  }

  if (route === "/นโยบายคุกกี้") {
    if ($("h1").text().trim() !== "นโยบายคุกกี้") {
      issues.push({ level: "critical", type: "cookie-policy", message: "missing cookie policy h1", file: route });
    }
  }

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

  $('a[data-event="maps_click"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href !== CONTACT_CHANNELS.mapsUrl) {
      issues.push({
        level: "critical",
        type: "maps-url-mismatch",
        message: href,
        file: route,
      });
    }
  });

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

  if (SITE.analytics.gscVerification) {
    /* ok when set */
  } else if (/name="google-site-verification"/.test(html)) {
    issues.push({
      level: "critical",
      type: "gsc-meta-without-token",
      message: "GSC meta rendered without token",
      file: route,
    });
  }

  if (/phone_number|customer_name|product_serial|exact_address/.test(html)) {
    issues.push({
      level: "critical",
      type: "analytics-pii-key",
      message: "blocked PII parameter key found in HTML/JS",
      file: route,
    });
  }
}

const home = path.join(DIST, "index.html");
if (fs.existsSync(home)) {
  const $ = loadHtml(home);
  const footer = $("footer").text();
  if (!footer.includes(STORE_LOCATION.province) || !footer.includes("34000")) {
    issues.push({
      level: "critical",
      type: "footer-entity",
      message: "footer missing verified Ubon address",
      file: "/",
    });
  }
  if (!$(`a[href="${CONTACT_CHANNELS.facebookUrl}"]`).length) {
    issues.push({
      level: "critical",
      type: "footer-facebook",
      message: "footer Facebook link missing",
      file: "/",
    });
  }
  if (!$(`a[href="${CONTACT_CHANNELS.mapsUrl}"]`).length) {
    issues.push({
      level: "critical",
      type: "footer-maps",
      message: "footer Maps link missing",
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
  if (!fullAddress.includes("740/8")) {
    issues.push({
      level: "critical",
      type: "entity-format",
      message: "formatStoreFullAddress incomplete",
      file: "/",
    });
  }
}

const critical = printIssues("audit:batch1-protection", issues);
process.exit(critical > 0 ? 1 : 0);
