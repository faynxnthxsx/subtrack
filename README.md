# SubTrack 📊

ระบบจัดการ Subscription และค่าบริการรายเดือนแบบอัตโนมัติ สร้างด้วย Next.js 16 พร้อม AI ช่วยสแกนใบเสร็จ

---

## 🎯 โปรเจคนี้ทำอะไร

SubTrack ช่วยให้คติดตามค่าใช้จ่ายจาก Subscription  เช่น Netflix, Spotify, Adobe ฯลฯ ได้ในที่เดียว โดยระบบจะแจ้งเตือนก่อนถึงวันตัดเงิน และสรุปยอดรายจ่ายให้ทุกสัปดาห์ผ่านอีเมล

---

## ✨ Features

- **Dashboard** — ภาพรวมรายจ่ายรายเดือน/รายปี พร้อมกราฟสรุปย้อนหลัง 6 เดือน
- **Subscription Management** — เพิ่ม แก้ไข ลบ Subscription ได้เต็มรูปแบบ
- **AI Receipt Scanner** — อัปโหลดรูปสลิปหรือใบเสร็จ แล้วให้ AI ดึงข้อมูลให้อัตโนมัติ
- **Email Parsing** — Forward อีเมลใบเสร็จเข้าระบบ แล้ว AI จะจัดหมวดหมู่ให้
- **Smart Notifications** — แจ้งเตือนทางอีเมลก่อนบิลตัด 3 วัน
- **Weekly Summary** — สรุปรายจ่ายประจำสัปดาห์ส่งทางอีเมลทุกวันจันทร์
- **Dark / Light Mode** — สลับธีมได้ตามต้องการ
- **Responsive Design** — รองรับทั้ง Desktop และ Mobile

---

## 🛠️ Tech Stack

| ประเภท | เครื่องมือที่ใช้ |
|--------|----------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Neon (PostgreSQL) |
| ORM | Prisma v5 |
| Auth | Supabase (Email + Google OAuth) |
| AI | gpt (Image Parsing) |
| Email | Resend (Transactional Email) |
| Inbound Email | Cloudmailin |
| Background Jobs | Inngest |
| Theme | next-themes |
| Deployment | Vercel |

---
โปรเจคนี้เป็นส่วนหนึ่งของ Portfolio ก่อนฝึกงาน