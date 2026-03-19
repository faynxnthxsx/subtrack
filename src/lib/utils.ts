// src/lib/utils.ts
// Helper functions ที่ใช้ทั่วทั้ง App

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ===========================
// cn() — ใช้รวม Tailwind class
// ===========================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================
// Format ตัวเลขเงิน
// ===========================
export function formatCurrency(amount: number, currency = "THB"): string {
  if (currency === "THB") {
    return `฿${amount.toLocaleString("th-TH")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// ===========================
// คำนวณจำนวนวันที่เหลือก่อนถึงวันตัดรอบ
// ===========================
export function getDaysUntilBilling(billingDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let targetDate: Date;

  if (billingDay >= currentDay) {
    // ยังไม่ถึงในเดือนนี้
    targetDate = new Date(currentYear, currentMonth, billingDay);
  } else {
    // เลยไปแล้ว → เดือนหน้า
    targetDate = new Date(currentYear, currentMonth + 1, billingDay);
  }

  const diffMs = targetDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ===========================
// แปลงชื่อเดือนเป็นภาษาไทย
// ===========================
const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function getThaiMonth(date: Date): string {
  return THAI_MONTHS[date.getMonth()];
}

export function formatThaiDate(date: Date): string {
  return `${date.getDate()} ${getThaiMonth(date)}`;
}

// ===========================
// สีของแต่ละ Category
// ===========================
export const CATEGORY_COLORS: Record<string, string> = {
  ENTERTAINMENT: "#f59e0b",
  PRODUCTIVITY: "#22d3ee",
  DEVELOPER: "#6366f1",
  DESIGN: "#ec4899",
  MUSIC: "#1DB954",
  GAMING: "#ef4444",
  CLOUD: "#3b82f6",
  FINANCE: "#10b981",
  HEALTH: "#8b5cf6",
  OTHER: "#64748b",
};

// ===========================
// สร้าง email ที่ user จะ forward มา
// เช่น parse+userId@inbound.subtrack.app
// ===========================
export function getInboundEmail(userId: string): string {
  const shortId = userId.replace(/-/g, "").slice(0, 8);
  return `parse+${shortId}@inbound.${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "subtrack.app"}`;
}