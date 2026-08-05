/**
 * Batch 3 — content authority / commercial intent regressions.
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

const NEW_ARTICLES = [
  "/บทความ/วิธีเช็กสุขภาพแบตเตอรี่ก่อนขายมือถือและโน้ตบุ๊ก",
  "/บทความ/cycle-count-และ-activation-lock-ก่อนขาย-macbook",
  "/บทความ/shutter-count-คืออะไรก่อนขายกล้องดิจิทัล",
  "/บทความ/ราคาประเมินจากรูปกับราคาหลังตรวจต่างกันอย่างไร",
];

const MONEY_SUPPORT: Record<string, string[]> = {
  "/รับซื้อโน๊ตบุ๊ค-โคราช": ["วิธีเช็กสุขภาพแบตเตอรี่"],
  "/รับซื้อ-macbook-โคราช": ["cycle-count", "Activation Lock", "activation-lock"],
  "/รับซื้อ-iphone-โคราช": ["Battery Health", "สุขภาพแบต"],
  "/รับซื้อกล้อง-โคราช": ["shutter", "Shutter"],
  "/รับซื้ออุปกรณ์คอมพิวเตอร์-โคราช": ["การ์ดจอ", "พาร์ท"],
  "/รับซื้อคอมพิวเตอร์-โคราช": ["จุดที่ร้านตรวจ"],
};

let routeCount = 0;
const foundNew = new Set<string>();

for (const file of walkHtml()) {
  const route = fileToRoute(file);
  if (route === "/404") continue;
  routeCount += 1;
  const $ = loadHtml(file);
  const html = $.html();
  const main = $(".main-content").text() || $("main").text() || $("body").text();
  const title = $("title").first().text();
  const desc = $('meta[name="description"]').attr("content") ?? "";

  if (NEW_ARTICLES.includes(route)) {
    foundNew.add(route);
    if (main.length < 800) {
      issues.push({
        level: "critical",
        type: "thin-new-article",
        message: `short body len=${main.length}`,
        file: route,
      });
    }
    if (!/ร้านอำพล|WINNER IT|อุบลราชธานี/.test(main + html)) {
      issues.push({
        level: "warning",
        type: "entity",
        message: "missing store entity markers",
        file: route,
      });
    }
    if (!/ราคาประเมินเบื้องต้น|อาจเปลี่ยนแปลง/.test(main + html)) {
      issues.push({
        level: "critical",
        type: "price-disclaimer",
        message: "missing price disclaimer",
        file: route,
      });
    }
  }

  if (route.startsWith("/บทความ/") && route !== "/บทความ") {
    if (!/เผยแพร่โดย/.test(html)) {
      issues.push({
        level: "critical",
        type: "article-attribution",
        message: "missing org attribution",
        file: route,
      });
    }
  }

  for (const [money, needles] of Object.entries(MONEY_SUPPORT)) {
    if (route !== money) continue;
    const ok = needles.some((n) => main.includes(n) || html.includes(n));
    if (!ok) {
      issues.push({
        level: "critical",
        type: "cluster-link",
        message: `missing authority markers: ${needles.join("|")}`,
        file: route,
      });
    }
  }

  if (route === "/บทความ/ราคาประเมินจากรูปกับราคาหลังตรวจต่างกันอย่างไร") {
    if (/฿\s*\d|ราคาเฉลี่ย|รับประกันราคา/.test(main)) {
      issues.push({
        level: "critical",
        type: "price-risk",
        message: "suspicious price claim",
        file: route,
      });
    }
  }

  const window = `${title}\n${desc}\n${main}`;
  if (/สาขาโคราช|หน้าร้านโคราช|สำนักงานโคราช/.test(window)) {
    if (!/ไม่(มี|ใช่|ได้อ้าง)|ไม่อ้าง|ไม่ต้องเข้าใจว่า/.test(window)) {
      issues.push({
        level: "critical",
        type: "branch-claim",
        message: "affirmative korat branch",
        file: route,
      });
    }
  }
  if (/ราคาสูงที่สุด|ให้ราคาดีที่สุด|รับซื้อทุกสภาพ|รับซื้อทุกรุ่น|ประเมินแม่นยำ\s*100%/.test(window)) {
    if (!/ไม่(อ้าง|รับประกัน|ใช้)|ไม่อ้าง|ห้าม/.test(window)) {
      issues.push({
        level: "critical",
        type: "superlative",
        message: "unsupported claim",
        file: route,
      });
    }
  }
}

for (const route of NEW_ARTICLES) {
  if (!foundNew.has(route)) {
    issues.push({
      level: "critical",
      type: "missing-route",
      message: "new article missing from build",
      file: route,
    });
  }
}

if (routeCount < 93) {
  issues.push({
    level: "critical",
    type: "route-count",
    message: `expected >=93 indexable-ish routes after 4 new articles (404 excluded), got ${routeCount}`,
    file: "/",
  });
}

printIssues("audit:batch3-content-authority", issues);
if (issues.some((i) => i.level === "critical")) process.exit(1);
