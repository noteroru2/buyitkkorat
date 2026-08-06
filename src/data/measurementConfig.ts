/**
 * Measurement config — deployment timeline, scoring defaults, brand patterns.
 * Dates use first-observed Production content where deploy SHA is not attested.
 */

export type DeploymentRecord = {
  batch: string;
  implementationCommit: string;
  finalMainSha: string;
  firstObservedProductionAt: string;
  attestation: "SHA_ATTESTED" | "CONTENT_VERIFIED_SHA_NOT_ATTESTED";
  pagesChangedSummary: string;
  measurementStartDate: string;
  earliestEvaluationDate: string;
};

export const DEPLOYMENT_TIMELINE: DeploymentRecord[] = [
  {
    batch: "batch-1",
    implementationCommit: "55b176e",
    finalMainSha: "55b176e",
    firstObservedProductionAt: "2026-08-05",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Entity, consent, analytics hooks, security headers",
    measurementStartDate: "2026-08-05",
    earliestEvaluationDate: "2026-08-19",
  },
  {
    batch: "batch-1.1",
    implementationCommit: "daebafc",
    finalMainSha: "fba8a60",
    firstObservedProductionAt: "2026-08-05",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Verified Ubon NAP, Maps, Facebook",
    measurementStartDate: "2026-08-05",
    earliestEvaluationDate: "2026-08-19",
  },
  {
    batch: "batch-2",
    implementationCommit: "3e924f0",
    finalMainSha: "2cbb825",
    firstObservedProductionAt: "2026-08-05",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Thin content, hub linking, FAQ AEO",
    measurementStartDate: "2026-08-05",
    earliestEvaluationDate: "2026-08-19",
  },
  {
    batch: "batch-3",
    implementationCommit: "5035c5f",
    finalMainSha: "e7b413d",
    firstObservedProductionAt: "2026-08-05",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Commercial authority + 4 articles",
    measurementStartDate: "2026-08-05",
    earliestEvaluationDate: "2026-08-19",
  },
  {
    batch: "batch-4",
    implementationCommit: "5df40c8",
    finalMainSha: "793e3f6",
    firstObservedProductionAt: "2026-08-05",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Trust evidence governance + conversion UX",
    measurementStartDate: "2026-08-05",
    earliestEvaluationDate: "2026-08-19",
  },
  {
    batch: "batch-5",
    implementationCommit: "99f2333",
    finalMainSha: "99f2333",
    firstObservedProductionAt: "2026-08-06",
    attestation: "CONTENT_VERIFIED_SHA_NOT_ATTESTED",
    pagesChangedSummary: "Measurement gates, lead fail-closed, GSC import pipeline",
    measurementStartDate: "2026-08-06",
    earliestEvaluationDate: "2026-08-20",
  },
];

/** Analysis defaults — not hard SEO standards */
export const OPPORTUNITY_SCORING_DEFAULTS = {
  minImpressions: 50,
  minClicks: 3,
  evaluationWindowDays: 28,
  comparisonWindowDays: 28,
  positionBandLowCtr: { min: 4, max: 15 },
} as const;

export const BRAND_QUERY_PATTERNS = [
  /winner\s*it/i,
  /อำพล/,
  /รับซื้อไอทีโคราช\.com/i,
  /buyhub/i,
] as const;

export const MONEY_PAGE_PATH_PREFIXES = [
  "/รับซื้อ",
  "/บริการรับซื้อ",
  "/ส่งสินค้า",
  "/วิธีประเมิน",
  "/วิธีขาย",
] as const;
