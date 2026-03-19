"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [recentScans] = useState<any[]>([]);

  // 🚀 ลบ isMobile และ useEffect ทิ้งไปเลย ให้ CSS จัดการแทน 100%

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/parse-image", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError("AI ไม่สามารถอ่านรูปได้ กรุณาลองใหม่ หรือปรับภาพให้ชัดขึ้น");
      setLoading(false);
      return;
    }
    setResult(data.data);
    setLoading(false);
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: result.serviceName,
        category: result.category,
        amount: result.amount,
        currency: result.currency,
        billingDay: new Date(result.billingDate).getDate() || 1,
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/subscriptions");
    } else {
      setError("บันทึกไม่สำเร็จ เซิร์ฟเวอร์ขัดข้อง");
    }
  }

  return (
    <>
      {/* 🚀 CSS คุม Layout ล้วนๆ จัดการย่อขยายหน้าจอแบบไม่กระตุก */}
      <style dangerouslySetInnerHTML={{__html: `
        .upload-container {
          padding: 28px 32px;
          min-height: 100vh;
          background: var(--bg);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 340px; /* คอม: แบ่งซ้าย (สแกน) ขวา (ประวัติ) */
          gap: 24px;
          align-items: stretch;
        }
        .upload-dropzone {
          min-height: 340px;
        }
        .preview-image {
          max-height: 320px;
        }
        .dropzone-icon { font-size: 48px; }
        .dropzone-title { font-size: 16px; }

        /* 📱 มือถือ: สั่งให้กล่องมาเรียงต่อกันบนล่าง */
        @media (max-width: 768px) {
          .upload-container {
            padding: 20px 16px 100px; /* ดันขอบล่างหนีเมนู */
          }
          .upload-grid {
            grid-template-columns: 1fr; /* มือถือ: บังคับให้เรียงต่อกัน 1 แถว */
          }
          .upload-dropzone {
            min-height: 220px;
          }
          .preview-image {
            max-height: 200px;
          }
          .dropzone-icon { font-size: 36px; }
          .dropzone-title { font-size: 14px; }
        }
      `}} />

      <div className="upload-container">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>AI Scanner</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
            Scan Receipt · สแกนใบเสร็จ
          </h1>
        </div>

        <div className="upload-grid">
          {/* ฝั่งซ้าย (สแกนรูป) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              onClick={() => document.getElementById("file-input")?.click()}
              className="upload-dropzone"
              style={{
                flex: 1,
                border: `2px dashed ${preview ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 16,
                display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                textAlign: "center", cursor: "pointer",
                background: preview ? "var(--bg)" : "var(--bg-card)",
                transition: "all 0.2s ease",
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="preview-image" style={{ maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
              ) : (
                <div style={{ padding: 20 }}>
                  <div className="dropzone-icon" style={{ marginBottom: 12 }}>📷</div>
                  <div className="dropzone-title" style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 8 }}>
                    แตะเพื่อเลือกรูป หรือลากไฟล์มาวาง
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5 }}>
                    รองรับ JPG, PNG, WEBP<br />สลิปธนาคาร, ใบเสร็จบัตรเครดิต
                  </div>
                </div>
              )}
              <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
            </div>

            {file && !result && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                style={{
                  width: "100%", padding: 14,
                  background: loading ? "var(--border-hover)" : "var(--accent)",
                  border: "none", borderRadius: 12, color: "white",
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "🤖 AI กำลังอ่านสลิป..." : "🤖 เริ่มสแกนใบเสร็จด้วย AI"}
              </button>
            )}

            {error && (
              <div style={{ padding: "14px 16px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, color: "var(--danger)", fontSize: 14 }}>
                🚨 {error}
              </div>
            )}

            {result && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--success)", marginBottom: 20 }}>
                  ✅ AI สกัดข้อมูลสำเร็จ (Confidence: {Math.round(result.confidence * 100)}%)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "ชื่อบริการ", value: result.serviceName },
                    { label: "ยอดเงิน", value: `฿${result.amount.toLocaleString()} ${result.currency}` },
                    { label: "วันที่", value: result.billingDate },
                    { label: "หมวดหมู่", value: result.category },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    onClick={() => { setResult(null); setFile(null); setPreview(null); }}
                    style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                  >
                    สแกนใหม่
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ padding: 12, background: "var(--accent)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer" }}
                  >
                    {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ฝั่งขวา (ประวัติสแกน) — เอาเงื่อนไขซ่อนออกแล้ว โชว์ตลอดเวลา! */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Recent Scans · สแกนล่าสุด
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>รายการที่ AI ดึงข้อมูลสำเร็จ</div>
            {recentScans.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>📭</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>ยังไม่มีประวัติการสแกน</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentScans.map((h, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{h.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(h.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}