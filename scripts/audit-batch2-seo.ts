/**
 * Batch 2 SEO regressions: metadata, thin remediation markers, hub links.
 */
import {
  ensureDist,
  fileToRoute,
  loadHtml,
  printIssues,
  walkHtml,
  type Issue,
} from "./audit-lib";

ensureDist();
const issues: Issue[] = [];

const FORMER_THIN = [
  "/บทความ/ปัจจัยที่ทำให้ราคาการ์ดจอมือสองแตกต่างกัน",
  "/บทความ/ssd-และข้อมูลส่วนตัวควรจัดการอย่างไรก่อนขาย",
  "/บทความ/กล่องและอุปกรณ์มีผลต่อราคามือสองหรือไม่",
  "/บทความ/ขายคอมหลายเครื่องควรเตรียมรายการอย่างไร",
  "/บทความ/ขายอุปกรณ์ไอทีของบริษัทต้องเตรียมเอกสารอะไร",
  "/บทความ/ข้อควรรู้ก่อนขายกล้องและเลนส์มือสอง",
  "/บทความ/วิธีถ่ายรูปสินค้าไอทีเพื่อให้ประเมินราคาได้เร็ว",
  "/บทความ/วิธีออกจากบัญชี-google-ก่อนขายโทรศัพท์-android",
  "/บทความ/สินค้าไอทีเปิดไม่ติดยังประเมินราคาได้อย่างไร",
  "/บทความ/ส่งโน๊ตบุ๊คหรือโทรศัพท์อย่างไรให้ปลอดภัย",
  "/พื้นที่/ด่านขุนทด",
  "/พื้นที่/บัวใหญ่",
  "/พื้นที่/พิมาย",
  "/พื้นที่/โนนสูง",
];

function approxThaiWords(text: string): number {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const { isWordLike } of segmenter.segment(text)) {
    if (isWordLike) count += 1;
  }
  return count;
}

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  if (route === "/404") continue;
  const $ = loadHtml(file);
  const title = $("title").first().text().trim();
  const desc = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href") ?? "";
  const h1 = $("h1").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content") ?? "";
  const ogDesc = $('meta[property="og:description"]').attr("content") ?? "";
  const ogImage = $('meta[property="og:image"]').attr("content") ?? "";
  const twCard = $('meta[name="twitter:card"]').attr("content") ?? "";
  const twTitle = $('meta[name="twitter:title"]').attr("content") ?? "";
  const twImage = $('meta[name="twitter:image"]').attr("content") ?? "";
  const robots = $('meta[name="robots"]').attr("content") ?? "";

  if (!title) issues.push({ level: "critical", type: "meta-title", message: "empty title", file: route });
  if (!desc) issues.push({ level: "critical", type: "meta-desc", message: "empty description", file: route });
  if (!h1) issues.push({ level: "critical", type: "h1", message: "missing h1", file: route });
  if (!canonical.startsWith("https://")) {
    issues.push({ level: "critical", type: "canonical", message: canonical, file: route });
  }
  if (!ogTitle || !ogDesc || !ogImage) {
    issues.push({ level: "critical", type: "og", message: "incomplete OG", file: route });
  }
  if (!twCard || !twTitle || !twImage) {
    issues.push({ level: "critical", type: "twitter", message: "incomplete twitter card", file: route });
  }
  if (/สาขาโคราช|หน้าร้านโคราช|สำนักงานโคราช/.test(`${title}${desc}${h1}`)) {
    const window = `${title} ${desc} ${h1}`;
    if (!/ไม่(มี|ใช่|ได้อ้าง)|ไม่อ้าง/.test(window)) {
      issues.push({ level: "critical", type: "branch-meta", message: "branch claim in metadata", file: route });
    }
  }

  const mainText = $(".main-content").text() || $("main").text();
  const words = approxThaiWords(mainText);

  if (FORMER_THIN.includes(route) && words < 450) {
    issues.push({
      level: "critical",
      type: "thin-remediation",
      message: `still thin words=${words}`,
      file: route,
    });
  }

  if (route === "/คำถามที่พบบ่อย") {
    if (!mainText.includes("อุบลราชธานี") || !mainText.includes("34000")) {
      issues.push({ level: "critical", type: "faq-ubon", message: "FAQ missing Ubon NAP", file: route });
    }
    const faqCount = $("details summary").length;
    if (faqCount < 8) {
      issues.push({ level: "critical", type: "faq-count", message: `faq=${faqCount}`, file: route });
    }
  }

  if (route === "/พื้นที่/เมืองนครราชสีมา") {
    if (!mainText.includes("740/8") || !mainText.includes("อุบลราชธานี")) {
      issues.push({
        level: "critical",
        type: "city-hub-ubon",
        message: "city hub missing Ubon store facts",
        file: route,
      });
    }
    const hrefs: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      try {
        hrefs.push(decodeURIComponent(href));
      } catch {
        hrefs.push(href);
      }
    });
    for (const spoke of ["/พื้นที่/ด่านขุนทด", "/พื้นที่/บัวใหญ่", "/พื้นที่/พิมาย", "/พื้นที่/โนนสูง"]) {
      if (!hrefs.some((h) => h === spoke || h.endsWith(spoke))) {
        issues.push({
          level: "critical",
          type: "city-hub-spoke",
          message: `missing spoke ${spoke}`,
          file: route,
        });
      }
    }
  }

  if (FORMER_THIN.some((p) => p.startsWith("/พื้นที่/") && p === route)) {
    const hrefs: string[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      try {
        hrefs.push(decodeURIComponent(href));
      } catch {
        hrefs.push(href);
      }
    });
    if (!hrefs.some((h) => h === "/พื้นที่/เมืองนครราชสีมา" || h.includes("/พื้นที่/เมืองนครราชสีมา"))) {
      issues.push({
        level: "critical",
        type: "area-hub-link",
        message: "amphoe missing city hub link",
        file: route,
      });
    }
  }

  if (/noindex/i.test(robots) && route !== "/404") {
    issues.push({ level: "warning", type: "noindex", message: robots, file: route });
  }
}

const critical = printIssues("audit:batch2-seo", issues);
process.exit(critical > 0 ? 1 : 0);
