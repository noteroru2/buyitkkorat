# Pilot Page Validation

ทั้งสองหน้าแสดงภาพ generic ที่อนุมัติ, alt/caption ตรง source, disclosure มองเห็นใน HTML, dimensions 1200×800, lazy loading และ low fetch priority

| Route | ภาพ | Privacy/location | Disclosure | CTA | Result |
|---|---|---|---|---|---|
| /วิธีประเมินราคา | Evaluation workspace | ไม่พบบุคคล ข้อมูลลูกค้า เอกสาร หรือบริบทขอนแก่น | PASS | LINE/โทรศัพท์คงเดิม | PASS |
| /รับซื้อสินค้าไอทียกล็อต | Bulk sorting workflow | ไม่พบบุคคล Serial/IMEI/QR/ทะเบียน หรือการอ้างเป็นโกดัง/สาขาจริง | PASS | LINE/โทรศัพท์คงเดิม | PASS |

Browser DOM ที่ 390px ยืนยันว่า AVIF current source โหลดสำเร็จทั้งสองภาพ; natural size 358×238 และไม่เกิดภาพขนาดศูนย์
