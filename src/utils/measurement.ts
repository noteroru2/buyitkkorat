/**
 * Measurement helpers — GA ID validation and conversion taxonomy.
 * Never invent Measurement IDs or GSC tokens.
 */

/** GA4 web Measurement ID pattern (G-XXXXXXXXXX) */
export const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,14}$/i;

export function isValidGa4MeasurementId(value: string | undefined | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // Reject placeholders / examples
  if (/^G-X+$/i.test(trimmed) || /example|placeholder|your[_-]?id/i.test(trimmed)) {
    return false;
  }
  return GA4_MEASUREMENT_ID_PATTERN.test(trimmed);
}

export function normalizeGa4MeasurementId(value: string | undefined | null): string {
  if (!isValidGa4MeasurementId(value)) return "";
  return String(value).trim().toUpperCase();
}

export type ConversionTier = "primary" | "secondary" | "supporting" | "future_backend" | "deprecated";

export type MeasurementEventDef = {
  event: string;
  tier: ConversionTier;
  trigger: string;
  consentRequired: boolean;
  notes: string;
};

export const MEASUREMENT_EVENT_DEFS: MeasurementEventDef[] = [
  {
    event: "line_click",
    tier: "primary",
    trigger: "User clicks LINE CTA",
    consentRequired: true,
    notes: "Primary lead-intent",
  },
  {
    event: "phone_click",
    tier: "primary",
    trigger: "User clicks tel: CTA",
    consentRequired: true,
    notes: "Primary lead-intent",
  },
  {
    event: "facebook_click",
    tier: "primary",
    trigger: "User clicks Facebook CTA",
    consentRequired: true,
    notes: "Primary lead-intent",
  },
  {
    event: "maps_click",
    tier: "secondary",
    trigger: "User clicks Google Maps CTA",
    consentRequired: true,
    notes: "Store verification / visit intent",
  },
  {
    event: "valuation_start",
    tier: "secondary",
    trigger: "User opens checklist category or starts LINE from checklist",
    consentRequired: true,
    notes: "Preparation intent — not a completed lead",
  },
  {
    event: "contact_click",
    tier: "secondary",
    trigger: "Generic contact CTA (mapped from service_cta_click)",
    consentRequired: true,
    notes: "Supporting contact intent",
  },
  {
    event: "valuation_submit",
    tier: "future_backend",
    trigger: "Server-confirmed lead success only",
    consentRequired: true,
    notes: "MUST NOT fire from LINE/phone clicks or client-only actions",
  },
  {
    event: "evidence_view",
    tier: "supporting",
    trigger: "Verified evidence gallery interaction when present",
    consentRequired: true,
    notes: "Optional; avoid noise if unused",
  },
  {
    event: "service_process_view",
    tier: "supporting",
    trigger: "Inspection/process component interaction when instrumented",
    consentRequired: true,
    notes: "Optional; avoid noise if unused",
  },
];

export const ALLOWED_ANALYTICS_PARAMS = [
  "page_path",
  "page_type",
  "cta_location",
  "contact_method",
  "service_category",
  "component_name",
  "evidence_type",
  "content_cluster",
  "link_destination_type",
] as const;

export const FORBIDDEN_ANALYTICS_PARAM_HINTS = [
  "name",
  "phone",
  "email",
  "message",
  "serial",
  "imei",
  "address",
  "line_id",
  "image",
  "model",
  "password",
] as const;
