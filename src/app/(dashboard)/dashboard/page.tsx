"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import UpcomingBills from "@/components/dashboard/UpcomingBills";
import { formatCurrency, getDaysUntilBilling, CATEGORY_COLORS } from "@/lib/utils";
import type { Subscription } from "@prisma/client";
import Link from "next/link";

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/subscriptions");
      const data = await res.json();
      setSubscriptions(data.data ?? []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // แก้ Logic คำนวณเงินให้ชัวร์
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  }, [subscriptions]);

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
      <style dangerouslySetInnerHTML={{__html: `
        .dashboard-container { padding: 28px 32px; min-height: 100vh; background: var(--bg); max-width: 1200px; margin: 0 auto; width: 100%; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .chart-gap { gap: 16px; }
        .chart-font { font-size: 12px; }
        .bottom-row { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
        .upcoming-bills-wrapper { display: block; }
        @media (max-width: 768px) {
          .dashboard-container { padding: 20px 16px 100px 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
          .chart-gap { gap: 8px !important; }
          .chart-font { font-size: 10px !important; }
          .bottom-row { grid-template-columns: 1fr; }
          .upcoming-bills-wrapper { display: none !important; }
        }
      `}} />

      <div className="dashboard-container">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Dashboard</h1>
        </div>

        <div className="stats-grid">
          <StatsCard label="รายจ่าย/เดือน" value={formatCurrency(totalMonthly)} sub={`${subscriptions.length} บริการ`} />
          <StatsCard label="รายจ่าย/ปี" value={formatCurrency(totalYearly)} sub="ประมาณการ" />
          <StatsCard label="บิลใกล้ถึง" value={upcomingCount} unit="รายการ" sub="ภายใน 10 วัน" />
          <StatsCard label="ทั้งหมด" value={subscriptions.length} unit="บริการ" sub="Active" />
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", borderRadius: 16, padding: "20px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>สรุปรายจ่ายย้อนหลัง (6 เดือน)</div>
          <div className="chart-gap" style={{ display: "flex", alignItems: "flex-end", height: 120, paddingBottom: 8 }}>
            {chartData.map((data, index) => {
              const heightPercent = (data.amount / maxAmount) * 100;
              const isCurrentMonth = index === chartData.length - 1;
              return (
                <div key={data.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", background: "var(--bg)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: `${heightPercent}%`, background: isCurrentMonth ? "var(--accent)" : "var(--border-hover)", borderRadius: 6, transition: "height 1s ease" }} />
                  </div>
                  <div className="chart-font" style={{ fontWeight: isCurrentMonth ? 700 : 500, color: isCurrentMonth ? "var(--text-primary)" : "var(--text-muted)" }}>{data.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bottom-row">
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", borderRadius: 16, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Subscriptions</div>
              <Link href="/subscriptions" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>ดูทั้งหมด →</Link>
            </div>
            {loading ? <p>กำลังโหลด...</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {subscriptions.slice(0, 6).map((sub) => (
                  <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderRadius: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${CATEGORY_COLORS[sub.category]}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: CATEGORY_COLORS[sub.category] }}>{sub.name.charAt(0)}</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>฿{Number(sub.amount).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="upcoming-bills-wrapper"><UpcomingBills subscriptions={subscriptions} /></div>
        </div>
      </div>
    </>
  );
}