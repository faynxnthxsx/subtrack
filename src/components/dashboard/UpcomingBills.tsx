"use client";

// src/components/dashboard/UpcomingBills.tsx

import { getDaysUntilBilling, formatCurrency, CATEGORY_COLORS } from "@/lib/utils";
import type { Subscription } from "@prisma/client";

type Props = {
  subscriptions: Subscription[];
};

export default function UpcomingBills({ subscriptions }: Props) {
  const upcoming = subscriptions
    .map((s) => ({ ...s, daysLeft: getDaysUntilBilling(s.billingDay) }))
    .filter((s) => s.daysLeft <= 10)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  return (
    <div style={{ 
        background: "var(--bg-card)", 
        border: "1px solid var(--border)", 
        boxShadow: "var(--card-shadow)", 
        borderRadius: 16, 
        padding: "24px", // ปรับ Padding ให้สมดุลกับกล่องข้างๆ
        transition: "all 0.3s ease" 
    }}>
      {/* ปรับขนาด Header ให้เป็น 16px (Standard Base Size) */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        บิลที่กำลังจะถึง
      </div>
      {/* ปรับ Sub-header ให้เป็น 13px */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        ภายใน 10 วันข้างหน้า
      </div>

      {upcoming.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 14, padding: "30px 0" }}>
          ไม่มีบิลที่กำลังจะถึงในช่วงนี้ 
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.map((bill) => {
            const color = CATEGORY_COLORS[bill.category] ?? "#64748b";
            const isUrgent = bill.daysLeft <= 3;
            return (
              <div key={bill.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                background: isUrgent ? "rgba(251,191,36,0.08)" : "var(--bg)",
                border: `1px solid ${isUrgent ? "var(--warning)" : "var(--border)"}`,
                transition: "all 0.2s ease"
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color, flexShrink: 0,
                }}>
                  {bill.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  {/* เปลี่ยนชื่อบิลเป็น 14px เพื่อให้อ่านง่ายขึ้น */}
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{bill.name}</div>
                  {/* เปลี่ยนจำนวนวันเป็น 12px (Standard Small Text) */}
                  <div style={{ fontSize: 12, fontWeight: 500, color: isUrgent ? "var(--warning)" : "var(--text-muted)", marginTop: 2 }}>
                    อีก {bill.daysLeft} วัน
                  </div>
                </div>
                {/* เปลี่ยนตัวเลขจำนวนเงินให้เด่นขึ้นด้วย 14px + font-bold */}
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {formatCurrency(bill.amount, bill.currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}