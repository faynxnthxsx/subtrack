"use client";

// src/components/dashboard/AddSubscriptionModal.tsx

import { useState } from "react";

const CATEGORIES = [
  "ENTERTAINMENT", "PRODUCTIVITY", "DEVELOPER",
  "DESIGN", "MUSIC", "GAMING", "CLOUD", "FINANCE", "HEALTH", "OTHER"
];

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddSubscriptionModal({ onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "OTHER",
    amount: "",
    billingDay: "",
    billingCycle: "MONTHLY",
    website: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: parseFloat(form.amount),
        billingDay: parseInt(form.billingDay),
      }),
    });

    if (!res.ok) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
    onClose();
  }

  // ใช้ CSS Variables แทน Hex Colors เพื่อรองรับ Light/Dark Mode
  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
    outline: "none", boxSizing: "border-box" as const,
    transition: "border 0.2s"
  };

  const labelStyle = {
    color: "var(--text-secondary)", fontSize: 13, display: "block", marginBottom: 6, fontWeight: 500
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.6)", // พื้นหลัง Overlay สีดำโปร่งแสง (ใช้ได้ทั้ง Light/Dark)
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)" // เบลอพื้นหลังนิดๆ ให้ดูพรีเมียม
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--bg-card)", border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        borderRadius: 20, padding: "28px",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 700 }}>เพิ่ม Subscription ใหม่</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>ชื่อบริการ *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Netflix, Spotify..." required style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>ราคา (THB) *</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="549" required style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            </div>
            <div>
              <label style={labelStyle}>วันที่ตัดรอบ *</label>
              <input name="billingDay" type="number" min="1" max="31" value={form.billingDay} onChange={handleChange} placeholder="1-31" required style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>หมวดหมู่</label>
              <select name="category" value={form.category} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>รอบการชำระ</label>
              <select name="billingCycle" value={form.billingCycle} onChange={handleChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"}>
                <option value="MONTHLY">รายเดือน</option>
                <option value="YEARLY">รายปี</option>
                <option value="WEEKLY">รายสัปดาห์</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>เว็บไซต์ (ไม่บังคับ)</label>
            <input name="website" value={form.website} onChange={handleChange} placeholder="https://netflix.com" style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border)"} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "var(--danger)", fontSize: 13, fontWeight: 500 }}>
              🚨 {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg)"; e.currentTarget.style.color = "var(--text-primary)"; }} onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
              ยกเลิก
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", background: "var(--accent)", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "var(--accent-glow)", transition: "all 0.2s" }} onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent-hover)"; }} onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent)"; }}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}