"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AppItem {
  id: string;
  stage: string;
  notes: string | null;
  deadline: string | null;
  targetName: string | null;
  targetType: string | null;
}
interface Board {
  stages: string[];
  columns: Record<string, AppItem[]>;
  total: number;
}
interface University { id: string; name: string; }

const STAGE_LABEL: Record<string, string> = {
  INTERESTED: "Interested",
  PLANNING: "Planning",
  DOCUMENTS_PENDING: "Documents",
  APPLIED: "Applied",
  WAITING: "Waiting",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
};

export default function TrackerPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniId, setUniId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setBoard(await api<Board>("/applications"));
  }
  useEffect(() => {
    load().catch(() => {});
    api<{ data: University[] }>("/universities?limit=50")
      .then((r) => setUniversities(r.data))
      .catch(() => {});
  }, []);

  async function add() {
    if (!uniId) return;
    setError("");
    try {
      await api("/applications", { method: "POST", body: JSON.stringify({ universityId: uniId }) });
      setUniId("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    }
  }

  async function move(id: string, stage: string) {
    await api(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) });
    await load();
  }

  async function remove(id: string) {
    await api(`/applications/${id}`, { method: "DELETE" });
    await load();
  }

  if (!board) return <div className="text-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Application Tracker</h1>
          <p className="mt-1 text-sm text-muted">{board.total} application(s) across your pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={uniId} onChange={(e) => setUniId(e.target.value)} className="rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
            <option value="">Add a university…</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button onClick={add} disabled={!uniId} className="btn-gradient rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">Add</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.stages.map((stage) => {
          const items = board.columns[stage] ?? [];
          return (
            <div key={stage} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{STAGE_LABEL[stage] ?? stage}</span>
                <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-muted">{items.length}</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-2">
                {items.length === 0 && <div className="px-2 py-6 text-center text-xs text-muted">—</div>}
                {items.map((it) => (
                  <div key={it.id} className="glass rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium">{it.targetName ?? "Application"}</span>
                      <button onClick={() => remove(it.id)} className="text-muted hover:text-red-400">×</button>
                    </div>
                    {it.targetType && <span className="text-xs text-muted">{it.targetType}</span>}
                    <select
                      value={it.stage}
                      onChange={(e) => move(it.id, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-black/10 bg-black/[0.04] px-2 py-1.5 text-xs outline-none focus:border-brand-2/60"
                    >
                      {board.stages.map((s) => <option key={s} value={s}>{STAGE_LABEL[s] ?? s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
