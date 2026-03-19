"use client";

import { useState, useEffect, useCallback } from "react";
import SubscriptionList from "@/components/dashboard/SubscriptionList";
import AddSubscriptionModal from "@/components/dashboard/AddSubscriptionModal";
import { formatCurrency } from "@/lib/utils";
import type { Subscription } from "@prisma/client";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div style={{ 
      padding: "28px 32px", 
      minHeight: "100vh", 
      background: "var(--bg)", 
      transition: "all 0.4s ease",
      // เพิ่ม 3 บรรทัดนี้เพื่อคุม Layout ไม่ให้หน้าจอโล่งเกินไปเวลาเปิดบน Desktop
      maxWidth: "1200px", 
      margin: "0 auto", 
      width: "100%" 
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Subscriptions
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 18px",
            background: "var(--accent)",
            borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600,
            border: "none", cursor: "pointer",
            boxShadow: "var(--accent-glow)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "var(--accent-hover)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          + เพิ่มบริการ
        </button>
      </div>

      {/* Summary Bar */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 24,
        padding: "20px 24px",
        background: "var(--bg-card)", 
        border: "1px solid var(--border)", 
        borderRadius: 16,
        boxShadow: "var(--card-shadow)",
        transition: "all 0.4s ease"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>ทั้งหมด</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            {subscriptions.length} <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>บริการ</span>
          </div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>รายจ่าย/เดือน</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>
            {formatCurrency(totalMonthly)}
          </div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>รายจ่าย/ปี</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            {formatCurrency(totalMonthly * 12)}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>กำลังโหลด...</div>
      ) : (
        <SubscriptionList subscriptions={subscriptions} onRefresh={fetchSubscriptions} />
      )}

      {/* Modal */}
      {showModal && (
        <AddSubscriptionModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchSubscriptions}
        />
      )}
    </div>
  );
}