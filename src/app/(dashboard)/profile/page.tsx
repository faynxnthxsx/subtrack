"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState({ name: "", email: "" });

  // ดึงข้อมูล user จริงจาก Supabase
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser({
        name: authUser.user_metadata?.name ?? authUser.user_metadata?.full_name ?? authUser.email?.split("@")[0] ?? "User",
        email: authUser.email ?? "",
      });
      setPageLoading(false);
    }
    loadUser();
  }, []);

 async function handleSave(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  const res = await fetch("/api/user/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: user.name }),
  });

  setLoading(false);

  if (!res.ok) {
    alert("บันทึกไม่สำเร็จ");
  } else {
    alert("อัปเดตโปรไฟล์สำเร็จ ✅");
  }
}

  async function handleLogout() {
    if (!confirm("ต้องการออกจากระบบใช่หรือไม่?")) return;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 10, color: "var(--text-primary)", fontSize: 14,
    outline: "none", transition: "border 0.2s",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600 as const, color: "var(--text-secondary)",
    display: "block" as const, marginBottom: 8, letterSpacing: "0.02em",
  };

  if (pageLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .profile-container {
          padding: 28px 32px;
          min-height: 100vh;
          background: var(--bg);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .profile-container { padding: 20px 16px 100px; }
          .profile-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}} />

      <div className="profile-container">
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>
            ตั้งค่าบัญชี
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            โปรไฟล์ของฉัน
          </h1>
        </div>

        <div className="profile-grid">
          {/* ฝั่งซ้าย: ฟอร์ม */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", boxShadow: "var(--card-shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>{user.email}</div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={labelStyle}>ชื่อแสดงผล</label>
                <input
                  type="text" value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
              </div>

              <div>
                <label style={labelStyle}>อีเมล</label>
                <input
                  type="email" value={user.email}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                  * อีเมลไม่สามารถเปลี่ยนได้จากหน้านี้
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit" disabled={loading}
                  style={{ padding: "12px 24px", background: "var(--accent)", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", boxShadow: "var(--accent-glow)" }}
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>

          {/* ฝั่งขวา: Logout */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", boxShadow: "var(--card-shadow)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>จัดการบัญชี</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              หากคุณใช้งานบนอุปกรณ์สาธารณะ อย่าลืมออกจากระบบทุกครั้งเพื่อความปลอดภัย
            </div>
            <button
              onClick={handleLogout}
              style={{ width: "100%", padding: "12px", background: "rgba(220,38,38,0.1)", color: "var(--danger)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}