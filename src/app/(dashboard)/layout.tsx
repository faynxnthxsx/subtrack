// src/app/(dashboard)/layout.tsx

import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      
      {/* 🚀 ใช้ className ล้วนๆ ห้ามมี style={{}} ใน main เด็ดขาด */}
      <main className="main-content">
        {children}
      </main>

      {/* ฝัง CSS ควบคุมขอบจอให้อยู่หมัด */}
      <style dangerouslySetInnerHTML={{__html: `
        .layout-wrapper {
          background: var(--bg);
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden; /* กฎเหล็ก: ป้องกันจอเลื่อนซ้ายขวาได้ */
        }

        /* 💻 โหมดหน้าจอคอม (Desktop) */
        .main-content {
          margin-left: 72px; /* เว้นระยะให้แถบเมนูด้านซ้าย */
          width: calc(100vw - 72px);
          min-height: 100vh;
        }

        /* 📱 โหมดมือถือ (Mobile) */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important; /* ลบช่องว่างด้านหน้าทิ้ง! คืนพื้นที่ 100% */
            width: 100vw !important;
            padding-bottom: 80px; /* เว้นที่ด้านล่างกันเมนูทับเนื้อหา */
          }
        }
      `}} />
    </div>
  );
}