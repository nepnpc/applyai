"use client";
import { useEffect, useState } from "react";
import { get, post } from "../lib/api";
import { Plus } from "lucide-react";

const MOCK_LOGS = [
  { date: "2026-05-30", learned: "Studied RICE prioritization framework — scored 5 features for a fintech product. Found that Confidence scoring is often underweighted by PMs." },
  { date: "2026-05-29", learned: "Practiced writing a full PRD for a 'job alert' feature. Sections: problem statement, user personas, success metrics, edge cases, non-goals." },
  { date: "2026-05-28", learned: "Read about OKRs vs KPIs — OKRs are directional goals, KPIs are health metrics. Company sets OKRs quarterly, teams align KPIs to them." },
  { date: "2026-05-27", learned: "Shadowed a product review meeting at Profusion Tech. Noticed PMs use 'How might we...' framing to keep discussions solution-neutral." },
  { date: "2026-05-26", learned: "Learned about North Star Metric concept — single metric that best captures core product value. For Duolingo it's DAUs, for Airbnb it's nights booked." },
];

export default function LearnPage() {
  const [logs, setLogs] = useState<any[]>(MOCK_LOGS);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    get("/profile/learn").then((data) => { if (data?.length) setLogs([...data].reverse()); }).catch(() => {});
  }, []);

  async function addLog() {
    if (!input.trim()) return;
    setSaving(true);
    try {
      await post("/profile/learn", { learned: input.trim() });
      const data = await get("/profile/learn");
      setLogs([...data].reverse());
    } catch {
      setLogs([{ date: new Date().toISOString().slice(0, 10), learned: input.trim() }, ...logs]);
    }
    setInput("");
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Knowledge</p>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1 }}>Learning Log</h1>
        <p style={{ fontSize: 13, color: "#aaa", marginTop: 8, fontWeight: 500 }}>Entries feed into cover letters and job matching</p>
      </div>

      {/* Input */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 18, padding: "24px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>Today's Entry</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What did you learn today? e.g. 'Studied RICE prioritization framework, practiced writing PRDs for a fintech product'"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addLog(); }}
          style={{ width: "100%", fontSize: 14, color: "#090909", resize: "none", outline: "none", border: "none", minHeight: 100, lineHeight: 1.6, fontWeight: 500, fontFamily: "inherit", background: "transparent" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: "1px solid #f5f5f5" }}>
          <p style={{ fontSize: 11, color: "#ccc", fontWeight: 500 }}>Ctrl+Enter to save</p>
          <button onClick={addLog} disabled={saving || !input.trim()} style={{ display: "flex", alignItems: "center", gap: 8, background: "#090909", color: "#fff", padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: saving || !input.trim() ? "not-allowed" : "pointer", opacity: saving || !input.trim() ? 0.4 : 1 }}>
            <Plus size={13} />{saving ? "Saving..." : "Log it"}
          </button>
        </div>
      </div>

      {/* Entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {logs.map((log, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "18px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#aaa", background: "#f5f5f5", padding: "3px 10px", borderRadius: 99 }}>{log.date}</span>
              <span style={{ fontSize: 10, color: "#ddd", fontWeight: 600 }}>#{logs.length - i}</span>
            </div>
            <p style={{ fontSize: 14, color: "#333", lineHeight: 1.65, fontWeight: 500 }}>{log.learned}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
