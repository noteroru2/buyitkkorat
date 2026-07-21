# Performance observation

- Lab observation: responsive AVIF/WebP พร้อม width/height, lazy loading และ async decoding; broken image=0
- ภาพ pilot 2 assets ตอบ HTTP 200; cache/performance field metrics ไม่ได้วัดด้วย authenticated field tooling
- Full-page screenshot timeout บางหน้าเป็นข้อจำกัดของ capture backend ไม่ใช่หลักฐาน CWV regression
- Field CWV: unavailable; ต้องใช้ Search Console/Core Web Vitals หลัง freeze
