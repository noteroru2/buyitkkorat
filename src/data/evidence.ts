/**
 * First-party evidence governance (Batch 4).
 * Only items with verified + consent + privacyReviewed may render publicly.
 * Do not invent store photos, reviews, or transaction proof.
 */

export type EvidenceType =
  | "storefront"
  | "interior"
  | "process"
  | "product_example"
  | "channel"
  | "illustration_disclosed"
  | "document";

export type EvidenceStatus =
  | "VERIFIED_FIRST_PARTY"
  | "LIKELY_FIRST_PARTY_NEEDS_CONFIRMATION"
  | "GENERIC_ASSET"
  | "STOCK_OR_EXTERNAL"
  | "ILLUSTRATION_NOT_STORE_PROOF"
  | "PRIVACY_RISK"
  | "UNSUITABLE"
  | "DUPLICATE"
  | "NOT_PROVEN";

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  status: EvidenceStatus;
  /** Public path or empty when non-image / not published */
  asset?: string;
  title: string;
  description: string;
  alt?: string;
  caption?: string;
  source: string;
  verified: boolean;
  consent: boolean;
  privacyReviewed: boolean;
  /** ISO date only when known; omit when unknown */
  capturedAt?: string;
  location?: string;
  relatedServices?: string[];
  allowedPages?: string[];
  schemaEligible: boolean;
  publish: boolean;
  notes?: string;
};

/**
 * Inventory of known assets. AI illustrations are catalogued but never
 * published as store proof. Channel URLs are verified business facts.
 */
export const EVIDENCE_REGISTRY: EvidenceItem[] = [
  {
    id: "channel-maps-ubon",
    type: "channel",
    status: "VERIFIED_FIRST_PARTY",
    title: "Google Maps หน้าร้านอุบลราชธานี",
    description: "ลิงก์แผนที่หน้าร้านจริงที่ยืนยันแล้ว",
    source: "CONTACT_CHANNELS.mapsUrl / Batch 1.1 verification",
    verified: true,
    consent: true,
    privacyReviewed: true,
    location: "อุบลราชธานี",
    allowedPages: ["/", "/เกี่ยวกับเรา", "/ติดต่อ"],
    schemaEligible: true,
    publish: true,
    notes: "Rendered as Maps CTA link, not an image gallery item",
  },
  {
    id: "channel-facebook",
    type: "channel",
    status: "VERIFIED_FIRST_PARTY",
    title: "Facebook เพจร้าน",
    description: "ลิงก์เพจ Facebook ที่ยืนยันแล้ว",
    source: "CONTACT_CHANNELS.facebookUrl / Batch 1.1 verification",
    verified: true,
    consent: true,
    privacyReviewed: true,
    allowedPages: ["/", "/เกี่ยวกับเรา", "/ติดต่อ"],
    schemaEligible: true,
    publish: true,
    notes: "Rendered as Facebook CTA link, not embedded widget",
  },
  {
    id: "nap-ubon-store",
    type: "channel",
    status: "VERIFIED_FIRST_PARTY",
    title: "NAP หน้าร้านอุบลราชธานี",
    description: "ชื่อ ที่อยู่ และเวลาเปิดทำการที่ยืนยันแล้ว",
    source: "STORE_LOCATION / Batch 1.1",
    verified: true,
    consent: true,
    privacyReviewed: true,
    location: "อุบลราชธานี",
    allowedPages: ["/", "/เกี่ยวกับเรา", "/ติดต่อ"],
    schemaEligible: true,
    publish: true,
  },
  {
    id: "ai-evaluation-workspace",
    type: "illustration_disclosed",
    status: "ILLUSTRATION_NOT_STORE_PROOF",
    asset: "src/assets/images/illustrations/ai/workspace/it-device-evaluation-workspace-ai.webp",
    title: "ภาพประกอบโต๊ะตรวจสินค้า (AI)",
    description: "ภาพประกอบขั้นตอนบริการ — ไม่ใช่ภาพหน้าร้านจริง",
    alt: "ภาพประกอบโต๊ะตรวจสอบคอมพิวเตอร์และอุปกรณ์ไอที",
    caption:
      "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา",
    source: "pilotImages.ts / docs/batch-14b/approved-ai-assets.json",
    verified: false,
    consent: true,
    privacyReviewed: true,
    schemaEligible: false,
    publish: false,
    notes: "May appear on service pages via pilotImage with disclosed caption only",
  },
  {
    id: "ai-bulk-sorting",
    type: "illustration_disclosed",
    status: "ILLUSTRATION_NOT_STORE_PROOF",
    asset: "src/assets/images/illustrations/ai/workspace/bulk-it-sorting-process-ai.webp",
    title: "ภาพประกอบคัดแยกสินค้า (AI)",
    description: "ภาพประกอบ workflow ยกล็อต — ไม่ใช่ภาพหน้าร้านจริง",
    alt: "ภาพประกอบพื้นที่คัดแยกและแพ็กอุปกรณ์ไอทีหลายชิ้น",
    caption:
      "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา",
    source: "pilotImages.ts / docs/batch-14b/approved-ai-assets.json",
    verified: false,
    consent: true,
    privacyReviewed: true,
    schemaEligible: false,
    publish: false,
  },
  {
    id: "og-default",
    type: "document",
    status: "GENERIC_ASSET",
    asset: "/og/default.png",
    title: "Open Graph default image",
    description: "ภาพโซเชียลเริ่มต้น ไม่ใช่หลักฐานหน้าร้าน",
    source: "public/og/default.png",
    verified: false,
    consent: true,
    privacyReviewed: true,
    schemaEligible: false,
    publish: false,
  },
];

export function isPublishableEvidence(item: EvidenceItem): boolean {
  return (
    item.publish === true &&
    item.verified === true &&
    item.consent === true &&
    item.privacyReviewed === true &&
    item.status === "VERIFIED_FIRST_PARTY"
  );
}

/** Image gallery items only — currently none (no verified store photos). */
export function getPublishablePhotoEvidence(): EvidenceItem[] {
  return EVIDENCE_REGISTRY.filter(
    (item) =>
      isPublishableEvidence(item) &&
      Boolean(item.asset) &&
      (item.type === "storefront" ||
        item.type === "interior" ||
        item.type === "process" ||
        item.type === "product_example"),
  );
}

export function getPublishableChannelEvidence(): EvidenceItem[] {
  return EVIDENCE_REGISTRY.filter((item) => isPublishableEvidence(item) && item.type === "channel");
}

export function countEvidenceByStatus(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of EVIDENCE_REGISTRY) {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
  }
  return counts;
}
