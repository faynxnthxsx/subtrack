"use client";
import { useState } from "react";
import { formatCurrency, getDaysUntilBilling, CATEGORY_COLORS } from "@/lib/utils";
import type { Subscription } from "@prisma/client";

type Props = { subscriptions: Subscription[]; onRefresh: () => void; };

export default function SubscriptionList({ subscriptions, onRefresh }: Props) {
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const categories = ["all", ...Array.from(new Set(subscriptions.map((s) => s.category.toLowerCase())))];
  const filtered = filter === "all" ? subscriptions : subscriptions.filter((s) => s.category.toLowerCase() === filter);

  async function handleDelete(id: string) {
    if (!confirm("ลบ subscription นี้ไหม?")) return;
    setLoadingId(id);
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    setLoadingId(null);
    onRefresh();
  }

  function handleEditClick(sub: Subscription) {
    setEditingId(sub.id);
    setEditForm({ name: sub.name, amount: sub.amount, billingDay: sub.billingDay, category: sub.category, billingCycle: sub.billingCycle });
  }

  async function handleEditSave(id: string) {
    setLoadingId(id);
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, amount: parseFloat(editForm.amount), billingDay: parseInt(editForm.billingDay) }),
    });
    setEditingId(null);
    setLoadingId(null);
    onRefresh();
  }

  // แก้ไข 1: เปลี่ยนสี Input ให้เป็น var(--bg-card) เพื่อให้เด้งออกมาจากพื้นหลัง
  const inputStyle = { 
    padding: "10px 14px", 
    background: "var(--bg-card)", // <--- เปลี่ยนตรงนี้
    border: "1px solid var(--border-hover)", 
    borderRadius: 8, 
    color: "var(--text-primary)", 
    fontSize: 14, 
    fontWeight: 500,
    outline: "none",
    width: "100%",
    marginTop: 6,
    transition: "border 0.2s ease"
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-secondary)",
    letterSpacing: "0.02em"
  };

  return (
    <div style={{ 
        background: "var(--bg-card)", 
        border: "1px solid var(--border)", 
        borderRadius: 16, 
        padding: "22px 24px",
        boxShadow: "var(--card-shadow)",
        transition: "all 0.3s ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Subscriptions ทั้งหมด</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <span key={cat} onClick={() => setFilter(cat)} style={{ 
                padding: "6px 14px", 
                borderRadius: 999, 
                fontSize: 12, 
                fontWeight: 600, 
                cursor: "pointer", 
                background: filter === cat ? "var(--accent)" : "var(--bg)",
                color: filter === cat ? "white" : "var(--text-secondary)", 
                border: filter === cat ? "1px solid var(--accent)" : "1px solid var(--border)",
                transition: "all 0.2s"
            }}>
              {cat === "all" ? "ทั้งหมด" : cat}
            </span>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 14, padding: "40px 0" }}>
          ยังไม่มี subscription — กด "+ เพิ่มบริการ" เพื่อเริ่มต้น
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((sub) => {
            const color = CATEGORY_COLORS[sub.category] ?? "#64748b";
            const daysLeft = getDaysUntilBilling(sub.billingDay);
            const isWarning = daysLeft <= 3;
            const isEditing = editingId === sub.id;
            const isLoading = loadingId === sub.id;

            return (
              <div key={sub.id} style={{ 
                  padding: isEditing ? "20px" : "14px 16px",
                  borderRadius: 12, 
                  // แก้ไข 2: เอากรอบม่วงออก ใช้กรอบเทาธรรมดา และเพิ่มเงาให้มันลอยขึ้นมาแทน
                  border: isEditing ? "1px solid var(--border-hover)" : "1px solid transparent", 
                  background: isEditing ? "var(--bg)" : "transparent",
                  boxShadow: isEditing ? "var(--card-shadow)" : "none",
                  transform: isEditing ? "scale(1.01)" : "scale(1)", // ขยายสเกลนิดนึงให้ดูโดดเด่น
                  position: "relative",
                  zIndex: isEditing ? 10 : 1,
                  transition: "all 0.2s ease"
              }}>
                
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>ชื่อบริการ</label>
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border-hover)"} />
                      </div>
                      <div>
                        <label style={labelStyle}>ราคา/เดือน</label>
                        <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border-hover)"} />
                      </div>
                      <div>
                        <label style={labelStyle}>วันตัดรอบ (1-31)</label>
                        <input type="number" value={editForm.billingDay} onChange={(e) => setEditForm({ ...editForm, billingDay: e.target.value })} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "var(--accent)"} onBlur={(e) => e.target.style.borderColor = "var(--border-hover)"} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                      <button onClick={() => setEditingId(null)} style={{ padding: "10px 18px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>ยกเลิก</button>
                      <button onClick={() => handleEditSave(sub.id)} disabled={isLoading} style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "var(--accent-glow)", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--accent-hover)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--accent)"}>{isLoading ? "กำลังบันทึก..." : "บันทึก"}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color, flexShrink: 0 }}>
                      {sub.name.charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{sub.name}</span>
                        <span style={{ 
                            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, 
                            background: "var(--bg)", color: "var(--text-muted)", border: "1px solid var(--border-hover)",
                            textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>
                          {sub.category}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>ตัดรอบวันที่ {sub.billingDay} · อีก {daysLeft} วัน</div>
                    </div>

                    <div style={{ textAlign: "right", marginRight: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{formatCurrency(sub.amount, sub.currency)}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>/เดือน</div>
                    </div>

                    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, fontWeight: 600, background: isWarning ? "rgba(251,191,36,0.12)" : "rgba(34,197,94,0.1)", color: isWarning ? "var(--warning)" : "var(--success)", border: isWarning ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(34,197,94,0.15)", marginRight: 8 }}>
                      {isWarning ? "⚠ ใกล้ถึง" : "● Active"}
                    </span>

                    <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => handleEditClick(sub)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8, transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>แก้ไข</button>
                        <button onClick={() => handleDelete(sub.id)} disabled={isLoading} style={{ background: "none", border: "none", color: isLoading ? "var(--border)" : "var(--danger)", cursor: isLoading ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8, transition: "background 0.2s" }} onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.background = "rgba(220, 38, 38, 0.08)"}} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                        {isLoading ? "..." : "ลบ"}
                        </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}