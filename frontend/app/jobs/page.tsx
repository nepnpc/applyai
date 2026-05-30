"use client";
import { useEffect, useState } from "react";
import { get, post, put } from "../lib/api";
import { ExternalLink, FileText, Wand2, Copy, Check, Briefcase } from "lucide-react";

const STATUSES = ["new", "reviewing", "applied", "interview", "rejected"];

const STATUS_DOT: Record<string, string> = {
  new: "#aaa", reviewing: "#555", applied: "#090909", interview: "#090909", rejected: "#ddd"
};

const MOCK_JOBS = [
  { id: 1, title: "Associate Product Manager Intern", company: "Leapfrog Technology", location: "Kathmandu, Nepal", description: "Join our product team to define roadmaps, run discovery sprints, and ship features for our SaaS clients. You'll work directly with engineering and design to build impactful products for global markets.", url: "#", source: "merojob", match_score: 87, status: "reviewing" },
  { id: 2, title: "Technical Business Analyst", company: "F1Soft International", location: "Kathmandu, Nepal", description: "Bridge the gap between business requirements and technical implementation. Analyze user stories, write specifications, and coordinate with development teams on Nepal's leading fintech platform.", url: "#", source: "linkedin", match_score: 74, status: "applied" },
  { id: 3, title: "Product Intern — AI Features", company: "CloudFactory", location: "Remote · Nepal", description: "Help define and ship AI-powered data annotation tools. You'll run user research, write PRDs, and work in an agile team building tools used by thousands of data workers globally.", url: "#", source: "linkedin", match_score: 91, status: "new" },
  { id: 4, title: "Junior Product Manager", company: "Fusemachines", location: "Kathmandu, Nepal", description: "Work on AI and ML product initiatives for US clients. Manage backlogs, facilitate sprint planning, and conduct competitive analysis for cutting-edge AI products.", url: "#", source: "merojob", match_score: 68, status: "new" },
  { id: 5, title: "Technical PM Intern", company: "Sastodeal", location: "Kathmandu, Nepal", description: "Own product development lifecycle for our e-commerce platform features. Collaborate with engineering on API integrations, write user stories, and track KPIs.", url: "#", source: "merojob", match_score: 62, status: "interview" },
];

const MOCK_COVER = `Dear Hiring Manager,

I'm a final-year BCA student who ships AI systems — not just studies them. At Profusion Tech, I built production-level automation workflows; on the side, I've shipped a Groq-powered text humanizer and an autonomous LinkedIn agent running on GitHub Actions.

What draws me to this role is the intersection of technical depth and product thinking. I understand how LLM APIs work, how to debug a FastAPI service at 2AM, and how to translate that into user-facing features with clear success metrics. That's rare at the intern level.

I'd love 20 minutes to show you what I've built and learn more about your roadmap.

Subarna Katwal
subwrn@gmail.com · +977 9703901454`;

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>(MOCK_JOBS);
  const [selected, setSelected] = useState<any>(MOCK_JOBS[0]);
  const [loading, setLoading] = useState("");
  const [output, setOutput] = useState(MOCK_COVER);
  const [copied, setCopied] = useState(false);

  useEffect(() => { get("/jobs").then((data) => { if (data?.length) setJobs(data); }).catch(() => {}); }, []);

  async function gen(type: "cover" | "tailor") {
    setLoading(type); setOutput("");
    try {
      const res = type === "cover"
        ? await post(`/jobs/${selected.id}/cover-letter`)
        : await post(`/jobs/${selected.id}/tailor`);
      setOutput(res.cover_letter ?? res.tailored_resume ?? "");
    } catch { setOutput(MOCK_COVER); }
    setLoading("");
  }

  async function updateStatus(status: string) {
    setSelected({ ...selected, status });
    setJobs((prev) => prev.map((j) => j.id === selected.id ? { ...j, status } : j));
    try { await put(`/jobs/${selected.id}/status`, { status }); } catch {}
  }

  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  const card = (active: boolean) => ({
    background: active ? "#090909" : "#fff",
    border: `1px solid ${active ? "#090909" : "#f0f0f0"}`,
    borderRadius: 14, padding: "14px 16px", marginBottom: 8,
    cursor: "pointer", textAlign: "left" as const,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)", width: "100%",
  });

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 80px)" }}>
      {/* List */}
      <div style={{ width: 260, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Jobs</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>{jobs.length} <span style={{ color: "#ccc", fontWeight: 300 }}>found</span></h1>
        </div>
        {jobs.map((job) => {
          const active = selected?.id === job.id;
          return (
            <button key={job.id} onClick={() => { setSelected(job); setOutput(""); }} style={card(active)}>
              <p style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#090909", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.title}</p>
              <p style={{ fontSize: 11, color: active ? "#999" : "#aaa", marginBottom: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job.company}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", borderRadius: 99, background: active ? "rgba(255,255,255,0.1)" : "#f5f5f5", color: active ? "#ccc" : "#aaa" }}>{job.status}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: active ? "#fff" : "#090909" }}>{job.match_score}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      {selected ? (
        <div style={{ flex: 1, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflowY: "auto" }}>
          <div style={{ padding: "32px 32px 24px", borderBottom: "1px solid #f5f5f5" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>{selected.source} · {selected.match_score}% match</p>
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{selected.title}</h2>
                <p style={{ fontSize: 13, color: "#888", marginTop: 6, fontWeight: 500 }}>{selected.company} · {selected.location}</p>
              </div>
              <a href={selected.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#aaa", border: "1px solid #eee", borderRadius: 10, padding: "8px 14px", textDecoration: "none" }}>
                View <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUSES.map((s) => (
                <button key={s} onClick={() => updateStatus(s)} style={{
                  fontSize: 11, padding: "6px 14px", borderRadius: 10, textTransform: "capitalize",
                  fontWeight: 600, cursor: "pointer", border: "none",
                  background: selected.status === s ? "#090909" : "#f5f5f5",
                  color: selected.status === s ? "#fff" : "#888",
                }}>
                  <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: selected.status === s ? "#fff" : STATUS_DOT[s], marginRight: 6, verticalAlign: "middle" }} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "28px 32px" }}>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 24, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{selected.description}</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <button onClick={() => gen("cover")} disabled={!!loading} style={{ display: "flex", alignItems: "center", gap: 8, background: "#090909", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                <FileText size={13} />{loading === "cover" ? "Generating..." : "Cover Letter"}
              </button>
              <button onClick={() => gen("tailor")} disabled={!!loading} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", color: "#090909", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
                <Wand2 size={13} />{loading === "tailor" ? "Tailoring..." : "Tailor Resume"}
              </button>
            </div>

            {output && (
              <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 14, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa" }}>Generated Output</p>
                  <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#aaa", background: "none", border: "1px solid #eee", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ fontSize: 13, color: "#444", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7 }}>{output}</pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Briefcase size={20} color="#ccc" />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#ccc" }}>Select a job</p>
        </div>
      )}
    </div>
  );
}
