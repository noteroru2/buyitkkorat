# Browser visual review

- Production screenshots: 8 (Homepage, valuation, bulk, AEO phone; 390×844 และ 1440×900)
- ทั้ง 8 ภาพเป็น viewport capture แบบทีละหน้า; full-page backend timeout/สร้างเฟรมซ้ำจึงถูกจับใหม่และไม่นำภาพผิดเพี้ยนมาใช้
- DOM: H1=1 ทุกภาพ, broken image=0, horizontal overflow=0, LINE/phone CTA present
- ภาพ: `docs/content-intent-image-audit-2026-07/batch-2-2-2/screenshots/`
- Viewports 360×800 และ 768×1024 ตรวจโดย route/DOM regression เดิม แต่ไม่มี screenshot ใหม่ในรอบนี้
- ผล: PASS WITH WARNING — หลักฐาน 8 ภาพครบขั้นต่ำ แต่เป็น viewport capture และไม่ได้ทำ subjective full-page review ครบ 14 หน้า × 4 viewport
