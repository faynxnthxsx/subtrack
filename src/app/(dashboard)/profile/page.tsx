"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Mock Data
  const [user, setUser] = useState({
    name: "SubTrack User",
    email: "user@subtrack.app",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: ต่อ API เพื่ออัปเดตข้อมูลผู้ใช้
    setTimeout(() => {
      setLoading(false);
      alert("อัปเดตโปรไฟล์สำเร็จ (Mockup)");
    }, 1000);
  }

  function handleLogout() {
    if (!confirm("ต้องการออกจากระบบใช่หรือไม่?")) return;
    router.push("/"); 
  }

  const inputStyle = { 
    width: "100%", padding: "12px 16px", 
    background: "var(--bg)", border: "1px solid var(--border)", 
    borderRadius: 10, color: "var(--text-primary)", fontSize: 14, 
    outline: "none", transition: "border 0.2s"
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", 
    display: "block", marginBottom: 8, letterSpacing: "0.02em"
  };

  return (
    <>
      {/* 🚀 CSS คุม Responsive ล้วนๆ ไม่พึ่ง JS */}
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
          grid-template-columns: 1fr 340px; /* Desktop: ซ้ายใหญ่ ขวาเล็ก */
          gap: 24px;
          align-items: flex-start;
        }
        
        /* 📱 Mobile Responsive (พับลงมาเมื่อจอเล็ก) */
        @media (max-width: 768px) {
          .profile-container {
            padding: 20px 16px 100px 16px; /* ดันขอบล่างหนีเมนู Nav */
          }
          .profile-grid {
            grid-template-columns: 1fr; /* Mobile: บังคับเหลือ 1 แถวเรียงลงมา */
            gap: 16px;
          }
        }
      `}} />

      <div className="profile-container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>
            ตั้งค่าบัญชี
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            โปรไฟล์ของฉัน
          </h1>
        </div>

        <div className="profile-grid">
          
          {/* --- ฝั่งซ้าย: ฟอร์มแก้ไขข้อมูล --- */}
          <div style={{ 
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, 
            padding: "32px", boxShadow: "var(--card-shadow)" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: "50%", background: "var(--accent)", 
                color: "white", display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: 32, fontWeight: 700 
              }}>
                {user.name.charAt(0)}
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
                  onChange={(e) => setUser({ ...user, email: e.target.value })} 
                  style={inputStyle} 
                  onFocus={(e) => e.target.style.borderColor = "var(--accent)"} 
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"} 
                />
                <div style={{ fontSize: 12, color: "var(--warning)", marginTop: 8 }}>
                  * หากเปลี่ยนแปลงอีเมล คุณอาจต้องยืนยันตัวตนใหม่ผ่านลิงก์ที่ส่งไป
                </div>
              </div>
              
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }}></div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button 
                  type="submit" disabled={loading}
                  style={{ 
                    padding: "12px 24px", background: "var(--accent)", color: "white", 
                    border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, 
                    cursor: loading ? "not-allowed" : "pointer", boxShadow: "var(--accent-glow)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent-hover)"; }}
                  onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent)"; }}
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          </div>

          {/* --- ฝั่งขวา: Danger Zone --- */}
          <div style={{ 
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, 
            padding: "24px", boxShadow: "var(--card-shadow)" 
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              จัดการบัญชี
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              หากคุณใช้งานบนอุปกรณ์สาธารณะ อย่าลืมออกจากระบบทุกครั้งเพื่อความปลอดภัย
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ 
                width: "100%", padding: "12px", background: "rgba(220, 38, 38, 0.1)", 
                color: "var(--danger)", border: "1px solid rgba(220, 38, 38, 0.2)", 
                borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(220, 38, 38, 0.15)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)"}
            >
              ออกจากระบบ
            </button>
          </div>

        </div>
      </div>
    </>
  );
}