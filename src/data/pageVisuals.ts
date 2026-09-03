import type { ImageMetadata } from "astro";

import generalCover from "../assets/images/realistic/general-it-cover.webp";
import notebookCover from "../assets/images/realistic/notebook-cover.webp";
import desktopCover from "../assets/images/realistic/desktop-cover.webp";
import mobileCover from "../assets/images/realistic/mobile-apple-cover.webp";
import componentCover from "../assets/images/realistic/component-cover.webp";
import cameraCover from "../assets/images/realistic/camera-cover.webp";
import gamingCover from "../assets/images/realistic/gaming-cover.webp";
import bulkOfficeCover from "../assets/images/realistic/bulk-office-cover.webp";
import localPickupCover from "../assets/images/realistic/local-pickup-cover.webp";
import lineCtaBanner from "../assets/images/realistic/line-cta-banner.webp";

export interface PageVisualAsset {
  image: ImageMetadata;
  alt: string;
  caption?: string;
  slotId: string;
}

export interface PageVisualSet {
  cover: PageVisualAsset;
  cta: PageVisualAsset;
}

const SHARED_CTA_VISUAL: PageVisualAsset = {
  image: lineCtaBanner,
  alt: "ภาพประกอบการส่งรูปสินค้าไอทีเพื่อประเมินราคาผ่าน LINE",
  caption: "แนะนำให้ส่งรุ่น สเปก รูปสภาพ และตำหนิผ่าน LINE เพื่อให้ทีมงานเช็กข้อมูลเบื้องต้นได้เร็วขึ้น",
  slotId: "VISUAL-CTA-LINE-01",
};

const ASSETS = {
  general: {
    image: generalCover,
    alt: "โต๊ะจัดวางสินค้าไอทีหลายประเภท เช่น จอ คอมพิวเตอร์ โทรศัพท์ และโน้ตบุ๊ก",
    caption: "ภาพประกอบหมวดรับซื้อสินค้าไอที ใช้ช่วยให้เห็นประเภทสินค้าที่ประเมินได้",
    slotId: "VISUAL-GENERAL-01",
  },
  notebook: {
    image: notebookCover,
    alt: "โน้ตบุ๊กหลายประเภทวางเรียงบนโต๊ะ เช่น โน้ตบุ๊กบางเบา รุ่นทำงาน และเกมมิ่ง",
    caption: "เหมาะกับหน้ารับซื้อโน้ตบุ๊กและหมวดแล็ปท็อปที่ต้องดูรุ่น สเปก และสภาพ",
    slotId: "VISUAL-NOTEBOOK-01",
  },
  desktop: {
    image: desktopCover,
    alt: "คอมพิวเตอร์ตั้งโต๊ะพร้อมจอ คีย์บอร์ด เมาส์ และการ์ดจอวางบนโต๊ะ",
    caption: "ใช้กับหน้ารับซื้อคอมพิวเตอร์ตั้งโต๊ะ คอมประกอบ เกมมิ่ง และเวิร์กสเตชัน",
    slotId: "VISUAL-DESKTOP-01",
  },
  mobile: {
    image: mobileCover,
    alt: "สมาร์ทโฟน แท็บเล็ต และสมาร์ตวอทช์วางบนโต๊ะโทนสว่าง",
    caption: "เหมาะกับหน้ารับซื้อมือถือ iPhone iPad แท็บเล็ต และอุปกรณ์พกพา",
    slotId: "VISUAL-MOBILE-01",
  },
  component: {
    image: componentCover,
    alt: "ชิ้นส่วนคอมพิวเตอร์ เช่น การ์ดจอ เมนบอร์ด CPU RAM SSD และพัดลม",
    caption: "ใช้กับหน้ารับซื้ออะไหล่คอมและอุปกรณ์ภายในเครื่อง",
    slotId: "VISUAL-COMPONENT-01",
  },
  camera: {
    image: cameraCover,
    alt: "กล้องดิจิทัลพร้อมเลนส์และอุปกรณ์ทำความสะอาดบนโต๊ะ",
    caption: "เหมาะกับหน้ารับซื้อกล้อง เลนส์ และบทความที่เกี่ยวกับอุปกรณ์ถ่ายภาพ",
    slotId: "VISUAL-CAMERA-01",
  },
  gaming: {
    image: gamingCover,
    alt: "เครื่องเกม คอนโทรลเลอร์ หูฟัง และลำโพงวางบนโต๊ะ",
    caption: "ใช้กับหน้ารับซื้อเครื่องเกม PlayStation Nintendo และอุปกรณ์เกมมิ่ง",
    slotId: "VISUAL-GAMING-01",
  },
  bulk: {
    image: bulkOfficeCover,
    alt: "อุปกรณ์ไอทีจำนวนมากในโกดังหรือพื้นที่คัดแยก เช่น โน้ตบุ๊ก จอ ปริ้นเตอร์ และอุปกรณ์เครือข่าย",
    caption: "เหมาะกับหน้ารับซื้อยกล็อต สำนักงาน บริษัท และงานคัดแยกหลายชิ้น",
    slotId: "VISUAL-BULK-01",
  },
  area: {
    image: localPickupCover,
    alt: "ฉากนัดรับอุปกรณ์ไอทีพร้อมกล่องส่งของและอุปกรณ์ตรวจรับหน้างาน",
    caption: "สื่อถึงบริการนัดรับหรือทางเลือกการจัดส่งตามเงื่อนไขของพื้นที่และคิวงาน",
    slotId: "VISUAL-AREA-01",
  },
} satisfies Record<string, PageVisualAsset>;

const slugOrText = (...values: (string | undefined)[]) => values.filter(Boolean).join(" ").toLowerCase();
const hasAny = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

function selectServiceCover(slug: string, title?: string, productFocus?: string): PageVisualAsset {
  const text = slugOrText(slug, title, productFocus);

  if (hasAny(text, ["ยกล็อต", "หลายเครื่อง", "สำนักงาน", "บริษัท", "server", "network", "pos", "ปริ้น", "printer", "คอมบริษัท"])) return ASSETS.bulk;
  if (hasAny(text, ["กล้อง", "เลนส์", "camera", "shutter"])) return ASSETS.camera;
  if (hasAny(text, ["playstation", "nintendo", "เครื่องเกม", "หูฟัง", "ลำโพง", "speaker", "logitech", "razer"])) return ASSETS.gaming;
  if (hasAny(text, ["โน๊ตบุ๊ค", "notebook", "macbook", "laptop", "dell latitude", "asus rog", "surface", "matebook", "galaxy book", "galaxy-book"])) return ASSETS.notebook;
  if (hasAny(text, ["จอมอนิเตอร์", "monitor", "ultragear", "ultrasharp", "odyssey"])) return ASSETS.desktop;
  if (hasAny(text, ["iphone", "ipad", "apple watch", "โทรศัพท์", "tablet", "แท็บเล็ต", "android", "samsung", "oppo", "vivo", "xiaomi", "realme", "honor", "motorola", "nothing", "มือถือ"])) return ASSETS.mobile;
  if (hasAny(text, ["การ์ดจอ", "gpu", "cpu", "ssd", "hdd", "แรม", "ram", "เมนบอร์ด", "mainboard"])) return ASSETS.component;
  if (hasAny(text, ["คอม", "desktop", "เวิร์กสเตชัน", "workstation"])) return ASSETS.desktop;
  if (hasAny(text, ["ถึงที่", "ส่งสินค้า", "วิธีขาย", "ประเมินราคา"])) return ASSETS.area;
  return ASSETS.general;
}

function selectArticleCover(slug: string, title?: string): PageVisualAsset {
  const text = slugOrText(slug, title);

  if (hasAny(text, ["icloud", "google", "มือถือ", "iphone", "ipad", "android", "แบตเตอรี่"])) return ASSETS.mobile;
  if (hasAny(text, ["shutter", "กล้อง", "เลนส์"])) return ASSETS.camera;
  if (hasAny(text, ["ssd", "ข้อมูล", "คอมพิวเตอร์", "สเปก", "โน๊ตบุ๊ค", "macbook"])) return hasAny(text, ["โน๊ตบุ๊ค", "macbook", "สเปก"]) ? ASSETS.notebook : ASSETS.desktop;
  return ASSETS.general;
}

export function getServicePageVisuals(slug: string, title?: string, productFocus?: string): PageVisualSet {
  return { cover: selectServiceCover(slug, title, productFocus), cta: SHARED_CTA_VISUAL };
}

export function getAreaPageVisuals(): PageVisualSet {
  return { cover: ASSETS.area, cta: SHARED_CTA_VISUAL };
}

export function getArticlePageVisuals(slug: string, title?: string): PageVisualSet {
  return { cover: selectArticleCover(slug, title), cta: SHARED_CTA_VISUAL };
}

export function getTrustPageVisuals(): PageVisualSet {
  return { cover: ASSETS.general, cta: SHARED_CTA_VISUAL };
}

export const HOME_PAGE_VISUALS: PageVisualSet = {
  cover: ASSETS.general,
  cta: SHARED_CTA_VISUAL,
};

export const AREA_DIRECTORY_VISUALS: PageVisualSet = {
  cover: ASSETS.area,
  cta: SHARED_CTA_VISUAL,
};

export const ARTICLE_DIRECTORY_VISUALS: PageVisualSet = {
  cover: ASSETS.general,
  cta: SHARED_CTA_VISUAL,
};
