"use client";
import { useEffect, useState } from "react";
import { get, post } from "./lib/api";
import { RefreshCw } from "lucide-react";

const STATUSES = ["new", "reviewing", "applied", "interview", "rejected"];

const MOCK_STATS = {
  total_jobs: 24,
  by_status: { new: 11, reviewing: 6, applied: 4, interview: 2, rejected: 1 },
  contacts: 8,
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(MOCK_STATS);
  const [scraping, setScraping] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { get("/stats").then(setStats).catch(() => {}); }, []);

  async function scrape() {
    setScraping(true); setMsg("");
    try {
      const res = await post("/jobs/scrape");
      setMsg(`${res.new} new jobs added.`);
      get("/stats").then(setStats).catch(() => {});
    } catch { setMsg("Backend offline — using mock data."); }
    setScraping(false);
  }

  const total = stats?.total_jobs ?? 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Overview</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#aaa", marginTop: 8, fontWeight: 500 }}>Subarna's internship tracker · May 2026</p>
        </div>
        <button onClick={scrape} disabled={scraping} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#090909", color: "#fff", padding: "10px 20px",
          borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none",
          cursor: scraping ? "not-allowed" : "pointer", opacity: scraping ? 0.6 : 1,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}>
          <RefreshCw size={13} style={{ animation: scraping ? "spin 1s linear infinite" : "none" }} />
          {scraping ? "Scraping..." : "Scrape Jobs"}
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: 24, background: "#fff", border: "1px solid #eee", padding: "14px 20px", borderRadius: 12, fontSize: 13, color: "#555", fontWeight: 500, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#090909" }} />
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Jobs", value: stats?.total_jobs, sub: "scraped" },
          { label: "Applied", value: stats?.by_status?.applied, sub: "submitted" },
          { label: "Interviews", value: stats?.by_status?.interview, sub: "scheduled" },
          { label: "HR Contacts", value: stats?.contacts, sub: "outreach" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 18, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>{label}</p>
            <p style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: "#ccc", marginTop: 8, fontWeight: 500 }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 18, padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Pipeline</p>
        <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Application Stages</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {STATUSES.map((s) => {
            const count = stats?.by_status?.[s] ?? 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: "#aaa", width: 72 }}>{s}</span>
                <div style={{ flex: 1, height: 4, background: "#f5f5f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#090909", borderRadius: 99, transition: "width 600ms ease" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "right" }}>{count}</span>
                <span style={{ fontSize: 11, color: "#ccc", width: 32 }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
