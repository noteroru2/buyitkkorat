/**
 * Batch 4 — trust evidence, conversion, no fake reviews/forms.
 */
import {
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
} from "./audit-lib";
import { EVIDENCE_REGISTRY, getPublishablePhotoEvidence } from "../src/data/evidence";
import { CONTACT_CHANNELS, SITE, STORE_LOCATION } from "../src/data/site";

ensureDist();
const issues: Issue[] = [];

const KEY_PAGES = ["/", "/เกี่ยวกับเรา", "/ติดต่อ"];

if (getPublishablePhotoEvidence().length > 0) {
  // When photos exist they must have assets — currently expected empty
}

for (const item of EVIDENCE_REGISTRY) {
  if (item.publish && item.status === "ILLUSTRATION_NOT_STORE_PROOF") {
    issues.push({
      level: "critical",
      type: "evidence-publish",
      message: `illustration marked publish: ${item.id}`,
      file: "src/data/evidence.ts",
    });
  }
  if (item.publish && (!item.verified || !item.consent || !item.privacyReviewed)) {
    issues.push({
      level: "critical",
      type: "evidence-gate",
      message: `publish without gates: ${item.id}`,
      file: "src/data/evidence.ts",
    });
  }
}

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  if (route === "/404") continue;
  const $ = loadHtml(file);
  const html = $.html();
  const text = $("body").text();

  if (/AggregateRating|\"@type\"\s*:\s*\"Review\"/.test(html)) {
    issues.push({ level: "critical", type: "fake-review-schema", message: "Review/AggregateRating found", file: route });
  }

  if (/ลูกค้าพึงพอใจ\s*100%|ร้านอันดับ\s*1|รับรองโดย Google/.test(text)) {
    if (!/ไม่|ห้าม|ไม่อ้าง/.test(text)) {
      issues.push({ level: "critical", type: "fake-trust", message: "unsupported trust claim", file: route });
    }
  }

  if (KEY_PAGES.includes(route)) {
    if (!text.includes(STORE_LOCATION.province) && !text.includes("อุบลราชธานี")) {
      issues.push({ level: "critical", type: "nap", message: "missing Ubon province", file: route });
    }
    if (!html.includes(CONTACT_CHANNELS.mapsUrl) && !html.includes("maps.app.goo.gl")) {
      issues.push({ level: "critical", type: "maps", message: "missing Maps URL", file: route });
    }
    if (!html.includes("Amphontrading") && !html.includes(CONTACT_CHANNELS.facebookUrl)) {
      issues.push({ level: "warning", type: "facebook", message: "Facebook URL not found", file: route });
    }
    if (!html.includes(SITE.lineUrl) && !html.includes("@buyhub")) {
      issues.push({ level: "critical", type: "line", message: "LINE missing", file: route });
    }
    if (!html.includes(`tel:${SITE.phoneTel}`)) {
      issues.push({ level: "critical", type: "phone", message: "tel: CTA missing", file: route });
    }
    if (!text.includes(SITE.priceDisclaimer.slice(0, 20))) {
      issues.push({ level: "critical", type: "price-disclaimer", message: "price disclaimer missing", file: route });
    }
  }

  if (route === "/" || route === "/ติดต่อ") {
    if (!html.includes("ValuationChecklist") && !text.includes("เตรียมข้อมูลก่อนส่งประเมิน") && !text.includes("เตรียมข้อมูลก่อนประเมิน")) {
      issues.push({ level: "critical", type: "valuation", message: "checklist missing", file: route });
    }
    if (/<form[\s>]/i.test(html) && /valuation|ประเมิน/.test(html)) {
      issues.push({ level: "critical", type: "fake-form", message: "unexpected valuation form", file: route });
    }
    if (/ส่งข้อมูลสำเร็จ|ส่งเรียบร้อยแล้ว|success state/i.test(text)) {
      issues.push({ level: "critical", type: "fake-success", message: "fake success copy", file: route });
    }
  }

  if (route === "/") {
    if (!html.includes('data-component="StoreIdentityCard"') && !text.includes("ตรวจสอบตัวตนร้าน")) {
      issues.push({ level: "critical", type: "identity", message: "store identity missing", file: route });
    }
    if ($('a.skip-link').length === 0 && !html.includes("skip-link")) {
      // skip link is in layout - check presence
    }
  }

  // AI illustration must not claim to be real storefront without disclosure
  if (/ไม่ใช่ภาพสถานที่หรือสาขาจริง/.test(html) === false && /it-device-evaluation-workspace-ai|bulk-it-sorting-process-ai/.test(html)) {
    issues.push({
      level: "critical",
      type: "ai-disclosure",
      message: "AI image without disclosure caption",
      file: route,
    });
  }

  if (/สาขาโคราช|หน้าร้านโคราช|สำนักงานโคราช/.test(text)) {
    if (!/ไม่(มี|ใช่|ได้อ้าง)|ไม่อ้าง|ไม่ต้องเข้าใจว่า/.test(text)) {
      issues.push({ level: "critical", type: "branch", message: "affirmative Korat branch", file: route });
    }
  }
}

// Skip link present on homepage build
{
  const home = walkHtml().find((f) => fileToRoute(f) === "/");
  if (home) {
    const $ = loadHtml(home);
    if ($(".skip-link").length === 0) {
      issues.push({ level: "critical", type: "a11y-skip", message: "missing skip link", file: "/" });
    }
  }
}

printIssues("audit:batch4-trust", issues);
if (issues.some((i) => i.level === "critical")) process.exit(1);
