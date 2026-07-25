"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const DOC_TYPES = [
  { value: "RESEARCH_PROPOSAL", label: "Research Proposal" },
  { value: "SOP", label: "Statement of Purpose" },
  { value: "MOTIVATION_LETTER", label: "Motivation Letter" },
  { value: "PERSONAL_STATEMENT", label: "Personal Statement" },
  { value: "COVER_LETTER", label: "Cover Letter" },
  { value: "CV", label: "CV" },
  { value: "RESUME", label: "Resume" },
];

interface DocListItem {
  id: string;
  type: string;
  title: string | null;
  version: number;
  status: string;
  updatedAt: string;
}
interface Doc extends DocListItem {
  content: string;
}

export default function DocumentsPage() {
  const [list, setList] = useState<DocListItem[]>([]);
  const [type, setType] = useState("RESEARCH_PROPOSAL");
  const [context, setContext] = useState("");
  const [current, setCurrent] = useState<Doc | null>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState<"" | "gen" | "save" | "regen">("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function loadList() {
    setList(await api<DocListItem[]>("/documents"));
  }
  useEffect(() => {
    loadList().catch(() => {});
  }, []);

  async function open(id: string) {
    setError("");
    setMsg("");
    const doc = await api<Doc>(`/documents/${id}`);
    setCurrent(doc);
    setContent(doc.content);
  }

  async function generate() {
    setBusy("gen");
    setError("");
    setMsg("");
    try {
      const doc = await api<Doc>("/documents", {
        method: "POST",
        body: JSON.stringify({ type, context: context || undefined }),
      });
      setCurrent(doc);
      setContent(doc.content);
      setContext("");
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy("");
    }
  }

  async function save() {
    if (!current) return;
    setBusy("save");
    setMsg("");
    try {
      await api(`/documents/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
      setMsg("Saved ✓");
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy("");
    }
  }

  async function regenerate() {
    if (!current) return;
    setBusy("regen");
    setMsg("");
    try {
      const doc = await api<Doc>(`/documents/${current.id}/regenerate`, { method: "POST" });
      setCurrent(doc);
      setContent(doc.content);
      setMsg(`Regenerated → v${doc.version}`);
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Documents</h1>
        <p className="mt-1 text-sm text-muted">Generate, edit and reuse your application documents.</p>
      </div>

      {/* Generator bar */}
      <div className="glass flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-sm text-muted">Document type</span>
          <select
            value={type} onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
          >
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="flex-[2]">
          <span className="mb-1.5 block text-sm text-muted">Extra instructions (optional)</span>
          <input
            value={context} onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. emphasize my computer vision project"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-brand-2/60"
          />
        </label>
        <button onClick={generate} disabled={busy === "gen"} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {busy === "gen" ? "Generating…" : "Generate"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Saved list */}
        <div className="glass h-fit rounded-2xl p-4">
          <h2 className="mb-3 text-sm font-semibold text-muted">Your documents</h2>
          <div className="space-y-1">
            {list.length === 0 && <p className="text-sm text-muted">None yet.</p>}
            {list.map((d) => (
              <button
                key={d.id} onClick={() => open(d.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  current?.id === d.id ? "bg-white/10 text-foreground" : "text-muted hover:bg-white/5"
                }`}
              >
                {d.title ?? d.type} <span className="text-xs text-muted">v{d.version}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="glass rounded-2xl p-5">
          {!current ? (
            <div className="grid h-64 place-items-center text-muted">
              Generate a document or pick one from the list to edit.
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{current.title ?? current.type} <span className="text-xs text-muted">v{current.version}</span></h3>
                <div className="flex items-center gap-2">
                  {msg && <span className="text-sm text-muted">{msg}</span>}
                  <button onClick={regenerate} disabled={busy === "regen"} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60">
                    {busy === "regen" ? "Regenerating…" : "Regenerate"}
                  </button>
                  <button onClick={save} disabled={busy === "save"} className="btn-gradient rounded-lg px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60">
                    {busy === "save" ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
              <textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                rows={22}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-brand-2/60"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
