/**
 * Lead capture architecture — foundation only.
 * Fails closed until a verified backend endpoint and credentials exist.
 * Do not invent Production endpoints or fake success states.
 */

export type LeadChannel = "line_external" | "phone_external" | "facebook_external" | "web_form";

export type LeadPayload = {
  productCategory?: string;
  brandModel?: string;
  specificationSummary?: string;
  condition?: string;
  defects?: string;
  accessories?: string;
  warranty?: string;
  province?: string;
  preferredContactMethod?: "line" | "phone" | "facebook";
  contactValue?: string;
  privacyConsent: boolean;
  /** Client-generated idempotency key — no PII */
  clientRequestId?: string;
};

export type LeadResult =
  | { ok: true; leadId: string; deliveredAt: string }
  | { ok: false; code: LeadErrorCode; message: string };

export type LeadErrorCode =
  | "BACKEND_NOT_CONFIGURED"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "SPAM_REJECTED"
  | "PAYLOAD_TOO_LARGE"
  | "UPLOAD_DISABLED"
  | "SERVER_ERROR";

export type LeadCaptureAdapter = {
  readonly name: string;
  isConfigured(): boolean;
  submit(payload: LeadPayload): Promise<LeadResult>;
};

export const LEAD_FIELD_LIMITS = {
  productCategory: 80,
  brandModel: 120,
  specificationSummary: 500,
  condition: 200,
  defects: 500,
  accessories: 300,
  warranty: 120,
  province: 80,
  contactValue: 120,
  maxPayloadBytes: 32_768,
  maxFiles: 0, // uploads disabled by default
  maxFileBytes: 0,
} as const;

export function validateLeadPayload(payload: LeadPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!payload.privacyConsent) errors.push("privacyConsent required");
  const check = (key: keyof typeof LEAD_FIELD_LIMITS, value?: string) => {
    if (value == null) return;
    const limit = LEAD_FIELD_LIMITS[key];
    if (typeof limit === "number" && value.length > limit) {
      errors.push(`${key} exceeds ${limit} chars`);
    }
  };
  check("productCategory", payload.productCategory);
  check("brandModel", payload.brandModel);
  check("specificationSummary", payload.specificationSummary);
  check("condition", payload.condition);
  check("defects", payload.defects);
  check("accessories", payload.accessories);
  check("warranty", payload.warranty);
  check("province", payload.province);
  check("contactValue", payload.contactValue);
  if (payload.contactValue && /password|รหัสผ่าน/i.test(payload.contactValue)) {
    errors.push("contactValue must not contain passwords");
  }
  return { valid: errors.length === 0, errors };
}

/** Default adapter — always fails closed (no Production form). */
export class UnconfiguredLeadAdapter implements LeadCaptureAdapter {
  readonly name = "unconfigured";
  isConfigured(): boolean {
    return false;
  }
  async submit(_payload: LeadPayload): Promise<LeadResult> {
    return {
      ok: false,
      code: "BACKEND_NOT_CONFIGURED",
      message: "Lead capture backend is not configured. Use LINE/phone/Facebook CTAs.",
    };
  }
}

export function getLeadCaptureAdapter(): LeadCaptureAdapter {
  // Future: read PUBLIC_LEAD_ENDPOINT + secrets and return HttpLeadAdapter.
  // Until then always fail closed.
  return new UnconfiguredLeadAdapter();
}

export const LEAD_CAPTURE_STATUS = {
  status: "FOUNDATION_ONLY" as const,
  productionForm: false,
  serverValidation: "designed" as const,
  antiSpam: "required_before_enable" as const,
  rateLimiting: "required_before_enable" as const,
  fileUpload: "disabled_by_default" as const,
  retentionPolicy: "required_before_storage" as const,
};
