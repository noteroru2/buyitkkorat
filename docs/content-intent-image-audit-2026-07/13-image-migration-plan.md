# Image migration plan

Batch นี้เป็น audit/plan เท่านั้น: **ไม่มีภาพถูกคัดลอก**

1. ตัด QA screenshots และ location-sensitive assets ออกจาก candidate pool
2. ขอหลักฐานสิทธิ์ของ real/product assets ทุกไฟล์ก่อน
3. เปิดตรวจ pixel-level สำหรับ private intake: บุคคล หน้าจอ QR serial/IMEI เอกสาร ป้ายทะเบียน และข้อมูลลูกค้า
4. ใช้ SHA-256 ป้องกัน exact duplicate; กลุ่มซ้ำ 59 กลุ่ม
5. เปลี่ยนชื่อเฉพาะเพื่อความเป็นกลาง/การจัดหมวด ไม่ยัด keyword และบันทึก source/target/hash
6. ใช้ ResponsiveImage เดิม, ระบุ intrinsic dimensions, responsive srcset/sizes, eager เฉพาะ LCP, lazy below-fold, และตรวจ mobile crop/CLS
7. ภาพ AI ต้องมีข้อความ “ภาพประกอบที่สร้างด้วย AI” ที่มองเห็นได้; alt บรรยายสิ่งที่เห็น ไม่อ้างสถานที่/ลูกค้าจริง
8. ทำ build + automated audit + Browser QA ก่อน release แยกต่างหาก
