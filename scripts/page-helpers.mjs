import { baseFaq } from "./service-content-lib.mjs";

export function page(cfg) {
  return {
    intent: "product",
    featured: false,
    minWords: 1500,
    faq: [...(cfg.extraFaq ?? []), ...baseFaq(cfg.faqTopic)],
    ...cfg,
  };
}

export function longParagraphs(items) {
  return items.join("\n\n");
}

export function sellerBlock(productName, extras = []) {
  const base = [
    `**ผู้ใช้ทั่วไปในโคราช** ที่เปลี่ยนรุ่นใหม่หรือเลิกใช้งาน มักมี${productName}เครื่องเดียวในสภาพใช้งานจริง ควรส่งรูปและสเปกให้ครบเพื่อลดเวลาถามซ้ำ`,
    `**นักเรียนและนักศึกษา** ในมหาวิทยาลัยและวิทยาลัยโคราช มักขายช่วงจบการศึกษาหรือเปลี่ยนอุปกรณ์ตามวิชาเรียน ช่วงเปิด-ปิดเทอมมีการสอบถามเข้ามาเป็นช่วงๆ`,
    `**พนักงานออฟฟิศและฟรีแลนซ์** ที่อัปเกรดเครื่องเพื่องานกราฟิก ตัดต่อ หรือเขียนโปรแกรม มักขายเครื่องเก่าที่ยังใช้งานได้แต่ไม่ทันความต้องการงาน`,
    `**ธุรกิจและหน่วยงาน** ที่เปลี่ยนระบบหรือเคลียร์อุปกรณ์เก่า สามารถสอบถามการรับซื้อหลายชิ้นหรือยกล็อตได้ที่ [รับซื้อสินค้าไอทียกล็อต](/รับซื้อสินค้าไอทียกล็อต) โดยนัดหมายล่วงหน้า`,
    `**ผู้ที่ซื้อมือสองมาใช้ต่อ** แล้วต้องการขายอีกครั้ง ควรมีหลักฐานการซื้อหรือประวัติการใช้งานเพื่อยืนยันเจ้าของ`,
  ];
  return longParagraphs([...base, ...extras]);
}

export function valuationList(factors) {
  const numbered = factors
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");
  return `ปัจจัยหลักที่ส่งผลต่อราคาประเมินมีดังนี้\n\n${numbered}\n\nเราใช้ข้อมูลจากรูปและคำตอบของคุณประกอบการประเมินเบื้องต้น ก่อนยืนยันหลังตรวจสินค้าจริง ราคาประเมินเบื้องต้นจากรูปและข้อมูลอาจเปลี่ยนแปลงได้หลังตรวจสอบสินค้าจริง`;
}

export function scenariosBlock(cases) {
  return cases
    .map((c, i) => `**สถานการณ์ที่ ${i + 1}:** ${c}`)
    .join("\n\n");
}

export function discloseList(items) {
  return `เพื่อความโปร่งใส ควรแจ้งข้อมูลเหล่านี้ตั้งแต่แรก\n\n${items.map((x) => `- ${x}`).join("\n")}\n\nการปกปิดอาจทำให้ราคาเปลี่ยนในวันตรวจจริง หรือยกเลิกรายการได้`;
}

export function tipsList(items) {
  return items.map((x) => `- ${x}`).join("\n");
}

export function prepareList(items) {
  return items.map((x) => `- ${x}`).join("\n");
}

export const HUB = "/รับซื้อสินค้าไอที";
export const LINE_PAGE = "/บริการรับซื้อถึงที่โคราช";
export const SHIP_PAGE = "/ส่งสินค้าไอทีมาประเมิน";
