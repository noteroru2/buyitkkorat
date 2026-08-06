/**
 * Central business entity + public site configuration.
 * Verified storefront / Maps / Facebook are defaults; PUBLIC_* env may override.
 * Never invent GA4 or GSC tokens.
 */

import { isValidGa4MeasurementId, normalizeGa4MeasurementId } from "../utils/measurement";

function env(name: keyof ImportMetaEnv): string {
  const metaEnv = import.meta.env as ImportMetaEnv | undefined;
  const value = metaEnv?.[name];
  return typeof value === "string" ? value.trim() : "";
}

function envOr(name: keyof ImportMetaEnv, fallback: string): string {
  return env(name) || fallback;
}

/** Verified contact channels — phone/LINE fixed; FB/Maps verified with env override */
export const CONTACT_CHANNELS = {
  phoneDisplay: "095-547-9408",
  phoneTel: "+66955479408",
  lineId: "@buyhub",
  lineUrl: "https://line.me/R/ti/p/@buyhub",
  facebookUrl: envOr("PUBLIC_FACEBOOK_URL", "https://www.facebook.com/Amphontrading"),
  mapsUrl: envOr("PUBLIC_GOOGLE_MAPS_URL", "https://maps.app.goo.gl/krv97o14jPTRrnpW8"),
  /** GBP still unverified — env only */
  googleBusinessUrl: env("PUBLIC_GBP_URL"),
} as const;

/**
 * Physical storefront — verified Ubon NAP (Batch 1.1).
 * Env vars may override; empty env uses verified defaults.
 */
export const STORE_LOCATION = {
  tradeName: "ร้านอำพล เทรดดิ้ง",
  brandName: "WINNER IT",
  legalName: "บริษัท อำพล เทรดดิ้ง จำกัด",
  streetAddress: envOr("PUBLIC_STORE_STREET_ADDRESS", "740/8 ถนนชยางกูร"),
  subdistrict: envOr("PUBLIC_STORE_SUBDISTRICT", "ในเมือง"),
  district: envOr("PUBLIC_STORE_DISTRICT", "เมืองอุบลราชธานี"),
  province: envOr("PUBLIC_STORE_PROVINCE", "อุบลราชธานี"),
  postalCode: envOr("PUBLIC_STORE_POSTAL_CODE", "34000"),
  country: envOr("PUBLIC_STORE_COUNTRY", "TH"),
  /** Human-readable hours on pages */
  openingHoursText: envOr("PUBLIC_STORE_HOURS_TEXT", "ทุกวัน 09:00–21:00"),
  /** Schema.org openingHours string */
  openingHoursSchema: envOr("PUBLIC_STORE_OPENING_HOURS", "Mo-Su 09:00-21:00"),
  mapsUrl: CONTACT_CHANNELS.mapsUrl,
  /** Schema addressLocality per Batch 1.1 brief */
  addressLocality: "ตำบลในเมือง อำเภอเมืองอุบลราชธานี",
  hasVerifiedStreetAddress: true,
} as const;

export function formatStoreFullAddress(
  store: typeof STORE_LOCATION = STORE_LOCATION,
): string {
  return `${store.streetAddress} ตำบล${store.subdistrict} อำเภอ${store.district} จังหวัด${store.province} ${store.postalCode}`;
}

/** Korat is a service area, not a branch/office */
export const SERVICE_AREA = {
  primaryProvince: "นครราชสีมา",
  primaryAlias: "โคราช",
  label: "จังหวัดนครราชสีมาและพื้นที่ตามเงื่อนไขการนัดหมาย",
  isPhysicalBranch: false,
  wording:
    "จังหวัดนครราชสีมาเป็นพื้นที่ให้บริการประเมินราคา นัดรับสินค้า หรือรับผ่านการจัดส่งตามเงื่อนไข ไม่ใช่สาขาหรือสำนักงานประจำ",
} as const;

export const ANALYTICS = {
  gaMeasurementId: normalizeGa4MeasurementId(env("PUBLIC_GA_MEASUREMENT_ID")),
  gscVerification: env("PUBLIC_GSC_VERIFICATION"),
  /** True only when a syntactically valid GA4 Measurement ID is present */
  enabled: isValidGa4MeasurementId(env("PUBLIC_GA_MEASUREMENT_ID")),
  /** Lead form backend — reserved; never invent endpoints */
  leadEndpointConfigured: Boolean(env("PUBLIC_LEAD_ENDPOINT")),
} as const;

export const SITE = {
  name: "รับซื้อไอทีโคราช.com",
  brand: STORE_LOCATION.brandName,
  tradeName: STORE_LOCATION.tradeName,
  legalName: STORE_LOCATION.legalName,
  url: "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com",
  urlThai: "https://รับซื้อไอทีโคราช.com",
  phoneDisplay: CONTACT_CHANNELS.phoneDisplay,
  phoneTel: CONTACT_CHANNELS.phoneTel,
  lineId: CONTACT_CHANNELS.lineId,
  lineUrl: CONTACT_CHANNELS.lineUrl,
  facebookUrl: CONTACT_CHANNELS.facebookUrl,
  mapsUrl: CONTACT_CHANNELS.mapsUrl,
  serviceAreaLabel: SERVICE_AREA.label,
  organizationId: "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/#organization",
  localBusinessId: "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/#localbusiness",
  websiteId: "https://xn--42cmb2cn7ce1fa0bs7aw2n0a2f.com/#website",
  defaultOgImage: "/og/default.png",
  locale: "th_TH",
  language: "th",
  priceDisclaimer:
    "ราคาประเมินเบื้องต้นจากรูปและข้อมูลอาจเปลี่ยนแปลงได้หลังตรวจสอบสินค้าจริง",
  storeProvince: STORE_LOCATION.province,
  storeFullAddress: formatStoreFullAddress(STORE_LOCATION),
  analytics: ANALYTICS,
} as const;

export const FORBIDDEN_CLAIMS = [
  "อันดับ 1",
  "อันดับหนึ่ง",
  "ดีที่สุด",
  "ราคาสูงที่สุด",
  "ให้ราคาดีที่สุด",
  "แพงกว่าทุกร้าน",
  "รับซื้อทุกสภาพ",
  "รับซื้อทุกรุ่น",
  "เงินสดทันทีทุกกรณี",
  "ประเมินแม่นยำ 100%",
  "ลูกค้าพึงพอใจ 100%",
  "เปิด 24 ชั่วโมง",
  "ถึงที่ทันที",
  "มีทีมทุกอำเภอ",
  "มีทีมงานประจำทุกจังหวัด",
  "มีสาขาในโคราช",
  "สาขาโคราช",
  "หน้าร้านโคราช",
  "สำนักงานโคราช",
  "มีสาขาทั่วประเทศ",
  "ได้ราคาตามที่แจ้งแน่นอน",
] as const;

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const MAIN_NAV: NavItem[] = [
  {
    label: "บริการ",
    href: "/รับซื้อสินค้าไอที",
    children: [
      { label: "รับซื้อสินค้าไอที", href: "/รับซื้อสินค้าไอที" },
      { label: "รับซื้อถึงที่โคราช", href: "/บริการรับซื้อถึงที่โคราช" },
      { label: "ส่งสินค้ามาประเมิน", href: "/ส่งสินค้าไอทีมาประเมิน" },
      { label: "รับซื้อยกล็อต", href: "/รับซื้อสินค้าไอทียกล็อต" },
      { label: "อุปกรณ์สำนักงาน", href: "/รับซื้ออุปกรณ์สำนักงาน" },
    ],
  },
  {
    label: "หมวดสินค้า",
    href: "/รับซื้อสินค้าไอที",
    children: [
      { label: "iPhone", href: "/รับซื้อ-iphone-โคราช" },
      { label: "โน๊ตบุ๊ค", href: "/รับซื้อโน๊ตบุ๊ค-โคราช" },
      { label: "คอมพิวเตอร์", href: "/รับซื้อคอมพิวเตอร์-โคราช" },
      { label: "การ์ดจอ", href: "/รับซื้อการ์ดจอ-โคราช" },
      { label: "กล้อง", href: "/รับซื้อกล้อง-โคราช" },
      { label: "เครื่องเกม", href: "/รับซื้อเครื่องเกม-โคราช" },
    ],
  },
  { label: "พื้นที่บริการ", href: "/พื้นที่/เมืองนครราชสีมา" },
  { label: "วิธีขาย", href: "/วิธีขายสินค้า" },
  { label: "บทความ", href: "/บทความ" },
  { label: "ติดต่อ", href: "/ติดต่อ" },
];

export const FOOTER_LINKS = [
  { label: "บริการทั้งหมด", href: "/รับซื้อสินค้าไอที" },
  { label: "พื้นที่ให้บริการ", href: "/พื้นที่/เมืองนครราชสีมา" },
  { label: "วิธีขายสินค้า", href: "/วิธีขายสินค้า" },
  { label: "เกี่ยวกับเรา", href: "/เกี่ยวกับเรา" },
  { label: "ติดต่อ", href: "/ติดต่อ" },
  { label: "นโยบายความเป็นส่วนตัว", href: "/นโยบายความเป็นส่วนตัว" },
  { label: "นโยบายคุกกี้", href: "/นโยบายคุกกี้" },
  { label: "ข้อกำหนดการใช้บริการ", href: "/ข้อกำหนดการใช้บริการ" },
  {
    label: "นโยบายรับซื้อสินค้า",
    href: "/นโยบายรับซื้อสินค้าและการยืนยันเจ้าของ",
  },
] as const;

export const PREPARE_CHECKLIST = [
  "ยี่ห้อและรุ่น",
  "สเปกหรือรายละเอียดที่ทราบ",
  "สภาพการใช้งานและตำหนิ",
  "อุปกรณ์ที่แถมมา",
  "สถานะประกัน (ถ้าทราบ)",
  "รูปด้านหน้า ด้านหลัง และจุดตำหนิ",
  "จังหวัดหรืออำเภอปัจจุบัน",
  "จำนวนสินค้าที่ต้องการขาย",
] as const;

/** Event names allowed for analytics (no PII params) */
export const ANALYTICS_EVENTS = [
  "phone_click",
  "line_click",
  "facebook_click",
  "maps_click",
  "valuation_start",
  "valuation_submit",
  "contact_click",
  "evidence_view",
  "service_process_view",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
