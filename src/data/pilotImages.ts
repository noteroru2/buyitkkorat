import type { ImageMetadata } from "astro";
import evaluationWorkspace from "../assets/images/illustrations/ai/workspace/it-device-evaluation-workspace-ai.webp";
import bulkSortingWorkspace from "../assets/images/illustrations/ai/workspace/bulk-it-sorting-process-ai.webp";

export type PilotImageKey = "evaluation-workspace" | "bulk-sorting-workspace";

interface PilotImage {
  src: ImageMetadata;
  alt: string;
  caption: string;
  role: "Evaluation workspace illustration" | "B2B workflow";
  slotId: string;
  sourceRepoPath: string;
  originalSha256: string;
  rightsEvidence: string;
  privacyStatus: string;
}

export const PILOT_IMAGES: Record<PilotImageKey, PilotImage> = {
  "evaluation-workspace": {
    src: evaluationWorkspace,
    alt: "ภาพประกอบโต๊ะตรวจสอบคอมพิวเตอร์และอุปกรณ์ไอที",
    caption: "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา",
    role: "Evaluation workspace illustration",
    slotId: "SERVICE-EVALUATION-WORKSPACE-01",
    sourceRepoPath: "src/assets/images/illustrations/ai/workspace/inspection-workspace-concept-ai.webp",
    originalSha256: "6bf12dbeaf35949ab4714f1a875420699e709d09127bb04d18ec1658582b0838",
    rightsEvidence: "docs/batch-14b/approved-ai-assets.json AI-13; commit 0d5e3b9",
    privacyStatus: "Passed: no people, customer data, serial, QR, document or location text detected",
  },
  "bulk-sorting-workspace": {
    src: bulkSortingWorkspace,
    alt: "ภาพประกอบพื้นที่คัดแยกและแพ็กอุปกรณ์ไอทีหลายชิ้น",
    caption: "ภาพประกอบเพื่ออธิบายขั้นตอนการให้บริการ ไม่ใช่ภาพสถานที่หรือสาขาจริงในจังหวัดนครราชสีมา",
    role: "B2B workflow",
    slotId: "SERVICE-BULK-SORTING-01",
    sourceRepoPath: "src/assets/images/illustrations/ai/workspace/packing-storage-workspace-concept-ai.webp",
    originalSha256: "acb3ae04bb2a8b3434b48b2ae1644fa7e09a180e56491ab61c60548c40b5427c",
    rightsEvidence: "docs/batch-14b/approved-ai-assets.json AI-14; commit 0d5e3b9",
    privacyStatus: "Passed: no people, customer data, serial, QR, document or location text detected",
  },
};
