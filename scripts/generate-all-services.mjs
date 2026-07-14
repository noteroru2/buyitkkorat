import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  BRAND,
  LEGAL,
  LINE,
  PHONE,
  DISCLAIMER,
  buildSections,
  baseFaq,
} from "./service-content-lib.mjs";

const OUT = join(process.cwd(), "src/content/services");
mkdirSync(OUT, { recursive: true });

function countThaiWords(text) {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (isWordLike && segment.trim()) count += 1;
  }
  return count;
}

function yamlEscape(s) {
  return s.replace(/"/g, '\\"').replace(/\n/g, " ");
}

function buildFaq(items) {
  return items
    .map(
      (f) =>
        `  - question: "${yamlEscape(f.q)}"\n    answer: "${yamlEscape(f.a)}"`,
    )
    .join("\n");
}

function deepDive(title, paragraphs) {
  return `## ${title}\n\n${paragraphs.join("\n\n")}`;
}

function expandPool(productShort, h1, idx) {
  const pool = [
    deepDive(`ข้อมูลเพิ่มเติมเกี่ยวกับการขาย${productShort}ในโคราช`, [
      `ตลาดมือสองในนครราชสีมามีทั้งผู้ซื้อที่ต้องการใช้งานต่อเนื่องและผู้ที่มองหาอุปกรณ์เพื่อการเรียนหรือทำงาน ${BRAND} จึงเน้นการสื่อสารที่ชัดเจนเรื่องสภาพจริงของสินค้า แทนการใช้คำโฆษณาเกินจริง การส่งรูปที่เห็นรายละเอียดสำคัญ เช่น ตำหนิที่มองไม่เห็นในมุมกว้าง หรืออาการทำงานที่ต้องทดสอบบนเครื่อง จะช่วยให้การประเมินเบื้องต้นใกล้เคียงราคาสุดท้ายมากขึ้น`,
      `ลูกค้าหลายรายในโคราชเลือกขาย${productShort}หลังอัปเกรดรุ่นใหม่หรือเปลี่ยนไปใช้แพลตฟอร์มอื่น บางรายขายเพราะย้ายงาน ย้ายจังหวัด หรือต้องการระดมทุนระยะสั้น ไม่ว่าเหตุผลใด เราพร้อมช่วยประเมินอย่างเป็นกลาง โดยย้ำว่า ${DISCLAIMER}`,
      `${LEGAL} ดำเนินธุรกิจภายใต้แบรนด์ ${BRAND} ด้วยหลักการตรวจสอบสินค้าจริงก่อนชำระเงินทุกครั้ง หากคุณอยู่ในอำเภอเมือง ปากช่อง สีคิ้ว หรือพื้นที่ใกล้เคียง สามารถสอบถามคิวนัดรับผ่าน LINE ${LINE} ได้ตามตารางงานของทีม`,
    ]),
    deepDive(`คำถามที่พบบ่อยระหว่างประเมิน${productShort}`, [
      `ลูกค้ามักถามว่าควรลบข้อมูลก่อนส่งรูปหรือไม่ คำตอบคือควรสำรองข้อมูลก่อน แล้วลบหรือรีเซ็ตก่อนส่งมอบจริง แต่ระหว่างประเมินเบื้องต้นควรเปิดเครื่องได้เพื่อถ่ายหน้าตั้งค่าและทดสอบฟังก์ชัน หากรีเซ็ตก่อนส่งรูปโดยยังไม่ออกจากบัญชี อาจทำให้ตรวจสอบล็อกไม่ได้`,
      `อีกคำถามคือการขายหลายชิ้นพร้อมกัน สามารถทำได้โดยส่งรายการเป็นตารางใน LINE พร้อมรูปแยกแต่ละชิ้น ทีมงานจะสรุปราคาเบื้องต้นแยกรายการ หรือเป็นแพ็กตามความเหมาะสม สำหรับธุรกิจหรือหน่วยงานที่ต้องการเคลียร์อุปกรณ์เก่า สามารถสอบถามเงื่อนไขเอกสารเพิ่มเติมได้`,
      `เรื่องการชำระเงิน จะดำเนินการหลังตรวจสอบสินค้าและเอกสารครบถ้วน วิธีชำระขึ้นกับที่ตกลงกัน ไม่ได้ระบุว่าเงินสดทันทีทุกกรณี แต่จะแจ้งรายละเอียดชัดเจนก่อนเริ่มรายการ`,
    ]),
    deepDive(`แนวทางถ่ายรูป${productShort}เพื่อประเมินที่แม่นยำขึ้น`, [
      `ถ่ายในที่มีแสงเพียงพอ หลีกเลี่ยงเงาจัดที่บดบังรายละเอียด ควรมีภาพด้านหน้า ด้านหลัง ขอบตัวเครื่อง มุมที่เห็นตำหนิชัดเจน และภาพหน้าจอหรือหน้าตั้งค่าที่เกี่ยวข้อง หากมีกล่องหรืออุปกรณ์ ให้จัดวางในภาพเดียวกันเพื่อให้เห็นความครบ`,
      `หากมีตำหนิสำคัญ เช่น รอยบุบ จอร้าว หรืออาการทำงานผิดปกติ ควรถ่ายใกล้และไกลสลับกัน เพื่อให้ทีมประเมินเห็นทั้งบริบทและรายละเอียด การระบุประวัติซ่อมตั้งแต่แรกช่วยลดการปรับราคาในวันตรวจจริง`,
      `สำหรับลูกค้าในโคราชที่ไม่สะดวกถ่ายรูปมาก อย่างน้อยควรมีภาพรุ่น/สเปกที่อ่านได้ ภาพสภาพรวม และภาพจุดที่มีปัญหา ทีมงานจะแจ้งรายการภาพเพิ่มเติมหากจำเป็น`,
    ]),
    deepDive(`บริบทตลาด${productShort}ในนครราชสีมา`, [
      `โคราชเป็นจังหวัดที่มีทั้งภาคการศึกษา ภาคอุตสาหกรรม และภาคบริการ ทำให้ความต้องการอุปกรณ์ไอทีหมุนเวียนสูงตลอดปี ช่วงเปิดเทอม งานอีเวนต์ หรือรอบเปลี่ยนรุ่นมักมีสินค้าเข้ามาประเมินมากขึ้น ราคาจึงปรับตามช่วงเวลาและอุปสงค์จริง`,
      `${BRAND} ไม่ได้อ้างสถิติลูกค้าหรือรีวิวที่ตรวจสอบไม่ได้ แต่ให้ความสำคัญกับกระบวนการที่ตรวจสอบได้จริง คือการส่งข้อมูล การประเมินเบื้องต้น การนัดหมาย การตรวจสินค้า และการชำระเงินตามที่ตกลง`,
      `หากคุณยังไม่แน่ใจว่าควรขายตอนนี้หรือไม่ สามารถขอประเมินเบื้องต้นเพื่อใช้เปรียบเทียบกับทางเลือกอื่นได้ โดยไม่มีข้อผูกมัดว่าต้องขาย หากราคาหลังตรวจสอบไม่ตรงความคาดหวัง สามารถนำสินค้ากลับได้`,
    ]),
    deepDive(`การประสานงานกับ ${BRAND} สำหรับ${productShort}`, [
      `ช่องทางหลักคือ LINE ${LINE} และโทร ${PHONE} แนะนำให้ส่งข้อมูลครั้งเดียวให้ครบ ได้แก่ รุ่น สเปก สภาพ อุปกรณ์ ประวัติซ่อม และพื้นที่นัดรับโดยประมาณ จะช่วยให้ทีมตอบกลับเร็วขึ้น`,
      `หลังได้ราคาเบื้องต้น ลูกค้าเลือกได้ว่าจะนัดรับในโคราช หรือส่งสินค้ามาประเมิน ทั้งสองแบบต้องตรวจสอบสินค้าจริงก่อนสรุปราคาสุดท้าย การนัดหมายล่วงหน้าช่วยให้ทีมวางแผนเส้นทางและเวลาได้ดีขึ้น`,
      `สำหรับหน้า ${h1} นี้เป็นข้อมูลเฉพาะทางเพื่อช่วยให้คุณเตรียมตัวก่อนขาย หากต้องการภาพรวมบริการทั้งหมด สามารถไปที่หน้า [รับซื้อสินค้าไอที](/รับซื้อสินค้าไอที) เพื่อดูหมวดอื่นๆ เช่น โน๊ตบุ๊ค คอมพิวเตอร์ หรืออุปกรณ์เสริม`,
    ]),
  ];
  return pool[idx % pool.length];
}

function buildFile(page) {
  let body = buildSections(page).join("\n\n");
  const minWords = page.minWords ?? 1500;
  let words = countThaiWords(body);
  let extraIdx = 0;
  const extras = page.extras ?? [];
  while (words < minWords && extraIdx < extras.length) {
    body += "\n\n" + extras[extraIdx++];
    words = countThaiWords(body);
  }
  while (words < minWords) {
    body += "\n\n" + expandPool(page.productShort, page.h1, extraIdx++);
    words = countThaiWords(body);
  }

  const related = (page.relatedPages ?? [])
    .map((s) => `  - "${s}"`)
    .join("\n");

  const fm = `---
title: "${yamlEscape(page.title)}"
description: "${yamlEscape(page.description)}"
h1: "${yamlEscape(page.h1)}"
slug: "${page.slug}"
category: "${page.category}"
intent: "product"
excerpt: "${yamlEscape(page.excerpt)}"
publishedDate: 2026-01-15
updatedDate: 2026-07-14
featured: ${page.featured ?? false}
indexable: true
ogImage: "/og/default.png"
relatedPages:
${related}
serviceArea: "นครราชสีมา"
faq:
${buildFaq(page.faq)}
author: "${BRAND}"
reviewer: "${BRAND}"${page.productFocus ? `\nproductFocus: "${page.productFocus}"` : ""}
illustration: "${page.illustration}"
---

${body}
`;

  return { fm, words };
}

// Import page definitions
const { pages } = await import("./service-pages-data.mjs");

const results = [];
for (const page of pages) {
  const { fm, words } = buildFile(page);
  const path = join(OUT, `${page.slug}.md`);
  writeFileSync(path, fm, "utf8");
  results.push({ slug: page.slug, words, ok: words >= (page.minWords ?? 1500) });
}

console.log("Generated", results.length, "files");
for (const r of results) {
  console.log(`${r.ok ? "OK" : "FAIL"} ${r.slug}: ${r.words} words`);
}
const failed = results.filter((r) => !r.ok);
if (failed.length) process.exit(1);
