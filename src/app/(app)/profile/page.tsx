"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const COUNTRIES = [
  "USA", "Canada", "Germany", "UK", "Australia", "Italy", "Finland",
  "Sweden", "Norway", "Denmark", "Ireland", "Netherlands",
];
const INTAKES = ["FALL", "SPRING", "SUMMER", "WINTER"];

interface Skill { id: string; name: string; }
interface TestScore { id: string; type: string; score: number; }
interface Education { id: string; institution: string; degree: string; major: string | null; }
interface Experience { id: string; title: string; organization: string; }
interface Publication { id: string; title: string; venue: string | null; year: number | null; }
interface Profile {
  currentUniversity: string | null;
  department: string | null;
  cgpa: number | null;
  researchInterest: string | null;
  budgetUsd: number | null;
  preferredIntake: string | null;
  targetCountries: string[];
  completionPercent: number;
  skills: Skill[];
  testScores: TestScore[];
  educations: Education[];
  experiences: Experience[];
  publications: Publication[];
}

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [ielts, setIelts] = useState("");
  const [cvBusy, setCvBusy] = useState(false);
  const [cvMsg, setCvMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const data = await api<Profile>("/profile/me");
    setP(data);
    const cur = data.testScores.find((t) => t.type === "IELTS");
    setIelts(cur ? String(cur.score) : "");
  }
  useEffect(() => {
    load().catch(() => {});
  }, []);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setP((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  function toggleCountry(c: string) {
    if (!p) return;
    const has = p.targetCountries.includes(c);
    set("targetCountries", has ? p.targetCountries.filter((x) => x !== c) : [...p.targetCountries, c]);
  }

  async function saveCore() {
    if (!p) return;
    setSaving(true); setMsg("");
    try {
      await api("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          currentUniversity: p.currentUniversity || undefined,
          department: p.department || undefined,
          cgpa: p.cgpa ?? undefined,
          researchInterest: p.researchInterest || undefined,
          budgetUsd: p.budgetUsd ?? undefined,
          preferredIntake: p.preferredIntake || undefined,
          targetCountries: p.targetCountries,
        }),
      });
      if (ielts) await api("/profile/test-scores", { method: "PUT", body: JSON.stringify({ type: "IELTS", score: Number(ielts) }) });
      await load();
      setMsg("Saved ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  async function uploadCv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvBusy(true); setCvMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ extracted: { educations: number; experiences: number; publications: number; skills: number } }>(
        "/profile/cv", { method: "POST", body: fd },
      );
      const ex = res.extracted;
      setCvMsg(`Imported ${ex.educations} education, ${ex.experiences} experience, ${ex.publications} publications, ${ex.skills} skills ✓`);
      await load();
    } catch (err) {
      setCvMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCvBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    await api("/profile/skills", { method: "POST", body: JSON.stringify({ name: newSkill.trim() }) });
    setNewSkill("");
    await load();
  }
  async function removeSkill(id: string) {
    await api(`/profile/skills/${id}`, { method: "DELETE" });
    await load();
  }
  async function removeItem(kind: string, id: string) {
    await api(`/profile/${kind}/${id}`, { method: "DELETE" });
    await load();
  }

  if (!p) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-muted">{p.completionPercent}% complete</span>
      </div>

      {/* CV upload */}
      <div className="glass rounded-2xl border border-brand-2/30 p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold">📄 Import from CV</h2>
            <p className="mt-1 text-sm text-muted">Upload your CV (PDF) — AI auto-fills your education, experience, publications & skills.</p>
          </div>
          <label className="btn-gradient shrink-0 cursor-pointer rounded-xl px-5 py-2.5 text-sm font-medium text-white">
            {cvBusy ? "Reading CV…" : "Upload CV (PDF)"}
            <input ref={fileRef} type="file" accept="application/pdf" onChange={uploadCv} disabled={cvBusy} className="hidden" />
          </label>
        </div>
        {cvMsg && <p className="mt-3 text-sm text-muted">{cvMsg}</p>}
      </div>

      {/* Core */}
      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Current university" value={p.currentUniversity ?? ""} onChange={(v) => set("currentUniversity", v)} />
          <Text label="Department / Major" value={p.department ?? ""} onChange={(v) => set("department", v)} />
          <Num label="CGPA (out of 4)" value={p.cgpa} onChange={(v) => set("cgpa", v)} step="0.01" />
          <Num label="Budget (USD / year)" value={p.budgetUsd} onChange={(v) => set("budgetUsd", v)} />
          <div>
            <span className="mb-1.5 block text-sm text-muted">IELTS score</span>
            <input type="number" step="0.5" value={ielts} onChange={(e) => setIelts(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
          </div>
          <div>
            <span className="mb-1.5 block text-sm text-muted">Preferred intake</span>
            <select value={p.preferredIntake ?? ""} onChange={(e) => set("preferredIntake", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
              <option value="">—</option>
              {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted">Research interest</span>
          <textarea value={p.researchInterest ?? ""} onChange={(e) => set("researchInterest", e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
        </div>
        <div>
          <span className="mb-2 block text-sm text-muted">Target countries</span>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button key={c} onClick={() => toggleCountry(c)} type="button" className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${p.targetCountries.includes(c) ? "border-brand-2/50 bg-brand/20 text-foreground" : "border-white/10 bg-white/5 text-muted hover:text-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveCore} disabled={saving} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </div>

      {/* Skills */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold">Skills</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {p.skills.length === 0 && <span className="text-sm text-muted">No skills yet.</span>}
          {p.skills.map((s) => (
            <span key={s.id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
              {s.name}
              <button onClick={() => removeSkill(s.id)} className="text-muted hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="e.g. Python" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
          <button onClick={addSkill} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">Add</button>
        </div>
      </div>

      {/* Education / Experience / Publications */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ListCard title="🎓 Education" empty="Upload a CV or add manually." items={p.educations.map((e) => ({ id: e.id, main: e.institution, sub: `${e.degree}${e.major ? " · " + e.major : ""}` }))} onRemove={(id) => removeItem("educations", id)} />
        <ListCard title="💼 Experience" empty="No experience yet." items={p.experiences.map((e) => ({ id: e.id, main: e.title, sub: e.organization }))} onRemove={(id) => removeItem("experiences", id)} />
        <ListCard title="📚 Publications" empty="No publications yet." items={p.publications.map((pub) => ({ id: pub.id, main: pub.title, sub: [pub.venue, pub.year].filter(Boolean).join(" · ") }))} onRemove={(id) => removeItem("publications", id)} />
      </div>
    </div>
  );
}

function ListCard({ title, empty, items, onRemove }: { title: string; empty: string; items: { id: string; main: string; sub: string }[]; onRemove: (id: string) => void }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] p-3">
              <div>
                <div className="text-sm font-medium">{it.main}</div>
                {it.sub && <div className="text-xs text-muted">{it.sub}</div>}
              </div>
              <button onClick={() => onRemove(it.id)} className="text-muted hover:text-red-400">×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
    </label>
  );
}

function Num({ label, value, onChange, step }: { label: string; value: number | null; onChange: (v: number | null) => void; step?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input type="number" step={step} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
    </label>
  );
}
