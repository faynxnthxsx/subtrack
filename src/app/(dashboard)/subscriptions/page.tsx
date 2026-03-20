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

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const totalMonthly = subscriptions.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .subs-container {
          padding: 28px 32px;
          min-height: 100vh;
          background: var(--bg);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .summary-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
        }
        .summary-item { }
        .summary-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .summary-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .subs-container {
            padding: 20px 16px 100px;
          }
          .summary-bar {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 16px;
          }
          .summary-value { font-size: 18px; }
        }
      `}} />

      <div className="subs-container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
            Subscriptions
          </h1>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 18px", background: "var(--accent)",
              borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600,
              border: "none", cursor: "pointer", boxShadow: "var(--accent-glow)",
            }}
          >
            + เพิ่มบริการ
          </button>
        </div>

        {/* Summary Bar */}
        <div className="summary-bar">
          <div className="summary-item">
            <div className="summary-label">ทั้งหมด</div>
            <div className="summary-value">{subscriptions.length} <span style={{ fontSize: 13, color: "var(--text-muted)" }}>บริการ</span></div>
          </div>
          <div className="summary-item">
            <div className="summary-label">รายจ่าย/เดือน</div>
            <div className="summary-value" style={{ color: "var(--accent)" }}>{formatCurrency(totalMonthly)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">รายจ่าย/ปี</div>
            <div className="summary-value">{formatCurrency(totalMonthly * 12)}</div>
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
    </>
  );
}