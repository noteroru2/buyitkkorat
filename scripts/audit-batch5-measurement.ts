/**
 * Batch 5 — measurement gates, lead fail-closed, GA/GSC absence when unset.
 */
import {
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
} from "./audit-lib";
import { ANALYTICS, SITE } from "../src/data/site";
import { getLeadCaptureAdapter, LEAD_CAPTURE_STATUS, validateLeadPayload } from "../src/data/leadCapture";
import { isValidGa4MeasurementId, MEASUREMENT_EVENT_DEFS } from "../src/utils/measurement";

ensureDist();
const issues: Issue[] = [];

// --- GA / GSC env gates (build-time values; Production empty expected) ---
if (ANALYTICS.enabled && !isValidGa4MeasurementId(ANALYTICS.gaMeasurementId)) {
  issues.push({
    level: "critical",
    type: "ga-invalid",
    message: "ANALYTICS.enabled with invalid Measurement ID",
    file: "src/data/site.ts",
  });
}

if (!ANALYTICS.enabled && ANALYTICS.gaMeasurementId) {
  issues.push({
    level: "critical",
    type: "ga-inconsistent",
    message: "gaMeasurementId present but enabled=false",
    file: "src/data/site.ts",
  });
}

// Lead adapter must fail closed
const adapter = getLeadCaptureAdapter();
if (adapter.isConfigured()) {
  issues.push({
    level: "critical",
    type: "lead-configured",
    message: "Lead adapter unexpectedly configured without verified backend process",
    file: "src/data/leadCapture.ts",
  });
}
if (LEAD_CAPTURE_STATUS.productionForm !== false) {
  issues.push({
    level: "critical",
    type: "lead-form-flag",
    message: "productionForm must remain false until backend verified",
    file: "src/data/leadCapture.ts",
  });
}

const badLead = validateLeadPayload({ privacyConsent: false });
if (badLead.valid) {
  issues.push({
    level: "critical",
    type: "lead-validation",
    message: "privacyConsent=false should fail validation",
    file: "src/data/leadCapture.ts",
  });
}

if (MEASUREMENT_EVENT_DEFS.filter((e) => e.event === "valuation_submit").length !== 1) {
  issues.push({
    level: "critical",
    type: "taxonomy",
    message: "valuation_submit missing from measurement defs",
    file: "src/utils/measurement.ts",
  });
}

let routeCount = 0;
for (const file of walkHtml()) {
  const route = fileToRoute(file);
  if (route === "/404") continue;
  routeCount += 1;
  const $ = loadHtml(file);
  const html = $.html();
  const text = $("body").text();

  // When GA disabled at build, no gtag.js URL in HTML
  if (!ANALYTICS.enabled) {
    if (/googletagmanager\.com\/gtag\/js/.test(html)) {
      issues.push({
        level: "critical",
        type: "ga-leaked",
        message: "gtag.js present while ANALYTICS.enabled=false",
        file: route,
      });
    }
  }

  if (!SITE.analytics.gscVerification) {
    if (/name=["']google-site-verification["']/.test(html)) {
      issues.push({
        level: "critical",
        type: "gsc-leaked",
        message: "GSC meta present without verification token",
        file: route,
      });
    }
  }

  // No fake valuation forms / success
  if (/ส่งข้อมูลสำเร็จ|ส่งเรียบร้อยแล้ว/.test(text) && /ประเมิน|valuation/i.test(text)) {
    issues.push({
      level: "critical",
      type: "fake-success",
      message: "fake lead success copy",
      file: route,
    });
  }

  // valuation_submit must not be wired as a click CTA without backend gate documentation
  if (/data-event=["']valuation_submit["']/.test(html)) {
    issues.push({
      level: "critical",
      type: "valuation-submit-cta",
      message: "valuation_submit must not be a markup CTA until backend success path exists",
      file: route,
    });
  }

  // Consent UI present sitewide (layout)
  if (route === "/" && !/ตั้งค่าคุกกี้|cookie|consent/i.test(html)) {
    issues.push({
      level: "warning",
      type: "consent-ui",
      message: "consent UI markers weak on homepage",
      file: route,
    });
  }
}

if (routeCount < 93) {
  issues.push({
    level: "critical",
    type: "route-regression",
    message: `expected >=93 routes, got ${routeCount}`,
    file: "/",
  });
}

// Analytics inline must contain valuation_submit backend gate
{
  const home = walkHtml().find((f) => fileToRoute(f) === "/");
  if (home) {
    const html = loadHtml(home).html();
    if (!html.includes("__WINNER_LEAD_SUBMIT_OK__")) {
      issues.push({
        level: "critical",
        type: "submit-gate",
        message: "Analytics missing valuation_submit backend gate",
        file: "/",
      });
    }
  }
}

printIssues("audit:batch5-measurement", issues);
if (issues.some((i) => i.level === "critical")) process.exit(1);
