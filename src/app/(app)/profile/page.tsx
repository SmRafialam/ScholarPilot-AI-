"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const COUNTRIES = [
  "USA", "Canada", "Germany", "UK", "Australia", "Italy", "Finland",
  "Sweden", "Norway", "Denmark", "Ireland", "Netherlands",
];
const INTAKES = ["FALL", "SPRING", "SUMMER", "WINTER"];

interface Skill { id: string; name: string; }
interface TestScore { id: string; type: string; score: number; }
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
}

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [ielts, setIelts] = useState("");

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
    setSaving(true);
    setMsg("");
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
      if (ielts) {
        await api("/profile/test-scores", {
          method: "PUT",
          body: JSON.stringify({ type: "IELTS", score: Number(ielts) }),
        });
      }
      await load();
      setMsg("Saved ✓");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    await api("/profile/skills", {
      method: "POST",
      body: JSON.stringify({ name: newSkill.trim() }),
    });
    setNewSkill("");
    await load();
  }
  async function removeSkill(id: string) {
    await api(`/profile/skills/${id}`, { method: "DELETE" });
    await load();
  }

  if (!p) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-muted">
          {p.completionPercent}% complete
        </span>
      </div>

      <div className="glass space-y-4 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Current university" value={p.currentUniversity ?? ""} onChange={(v) => set("currentUniversity", v)} />
          <Text label="Department / Major" value={p.department ?? ""} onChange={(v) => set("department", v)} />
          <Num label="CGPA (out of 4)" value={p.cgpa} onChange={(v) => set("cgpa", v)} step="0.01" />
          <Num label="Budget (USD / year)" value={p.budgetUsd} onChange={(v) => set("budgetUsd", v)} />
          <div>
            <span className="mb-1.5 block text-sm text-muted">IELTS score</span>
            <input
              type="number" step="0.5" value={ielts} onChange={(e) => setIelts(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm text-muted">Preferred intake</span>
            <select
              value={p.preferredIntake ?? ""} onChange={(e) => set("preferredIntake", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
            >
              <option value="">—</option>
              {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm text-muted">Research interest</span>
          <textarea
            value={p.researchInterest ?? ""} onChange={(e) => set("researchInterest", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
          />
        </div>

        <div>
          <span className="mb-2 block text-sm text-muted">Target countries</span>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c} onClick={() => toggleCountry(c)} type="button"
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  p.targetCountries.includes(c)
                    ? "border-brand-2/50 bg-brand/20 text-foreground"
                    : "border-white/10 bg-white/5 text-muted hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={saveCore} disabled={saving} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
            {saving ? "Saving…" : "Save profile"}
          </button>
          {msg && <span className="text-sm text-muted">{msg}</span>}
        </div>
      </div>

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
          <input
            value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="e.g. Python"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
          />
          <button onClick={addSkill} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
            Add
          </button>
        </div>
      </div>
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
      <input
        type="number" step={step} value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
      />
    </label>
  );
}
