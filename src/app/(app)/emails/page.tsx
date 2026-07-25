"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const EMAIL_TYPES = [
  { value: "PROFESSOR", label: "Professor outreach" },
  { value: "COLD", label: "Cold email" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "REMINDER", label: "Reminder" },
  { value: "INTERVIEW_REPLY", label: "Interview reply" },
  { value: "THANK_YOU", label: "Thank you" },
];

interface Professor { id: string; name: string; }
interface EmailListItem { id: string; type: string; subject: string; version: number; updatedAt: string; }
interface Email extends EmailListItem { body: string; }

export default function EmailsPage() {
  const [list, setList] = useState<EmailListItem[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [type, setType] = useState("PROFESSOR");
  const [professorId, setProfessorId] = useState("");
  const [context, setContext] = useState("");
  const [current, setCurrent] = useState<Email | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"" | "gen" | "save" | "regen">("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadList() {
    setList(await api<EmailListItem[]>("/emails"));
  }
  useEffect(() => {
    loadList().catch(() => {});
    api<{ data: Professor[] }>("/professors?limit=50")
      .then((r) => setProfessors(r.data))
      .catch(() => {});
  }, []);

  function apply(email: Email) {
    setCurrent(email);
    setSubject(email.subject);
    setBody(email.body);
  }

  async function open(id: string) {
    setError(""); setMsg("");
    apply(await api<Email>(`/emails/${id}`));
  }

  async function generate() {
    setBusy("gen"); setError(""); setMsg("");
    try {
      const email = await api<Email>("/emails", {
        method: "POST",
        body: JSON.stringify({ type, professorId: professorId || undefined, context: context || undefined }),
      });
      apply(email);
      setContext("");
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setBusy(""); }
  }

  async function save() {
    if (!current) return;
    setBusy("save"); setMsg("");
    try {
      await api(`/emails/${current.id}`, { method: "PATCH", body: JSON.stringify({ subject, body }) });
      setMsg("Saved ✓");
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally { setBusy(""); }
  }

  async function regenerate() {
    if (!current) return;
    setBusy("regen"); setMsg("");
    try {
      const email = await api<Email>(`/emails/${current.id}/regenerate`, { method: "POST" });
      apply(email);
      setMsg(`Regenerated → v${email.version}`);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally { setBusy(""); }
  }

  async function copy() {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setMsg("Copied ✓");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Emails</h1>
        <p className="mt-1 text-sm text-muted">Draft professor outreach and application emails — then edit and send.</p>
      </div>

      <div className="glass grid gap-3 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label>
          <span className="mb-1.5 block text-sm text-muted">Email type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
            {EMAIL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label>
          <span className="mb-1.5 block text-sm text-muted">Professor (optional)</span>
          <select value={professorId} onChange={(e) => setProfessorId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
            <option value="">—</option>
            {professors.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label className="sm:col-span-2 lg:col-span-1">
          <span className="mb-1.5 block text-sm text-muted">Extra instructions</span>
          <input value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. mention my CVPR paper" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
        </label>
        <button onClick={generate} disabled={busy === "gen"} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {busy === "gen" ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="glass h-fit rounded-2xl p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted">Your emails</h2>
          <div className="space-y-1">
            {list.length === 0 && <p className="text-sm text-muted">None yet.</p>}
            {list.map((e) => (
              <button key={e.id} onClick={() => open(e.id)} className={`block w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors ${current?.id === e.id ? "bg-white/10 text-foreground" : "text-muted hover:bg-white/5"}`}>
                {e.subject || e.type}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          {!current ? (
            <div className="grid h-64 place-items-center text-muted">Generate an email or pick one to edit.</div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-end gap-2">
                {msg && <span className="mr-auto text-sm text-muted">{msg}</span>}
                <button onClick={copy} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:text-foreground">Copy</button>
                <button onClick={regenerate} disabled={busy === "regen"} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:text-foreground disabled:opacity-60">
                  {busy === "regen" ? "Regenerating…" : "Regenerate"}
                </button>
                <button onClick={save} disabled={busy === "save"} className="btn-gradient rounded-lg px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60">
                  {busy === "save" ? "Saving…" : "Save"}
                </button>
              </div>
              <label className="mb-3 block">
                <span className="mb-1.5 block text-sm text-muted">Subject</span>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted">Body</span>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 outline-none focus:border-brand-2/60" />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
