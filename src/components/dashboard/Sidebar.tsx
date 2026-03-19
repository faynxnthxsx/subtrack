"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    labelTh: "ภาพรวม",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    labelTh: "บริการ",
    href: "/subscriptions",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
      </svg>
    ),
  },
  {
    id: "upload",
    label: "Scan",
    labelTh: "สแกน",
    href: "/upload",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    labelTh: "โปรไฟล์",
    href: "/profile",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const themeIcon = !mounted ? "🌙" : theme === "dark" ? "🌙" : "☀️";

  // Mobile Bottom Nav
  if (isMobile) {
    return (
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--sidebar-bg)",
        borderTop: "1px solid var(--sidebar-border)",
        display: "flex", alignItems: "center",
        padding: "8px 0 12px",
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.id} href={item.href} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                padding: "6px 0",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                transition: "all 0.2s",
              }}>
                <div style={{
                  width: 36, height: 36,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 10,
                  background: isActive ? "var(--accent)20" : "transparent",
                }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{item.labelTh}</span>
              </div>
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <div style={{ flex: 1 }}>
          <div
            onClick={toggleTheme}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 0", cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, fontSize: 18 }}>
              {themeIcon}
            </div>
            <span style={{ fontSize: 10 }}>Theme</span>
            <span style={{ fontSize: 9, color: "var(--text-muted)" }}>ธีม</span>
          </div>
        </div>
      </nav>
    );
  }

  // Desktop Sidebar
  return (
    <div style={{
      width: 68,
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--sidebar-border)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 0", gap: 4,
      flexShrink: 0, height: "100vh",
      position: "fixed", left: 0, top: 0,
    }}>
      {/* Logo */}
      <div style={{
        width: 36, height: 36,
        background: "linear-gradient(135deg,#6366f1,#a855f7)",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        <span style={{ color: "white", fontSize: 16 }}>⚡</span>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.id} href={item.href} style={{ textDecoration: "none" }} title={`${item.label} · ${item.labelTh}`}>
            <div style={{
              width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 12, cursor: "pointer",
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "white" : "var(--text-muted)",
              transition: "all 0.2s",
            }}>
              {item.icon}
            </div>
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 12, cursor: "pointer",
          background: "transparent", border: "none",
          fontSize: 18, marginBottom: 8,
        }}
        title="Toggle theme · เปลี่ยนธีม"
      >
        {themeIcon}
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 12, cursor: "pointer",
          background: "transparent", border: "none",
          color: "var(--text-muted)",
        }}
        title="Logout · ออกจากระบบ"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}