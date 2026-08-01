"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const COUNTRIES = [
  "USA", "Canada", "Germany", "UK", "Australia", "Italy", "Finland",
  "Sweden", "Norway", "Denmark", "Ireland", "Netherlands",
];
const INTAKES = ["FALL", "SPRING", "SUMMER", "WINTER"];
const DEGREES = ["BACHELOR", "MASTER", "PHD", "DIPLOMA", "CERTIFICATE"];

interface Skill { id: string; name: string; }
interface TestScore { id: string; type: string; score: number; }
interface Education { id: string; institution: string; degree: string; major: string | null; }
interface Experience { id: string; title: string; organization: string; }
interface Project { id: string; name: string; }
interface Publication { id: string; title: string; venue: string | null; year: number | null; }
interface Country { id: string; name: string; }
interface Profile {
  fullName: string | null;
  countryId: string | null;
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
  projects: Project[];
  publications: Publication[];
}

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
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
    // Country list for the "home country" selector — derived from the catalog.
    api<{ data: { country: Country | null }[] }>("/universities?limit=100")
      .then((r) => {
        const map = new Map<string, string>();
        r.data.forEach((u) => u.country && map.set(u.country.id, u.country.name));
        setCountries([...map].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {});
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
          countryId: p.countryId || undefined,
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
  async function addItem(kind: string, body: object) {
    await api(`/profile/${kind}`, { method: "POST", body: JSON.stringify(body) });
    await load();
  }

  if (!p) return <div className="text-muted">Loading…</div>;

  const checklist = buildChecklist(p);
  const done = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <span className="rounded-full bg-black/[0.04] px-3 py-1 text-sm text-muted">{p.completionPercent}% complete</span>
      </div>

      {/* Completion checklist */}
      <ChecklistCard checklist={checklist} done={done} total={checklist.length} percent={p.completionPercent} />

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
          <div>
            <span className="mb-1.5 block text-sm text-muted">Home country</span>
            <select value={p.countryId ?? ""} onChange={(e) => set("countryId", e.target.value || null)} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
              <option value="">—</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Text label="Current university" value={p.currentUniversity ?? ""} onChange={(v) => set("currentUniversity", v)} />
          <Text label="Department / Major" value={p.department ?? ""} onChange={(v) => set("department", v)} />
          <Num label="CGPA (out of 4)" value={p.cgpa} onChange={(v) => set("cgpa", v)} step="0.01" />
          <Num label="Budget (USD / year)" value={p.budgetUsd} onChange={(v) => set("budgetUsd", v)} />
          <div>
            <span className="mb-1.5 block text-sm text-muted">IELTS score</span>
            <input type="number" step="0.5" value={ielts} onChange={(e) => setIelts(e.target.value)} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
          </div>
          <div>
            <span className="mb-1.5 block text-sm text-muted">Preferred intake</span>
            <select value={p.preferredIntake ?? ""} onChange={(e) => set("preferredIntake", e.target.value)} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
              <option value="">—</option>
              {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-sm text-muted">Research interest</span>
          <textarea value={p.researchInterest ?? ""} onChange={(e) => set("researchInterest", e.target.value)} rows={2} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
        </div>
        <div>
          <span className="mb-2 block text-sm text-muted">Target countries</span>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button key={c} onClick={() => toggleCountry(c)} type="button" className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${p.targetCountries.includes(c) ? "border-brand-2/50 bg-brand/20 text-foreground" : "border-black/10 bg-black/[0.04] text-muted hover:text-foreground"}`}>{c}</button>
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
            <span key={s.id} className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-sm">
              {s.name}
              <button onClick={() => removeSkill(s.id)} className="text-muted hover:text-red-400">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="e.g. Python" className="flex-1 rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
          <button onClick={addSkill} className="rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm hover:bg-black/[0.06]">Add</button>
        </div>
      </div>

      {/* Education / Experience / Projects / Publications */}
      <div className="grid gap-6 md:grid-cols-2">
        <ListCard
          title="🎓 Education" empty="Upload a CV or add manually."
          items={p.educations.map((e) => ({ id: e.id, main: e.institution, sub: `${e.degree}${e.major ? " · " + e.major : ""}` }))}
          onRemove={(id) => removeItem("educations", id)}
          fields={[{ name: "institution", label: "Institution", required: true }, { name: "degree", label: "Degree", options: DEGREES }, { name: "major", label: "Major (optional)" }]}
          onAdd={(v) => addItem("educations", { institution: v.institution, degree: v.degree || "BACHELOR", major: v.major || undefined })}
        />
        <ListCard
          title="💼 Experience" empty="No experience yet."
          items={p.experiences.map((e) => ({ id: e.id, main: e.title, sub: e.organization }))}
          onRemove={(id) => removeItem("experiences", id)}
          fields={[{ name: "title", label: "Title", required: true }, { name: "organization", label: "Organization", required: true }]}
          onAdd={(v) => addItem("experiences", { title: v.title, organization: v.organization })}
        />
        <ListCard
          title="🧪 Projects" empty="No projects yet."
          items={p.projects.map((pr) => ({ id: pr.id, main: pr.name, sub: "" }))}
          onRemove={(id) => removeItem("projects", id)}
          fields={[{ name: "name", label: "Project name", required: true }, { name: "description", label: "Description (optional)" }]}
          onAdd={(v) => addItem("projects", { name: v.name, description: v.description || undefined })}
        />
        <ListCard
          title="📚 Publications" empty="No publications yet."
          items={p.publications.map((pub) => ({ id: pub.id, main: pub.title, sub: [pub.venue, pub.year].filter(Boolean).join(" · ") }))}
          onRemove={(id) => removeItem("publications", id)}
          fields={[{ name: "title", label: "Title", required: true }, { name: "venue", label: "Venue (optional)" }, { name: "year", label: "Year (optional)", type: "number" }]}
          onAdd={(v) => addItem("publications", { title: v.title, venue: v.venue || undefined, year: v.year ? Number(v.year) : undefined })}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------- completion checklist */

interface Check { section: string; label: string; done: boolean; hint: string; }

function buildChecklist(p: Profile): Check[] {
  return [
    { section: "Basics", label: "Full name", done: !!p.fullName, hint: "Set when you signed up" },
    { section: "Basics", label: "Home country", done: !!p.countryId, hint: "Pick your home country below" },
    { section: "Academics", label: "Current university", done: !!p.currentUniversity, hint: "Fill “Current university”" },
    { section: "Academics", label: "Department / Major", done: !!p.department, hint: "Fill “Department / Major”" },
    { section: "Academics", label: "CGPA", done: p.cgpa != null, hint: "Fill “CGPA”" },
    { section: "Academics", label: "Education entry", done: p.educations.length > 0, hint: "Add an education (or import CV)" },
    { section: "Tests & Skills", label: "Test score (IELTS…)", done: p.testScores.length > 0, hint: "Add your IELTS score" },
    { section: "Tests & Skills", label: "Skills", done: p.skills.length > 0, hint: "Add at least one skill" },
    { section: "Experience & Research", label: "Research interest", done: !!p.researchInterest, hint: "Fill “Research interest”" },
    { section: "Experience & Research", label: "Experience", done: p.experiences.length > 0, hint: "Add work/research experience" },
    { section: "Experience & Research", label: "Project", done: p.projects.length > 0, hint: "Add a project" },
    { section: "Experience & Research", label: "Publication", done: p.publications.length > 0, hint: "Add a publication" },
    { section: "Preferences", label: "Budget (USD/year)", done: p.budgetUsd != null, hint: "Fill “Budget”" },
    { section: "Preferences", label: "Preferred intake", done: !!p.preferredIntake, hint: "Choose an intake" },
    { section: "Preferences", label: "Target countries", done: p.targetCountries.length > 0, hint: "Pick target countries" },
  ];
}

function ChecklistCard({ checklist, done, total, percent }: { checklist: Check[]; done: number; total: number; percent: number }) {
  const sections = [...new Set(checklist.map((c) => c.section))];
  const complete = done === total;
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{complete ? "🎉 Profile complete!" : "🎯 Reach 100%"}</h2>
          <p className="mt-1 text-sm text-muted">
            {complete ? "Every section is filled — you’ll get the sharpest matches." : `${done} of ${total} done — finish the ${total - done} item(s) below to hit 100%.`}
          </p>
        </div>
        <span className="gradient-text text-2xl font-bold">{percent}%</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all" style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {sections.map((sec) => (
          <div key={sec}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{sec}</div>
            <ul className="space-y-1.5">
              {checklist.filter((c) => c.section === sec).map((c) => (
                <li key={c.label} className="flex items-start gap-2 text-sm">
                  {c.done ? <CheckDone /> : <CheckPending />}
                  <span className={c.done ? "text-foreground" : "text-foreground"}>
                    {c.label}
                    {!c.done && <span className="ml-1 text-muted">— {c.hint}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckDone() {
  return (
    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-white">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="h-2.5 w-2.5"><path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}
function CheckPending() {
  return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-black/15" />;
}

/* ------------------------------------------------------- list card with add form */

interface Field { name: string; label: string; type?: string; options?: string[]; required?: boolean; }

function ListCard({
  title, empty, items, onRemove, fields, onAdd,
}: {
  title: string; empty: string;
  items: { id: string; main: string; sub: string }[];
  onRemove: (id: string) => void;
  fields: Field[];
  onAdd: (values: Record<string, string>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function start() {
    setVals(Object.fromEntries(fields.filter((f) => f.options).map((f) => [f.name, f.options![0]])));
    setOpen(true);
  }
  const canSubmit = fields.filter((f) => f.required).every((f) => (vals[f.name] ?? "").trim());
  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try { await onAdd(vals); setVals({}); setOpen(false); }
    catch { /* surfaced via alert below */ }
    finally { setBusy(false); }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={() => (open ? setOpen(false) : start())} className="rounded-lg border border-black/10 bg-black/[0.04] px-2.5 py-1 text-xs hover:bg-black/[0.06]">
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {open && (
        <div className="mb-4 space-y-2 rounded-xl border border-black/[0.06] bg-black/[0.02] p-3">
          {fields.map((f) => (
            f.options ? (
              <select key={f.name} value={vals[f.name] ?? f.options[0]} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-black/[0.04] px-3 py-2 text-sm outline-none focus:border-brand-2/60">
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input key={f.name} type={f.type ?? "text"} value={vals[f.name] ?? ""} placeholder={f.label} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))} className="w-full rounded-lg border border-black/10 bg-black/[0.04] px-3 py-2 text-sm outline-none focus:border-brand-2/60" />
            )
          ))}
          <button onClick={submit} disabled={!canSubmit || busy} className="btn-gradient w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50">
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-2 rounded-lg border border-black/[0.06] bg-black/[0.03] p-3">
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
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
    </label>
  );
}

function Num({ label, value, onChange, step }: { label: string; value: number | null; onChange: (v: number | null) => void; step?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input type="number" step={step} value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
    </label>
  );
}
