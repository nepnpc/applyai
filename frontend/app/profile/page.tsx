"use client";
import { useEffect, useState } from "react";
import { get, put } from "../lib/api";
import { Check } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState({ summary: "", skills: "", roles: "", resumeText: "" });

  useEffect(() => {
    get("/profile").then((p) => {
      setProfile(p);
      setFields({
        summary: p.summary || "",
        skills: tryParse(p.skills, []).join(", "),
        roles: tryParse(p.target_roles, []).join(", "),
        resumeText: p.resume_text || "",
      });
    });
  }, []);

  function tryParse(json: string, fallback: any) {
    try { return JSON.parse(json); } catch { return fallback; }
  }

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    await put("/profile", {
      summary: fields.summary,
      skills: fields.skills.split(",").map((s) => s.trim()).filter(Boolean),
      target_roles: fields.roles.split(",").map((s) => s.trim()).filter(Boolean),
      resume_text: fields.resumeText,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  }

  if (!profile) return (
    <div className="flex items-center gap-3 text-neutral-300 text-sm">
      <div className="w-4 h-4 border-2 border-neutral-200 border-t-black rounded-full animate-spin" />
      Loading profile...
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Settings</p>
          <h1 className="text-4xl font-black tracking-tight leading-none">Profile</h1>
          <p className="text-neutral-400 text-sm mt-2 font-medium">Powers all AI generation</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-neutral-800 disabled:opacity-40 cursor-pointer shadow-sm"
        >
          {saved && <Check size={13} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Identity */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-7 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-5">Identity</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              ["Name", profile.name],
              ["Email", profile.email],
              ["Phone", profile.phone],
              ["Location", profile.location],
              ["LinkedIn", profile.linkedin],
              ["GitHub", profile.github],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-300 mb-1">{label}</p>
                <p className="text-sm font-semibold text-black truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields */}
        {[
          { key: "summary", label: "Summary", rows: 4, placeholder: "Your professional summary..." },
          { key: "skills", label: "Skills", sub: "comma separated", rows: 3, placeholder: "Python, FastAPI, Groq, Prompt Engineering..." },
          { key: "roles", label: "Target Roles", sub: "comma separated", rows: 2, placeholder: "APM Intern, Technical BA Intern, AI ML Intern..." },
          { key: "resumeText", label: "Resume Text", sub: "used for tailoring", rows: 10, placeholder: "Paste full resume text...", mono: true },
        ].map(({ key, label, sub, rows, placeholder, mono }) => (
          <div key={key} className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
              {sub && <p className="text-[10px] text-neutral-300">{sub}</p>}
            </div>
            <textarea
              value={(fields as any)[key]}
              onChange={set(key)}
              rows={rows}
              placeholder={placeholder}
              className={`w-full resize-none outline-none placeholder:text-neutral-200 leading-relaxed ${
                mono ? "font-mono text-xs text-neutral-600" : "text-sm text-black font-medium"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
