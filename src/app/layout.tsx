import type { Metadata } from "next";
import { Noto_Sans_Thai, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${notoSansThai.className} ${geistMono.variable} antialiased`}
        style={{ 
          background: "var(--bg)", 
          color: "var(--text-primary)",
          // [FIX]: เปลี่ยนจาก minHeight เป็นการคุม overflow ให้เหมาะสม
          minHeight: "100dvh", // ใช้ dvh เพื่อให้แม่นยำบนมือถือ
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ThemeProvider
           attribute="data-theme" 
          defaultTheme="dark"
          enableSystem={false}
        >
          {/* 🚀 Dev Note: 
             ถ้าคุณมี Sidebar หรือ Bottom Nav ที่ใช้ร่วมกันทุกหน้า 
             ควรเอามาวางครอบ {children} ตรงนี้ 
             แต่ถ้าคุณเรียกใช้ข้างใน Page... children จะรับกรรมไปเต็มๆ
          */}
          <main style={{ flex: 1, width: "100%", position: "relative" }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}