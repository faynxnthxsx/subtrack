import type { Metadata } from "next";
// ดึง Noto_Sans_Thai มาแทน Geist สำหรับตัวหนังสือทั่วไป
import { Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// คอนฟิกฟอนต์ไทย บังคับโหลด Subset ภาษาไทย
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // ป้องกัน FOIT (กระพริบหน้าขาว)
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BillSentry - Subscription Manager",
  description: "Track and manage your digital subscriptions easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // เปลี่ยน lang เป็น th ให้ Browser รู้จักและ Render ฟอนต์ได้เนียนขึ้น
    <html lang="th" suppressHydrationWarning>
      <body
        // ยัด notoSansThai.className เข้าไปตรงๆ เพื่อบังคับใช้ฟอนต์นี้เป็น Global
        className={`${notoSansThai.className} ${geistMono.variable} antialiased`}
        style={{ 
          background: "var(--bg)", 
          color: "var(--text-primary)",
          minHeight: "100vh",
          overflowX: "hidden" // 🚀 Kill Switch: สั่งปิดการเลื่อนซ้ายขวาทั้งโปรเจกต์ 100%
        }}
      >
        <ThemeProvider
           attribute="data-theme" 
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}