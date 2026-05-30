"use client";
import { useEffect, useState } from "react";
import { get, post } from "../lib/api";
import { Plus, Mail, Copy, Check, User } from "lucide-react";

const MOCK_CONTACTS = [
  { id: 1, name: "Priya Sharma", title: "HR Manager", company: "Leapfrog Technology", email: "priya@leapfrog.io", email_content: `Subject: Exploring Product Intern Opportunities at Leapfrog\n\nHi Priya,\n\nI'm a final-year BCA student who recently shipped an autonomous LLM agent on GitHub Actions and a FastAPI-based AI humanizer. I know Leapfrog works on global SaaS products — I'd love to explore if there's an APM or product intern role where I can contribute.\n\nWould you have 15 minutes for a quick call?\n\nSubarna Katwal\nsubwrn@gmail.com` },
  { id: 2, name: "Rohan Acharya", title: "Talent Acquisition", company: "Fusemachines", email: "rohan@fusemachines.com", email_content: null },
  { id: 3, name: "Sita Thapa", title: "Head of Product", company: "CloudFactory", email: null, email_content: null },
];

export default function OutreachPage() {
  const [contacts, setContacts] = useState<any[]>(MOCK_CONTACTS);
  const [selected, setSelected] = useState<any>(MOCK_CONTACTS[0]);
  const [email, setEmail] = useState<string>(MOCK_CONTACTS[0].email_content || "");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", company: "", email: "" });
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { get("/outreach").then((data) => { if (data?.length) setContacts(data); }).catch(() => {}); }, []);

  async function addContact() {
    if (!form.name || !form.company) return;
    setAdding(true);
    try {
      await post("/outreach", form);
      const data = await get("/outreach");
      setContacts(data);
    } catch {
      setContacts([...contacts, { id: Date.now(), ...form, email_content: null }]);
    }
    setForm({ name: "", title: "", company: "", email: "" });
    setAdding(false);
  }

  async function genEmail(id: number) {
    setLoading(true); setEmail("");
    try {
      const res = await post(`/outreach/${id}/email`);
      setEmail(res.email);
    } catch {
      setEmail(`Subject: Exploring Product Opportunities at ${selected.company}\n\nHi ${selected.name},\n\nI'm a final-year BCA student with hands-on AI/backend experience — I've shipped LLM agents and FastAPI services in production. I'd love to explore any product or BA intern roles at ${selected.company}.\n\nCould we connect for 15 minutes?\n\nSubarna Katwal\nsubwrn@gmail.com`);
    }
    setLoading(false);
  }

  function copy() { navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 1500); }

  const contactCard = (active: boolean) => ({
    background: active ? "#090909" : "#fff",
    border: `1px solid ${active ? "#090909" : "#f0f0f0"}`,
    borderRadius: 14, padding: "14px 16px", marginBottom: 8,
    cursor: "pointer", textAlign: "left" as const, width: "100%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  });

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 80px)" }}>
      {/* Left */}
      <div style={{ width: 260, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Outreach</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>Cold Email</h1>
        </div>

        <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 16, padding: "20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>Add HR Contact</p>
          {[
            { key: "name", placeholder: "Full name *" },
            { key: "title", placeholder: "Job title" },
            { key: "company", placeholder: "Company *" },
            { key: "email", placeholder: "Email (optional)" },
          ].map(({ key, placeholder }) => (
            <input key={key} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
              style={{ width: "100%", fontSize: 13, fontWeight: 500, border: "1px solid #f0f0f0", borderRadius: 10, padding: "9px 14px", outline: "none", marginBottom: 8, fontFamily: "inherit", color: "#090909", background: "#fafafa" }} />
          ))}
          <button onClick={addContact} disabled={adding || !form.name || !form.company}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#090909", color: "#fff", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", marginTop: 4, opacity: adding || !form.name || !form.company ? 0.4 : 1 }}>
            <Plus size={13} /> Add Contact
          </button>
        </div>

        {contacts.map((c) => {
          const active = selected?.id === c.id;
          return (
            <button key={c.id} onClick={() => { setSelected(c); setEmail(c.email_content || ""); }} style={contactCard(active)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: active ? "rgba(255,255,255,0.1)" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={13} color={active ? "#fff" : "#aaa"} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#090909", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: active ? "#999" : "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.company}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right */}
      {selected ? (
        <div style={{ flex: 1, background: "#fff", border: "1px solid #f0f0f0", borderRadius: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflowY: "auto" }}>
          <div style={{ padding: "32px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>{selected.company}</p>
              <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>{selected.name}</h2>
              <p style={{ fontSize: 13, color: "#888", marginTop: 4, fontWeight: 500 }}>{selected.title}</p>
              {selected.email && <p style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>{selected.email}</p>}
            </div>
            <button onClick={() => genEmail(selected.id)} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#090909", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <Mail size={13} />{loading ? "Generating..." : "Generate Email"}
            </button>
          </div>

          <div style={{ padding: "28px 32px" }}>
            {email ? (
              <div style={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 14, padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa" }}>Cold Email Draft</p>
                  <button onClick={copy} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#aaa", background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />}{copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ fontSize: 13, color: "#444", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.7 }}>{email}</pre>
              </div>
            ) : (
              <div style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Mail size={20} color="#ccc" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#ccc" }}>No email generated yet</p>
                <p style={{ fontSize: 12, color: "#ddd", marginTop: 4 }}>Click "Generate Email" to create personalized cold outreach</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
