// src/app/(auth)/register/page.tsx
// หน้าสมัครสมาชิก

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // เปลี่ยนเฉพาะส่วน handleRegister
async function handleRegister(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError("");

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (password.length < 8) {
    setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    setLoading(false);
    return;
  }

  const { error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { 
        name: cleanName,
        full_name: cleanName, // ใส่เผื่อไว้ทั้งสองแบบให้ตรงกับ API route.ts
      },
      emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    // แปลข้อความ Error พื้นฐานให้ User เข้าใจง่ายขึ้น
    if (error.message.includes("User already registered")) {
        setError("อีเมลนี้ถูกใช้งานไปแล้ว");
    } else {
        setError(error.message);
    }
    setLoading(false);
    return;
  }

  setSuccess(true);
  setLoading(false);
}

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          textAlign: "center", padding: 40,
          background: "#12121a", border: "1px solid #1e1e2e",
          borderRadius: 20, maxWidth: 400,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            ตรวจสอบอีเมลของคุณ
          </h2>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
            เราส่ง confirmation link ไปที่ <strong style={{ color: "#818cf8" }}>{email}</strong> แล้ว
            กดลิงก์ในอีเมลเพื่อเริ่มใช้งาน
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        padding: "40px 36px", background: "#12121a",
        border: "1px solid #1e1e2e", borderRadius: 20,
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            borderRadius: 12, display: "inline-flex",
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <span style={{ color: "white", fontSize: 20 }}>⚡</span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            สมัครสมาชิก
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>ฟรี ไม่มีค่าใช้จ่าย</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "ชื่อ", type: "text", value: name, set: setName, placeholder: "ชื่อของคุณ" },
            { label: "อีเมล", type: "email", value: email, set: setEmail, placeholder: "you@example.com" },
            { label: "รหัสผ่าน", type: "password", value: password, set: setPassword, placeholder: "อย่างน้อย 8 ตัวอักษร" },
          ].map((field) => (
            <div key={field.label}>
              <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder={field.placeholder}
                required
                style={{
                  width: "100%", padding: "11px 14px",
                  background: "#0d0d15", border: "1px solid #1e1e2e",
                  borderRadius: 10, color: "#e2e8f0", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          ))}

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8, color: "#f87171", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px",
              background: loading ? "#3730a3" : "linear-gradient(135deg,#6366f1,#818cf8)",
              border: "none", borderRadius: 10,
              color: "white", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            {loading ? "กำลังสมัคร..." : "สร้างบัญชี"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 24 }}>
          มีบัญชีแล้ว?{" "}
          <Link href="/login" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}