"use client";

import { useState, useEffect, useCallback } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingBills from "@/components/dashboard/UpcomingBills";
import { formatCurrency, getDaysUntilBilling, CATEGORY_COLORS } from "@/lib/utils";
import type { Subscription } from "@prisma/client";
import Link from "next/link";

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setSubscriptions(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const totalMonthly = subscriptions.reduce((s, i) => s + i.amount, 0);
  const totalYearly = totalMonthly * 12;
  const upcomingCount = subscriptions.filter((s) => getDaysUntilBilling(s.billingDay) <= 10).length;

  const chartData = [
    { month: "ต.ค.", amount: totalMonthly * 0.8 },
    { month: "พ.ย.", amount: totalMonthly * 0.9 },
    { month: "ธ.ค.", amount: totalMonthly * 1.2 },
    { month: "ม.ค.", amount: totalMonthly * 0.85 },
    { month: "ก.พ.", amount: totalMonthly * 0.95 },
    { month: "มี.ค.", amount: totalMonthly },
  ];
  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  return (
    <>
      {/* 🚀 ท่าไม้ตาย Dev: ใช้ CSS คุม Layout 100% เลิกพึ่ง JS */}
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-container {
          padding: 28px 32px;
          min-height: 100vh;
          background: var(--bg);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* Desktop เรียง 4 การ์ดแนวนอน */
          gap: 16px;
          margin-bottom: 24px;
        }
        .chart-gap {
          gap: 16px;
        }
        .chart-font {
          font-size: 12px;
        }
        .bottom-row {
          display: grid;
          grid-template-columns: 1fr 320px; /* Desktop แบ่งซ้ายขวา */
          gap: 16px;
        }
        .upcoming-bills-wrapper {
          display: block; /* Desktop โชว์บิลล่วงหน้า */
        }

        /* 📱 โหมด Mobile (จอเล็กกว่า 768px) */
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 20px 16px 100px 16px; /* ดันขอบล่างหนีเมนู Bottom Nav */
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr); /* Mobile บังคับเป็น 2x2 Grid เสมอตามที่คุณต้องการ */
            gap: 12px;
            margin-bottom: 20px;
          }
          .chart-gap {
            gap: 8px !important;
          }
          .chart-font {
            font-size: 10px !important;
          }
          .bottom-row {
            grid-template-columns: 1fr; /* Mobile พับลิสต์ลงมาเหลือแถวเดียว */
          }
          .upcoming-bills-wrapper {
            display: none !important; /* Mobile ซ่อนบิลล่วงหน้าไปเลยเพื่อความคลีน */
          }
        }
      `}} />

      <div className="dashboard-container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Dashboard
          </h1>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          <StatsCard label="รายจ่าย/เดือน" value={formatCurrency(totalMonthly)} sub={`${subscriptions.length} บริการ`} />
          <StatsCard label="รายจ่าย/ปี" value={formatCurrency(totalYearly)} sub="ประมาณการ"  />
          <StatsCard label="บิลใกล้ถึง" value={upcomingCount} unit="รายการ" sub="ภายใน 10 วัน"  />
          <StatsCard label="ทั้งหมด" value={subscriptions.length} unit="บริการ" sub="Active"  />
        </div>

        {/* Chart Section */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)",
          borderRadius: 16, padding: "20px", marginBottom: 20, transition: "all 0.3s"
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
            สรุปรายจ่ายย้อนหลัง (6 เดือน)
          </div>
          <div className="chart-gap" style={{ display: "flex", alignItems: "flex-end", height: 120, paddingBottom: 8 }}>
            {chartData.map((data, index) => {
              const heightPercent = (data.amount / maxAmount) * 100;
              const isCurrentMonth = index === chartData.length - 1;
              return (
                <div key={data.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: "100%", height: "100%", display: "flex", alignItems: "flex-end",
                    background: "var(--bg)", borderRadius: 6, overflow: "hidden",
                  }}>
                    <div style={{
                      width: "100%", height: `${heightPercent}%`,
                      background: isCurrentMonth ? "var(--accent)" : "var(--border-hover)",
                      borderRadius: 6, transition: "height 1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                  </div>
                  <div className="chart-font" style={{ fontWeight: isCurrentMonth ? 700 : 500, color: isCurrentMonth ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {data.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Subscription List */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)",
            borderRadius: 16, padding: "20px", transition: "all 0.3s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Subscriptions</div>
              <Link href="/subscriptions" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>ดูทั้งหมด →</Link>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px 0" }}>กำลังโหลด...</div>
            ) : subscriptions.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13, padding: "30px 0" }}>
                ยังไม่มี subscription —{" "}
                <Link href="/subscriptions" style={{ color: "var(--accent)", textDecoration: "none" }}>เพิ่มบริการ</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {subscriptions.slice(0, 6).map((sub) => {
                  const color = CATEGORY_COLORS[sub.category] ?? "#64748b";
                  const daysLeft = getDaysUntilBilling(sub.billingDay);
                  const isWarning = daysLeft <= 3;
                  return (
                    <div
                      key={sub.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 10, transition: "background 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color, flexShrink: 0 }}>
                        {sub.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>ตัดรอบวันที่ {sub.billingDay} · อีก {daysLeft} วัน</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                        ฿{sub.amount.toLocaleString()}
                      </div>
                      <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, fontWeight: 600, flexShrink: 0, background: isWarning ? "rgba(251,191,36,0.12)" : "rgba(34,197,94,0.1)", color: isWarning ? "var(--warning)" : "var(--success)", border: `1px solid ${isWarning ? "var(--warning)" : "var(--success)"}33` }}>
                        {isWarning ? "⚠ ใกล้ถึง" : "● Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Bills — ถูกซ่อนบน mobile อัตโนมัติด้วย CSS class */}
          <div className="upcoming-bills-wrapper">
            <UpcomingBills subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </>
  );
}