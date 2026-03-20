"use client";
import { useState } from "react";
import { getDaysUntilBilling, CATEGORY_COLORS } from "@/lib/utils";
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
    if (!confirm("ยืนยันการลบรายการนี้?")) return;
    setLoadingId(id);
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) onRefresh();
    setLoadingId(null);
  }

  async function handleEditSave(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          amount: parseFloat(editForm.amount),
          billingDay: parseInt(editForm.billingDay)
        }),
      });
      if (res.ok) { setEditingId(null); onRefresh(); }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "8px 16px", borderRadius: "12px", fontSize: "11px", fontWeight: "700",
            background: filter === cat ? "var(--accent)" : "var(--bg-card)",
            color: filter === cat ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0
          }}>{cat.toUpperCase()}</button>
        ))}
      </div>

      {filtered.map((sub) => {
        const color = CATEGORY_COLORS[sub.category] ?? "#64748b";
        const isEditing = editingId === sub.id;
        const daysLeft = getDaysUntilBilling(sub.billingDay);

        return (
          <div key={sub.id} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px",
            padding: "16px", width: "100%",
            opacity: loadingId === sub.id ? 0.6 : 1, transition: "0.2s"
          }}>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input style={{ width: "100%", padding: "12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", color: "white", boxSizing: "border-box" }} 
                       value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", color: "white" }} 
                         type="number" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                  <button onClick={() => handleEditSave(sub.id)} style={{ padding: "0 20px", background: "var(--accent)", color: "white", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer" }}>บันทึก</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: "12px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${color}15`, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", flexShrink: 0 }}>
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ color: daysLeft <= 3 ? "var(--warning)" : "var(--success)" }}>●</span>
                      อีก {daysLeft} วัน
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: "4px", minWidth: "85px" }}>
                  <div style={{ fontWeight: "800", color: "var(--accent)", fontSize: "16px" }}>
                    ฿{Number(sub.amount).toLocaleString()}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { setEditingId(sub.id); setEditForm(sub); }} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "11px", fontWeight: "600", padding: "4px", cursor: "pointer" }}>แก้</button>
                    <button onClick={() => handleDelete(sub.id)} style={{ background: "none", border: "none", color: "#f87171", fontSize: "11px", fontWeight: "600", padding: "4px", cursor: "pointer" }}>ลบ</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}