// src/app/(auth)/login/page.tsx
// หน้า Login — รองรับ Email/Password และ Google OAuth

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===========================
  // Login ด้วย Email/Password
  // ===========================
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // ===========================
  // Login ด้วย Google
  // ===========================
  // ===========================
  // Login ด้วย Google
  // ===========================
  async function handleGoogleLogin() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        prompt: 'select_account', // บังคับให้เลือกเมลใหม่
        access_type: 'offline',
      },
      // สำคัญมาก: ต้องใส่ scope เพื่อขอชื่อและเมล
      scopes: 'email profile', 
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
}
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "40px 36px",
        background: "#12121a",
        border: "1px solid #1e1e2e",
        borderRadius: 20,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}>
            <span style={{ color: "white", fontSize: 20 }}>⚡</span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            เข้าสู่ระบบ
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>
            จัดการ Subscription ทั้งหมดในที่เดียว
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px solid #2e2e3e",
            borderRadius: 10,
            color: "#e2e8f0",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <span>🔵</span> เข้าสู่ระบบด้วย Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
          <span style={{ color: "#334155", fontSize: 12 }}>หรือ</span>
          <div style={{ flex: 1, height: 1, background: "#1e1e2e" }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "#0d0d15",
                border: "1px solid #1e1e2e",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "#0d0d15",
                border: "1px solid #1e1e2e",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#3730a3" : "linear-gradient(135deg,#6366f1,#818cf8)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#475569", fontSize: 13, marginTop: 24 }}>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}