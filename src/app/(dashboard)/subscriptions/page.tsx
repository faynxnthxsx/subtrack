"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // ป้องกันยอดเป็น 0
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((acc, sub) => acc + (Number(sub.amount) || 0), 0);
  }, [subscriptions]);

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "var(--bg)", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Subscriptions</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: "10px 18px", background: "var(--accent)", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "var(--accent-glow)" }}>+ เพิ่มบริการ</button>
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 24, padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--card-shadow)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>ทั้งหมด</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{subscriptions.length} <span style={{ fontSize: 14, fontWeight: 500 }}>บริการ</span></div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>รายจ่าย/เดือน</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{formatCurrency(totalMonthly)}</div>
        </div>
        <div style={{ width: 1, background: "var(--border)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>รายจ่าย/ปี</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalMonthly * 12)}</div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "40px 0" }}>กำลังโหลด...</div> : <SubscriptionList subscriptions={subscriptions} onRefresh={fetchSubscriptions} />}
      {showModal && <AddSubscriptionModal onClose={() => setShowModal(false)} onSuccess={fetchSubscriptions} />}
    </div>
  );
}