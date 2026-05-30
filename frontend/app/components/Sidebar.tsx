"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, User, Mail, BookOpen } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/outreach", label: "Outreach", icon: Mail },
  { href: "/learn", label: "Learning", icon: BookOpen },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, height: "100%", width: 220,
      background: "#fff", borderRight: "1px solid #f0f0f0",
      display: "flex", flexDirection: "column", zIndex: 20,
    }}>
      {/* Brand */}
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, background: "#090909", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>A</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.3px" }}>ApplyAI</span>
        </div>
        <div style={{
          padding: "10px 14px", borderRadius: 10, background: "#f9f9f9",
          border: "1px solid #f0f0f0",
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#090909" }}>Subarna Katwal</p>
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>BCA Final Year · Nepal</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#ccc", padding: "0 12px", marginBottom: 6 }}>Menu</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, marginBottom: 2,
              fontSize: 13, fontWeight: active ? 600 : 500,
              background: active ? "#090909" : "transparent",
              color: active ? "#fff" : "#666",
              textDecoration: "none",
              transition: "all 150ms ease",
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; (e.currentTarget as HTMLElement).style.color = "#090909"; }}}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#666"; }}}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
        <p style={{ fontSize: 11, color: "#ccc" }}>APM Hunt 2026</p>
      </div>
    </aside>
  );
}
