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

const PIPELINE = ["INTERESTED", "PLANNING", "DOCUMENTS_PENDING", "APPLIED", "WAITING", "INTERVIEW", "OFFER"];
const ALL_STAGES = [...PIPELINE, "ACCEPTED", "REJECTED"];

function chipTone(stage: string): string {
  if (stage === "ACCEPTED" || stage === "OFFER") return "text-success bg-success/15";
  if (stage === "REJECTED") return "text-danger bg-danger/15";
  if (stage === "INTERVIEW" || stage === "WAITING") return "text-accent bg-accent/15";
  return "text-brand bg-brand/15";
}
function dotColor(stage: string): string {
  if (stage === "ACCEPTED" || stage === "OFFER") return "bg-success";
  if (stage === "REJECTED") return "bg-danger";
  if (stage === "INTERVIEW" || stage === "WAITING") return "bg-accent";
  return "bg-brand";
}
function pipelineIndex(stage: string): number {
  if (stage === "ACCEPTED") return PIPELINE.length - 1;
  return PIPELINE.indexOf(stage);
}

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

  if (!board)
    return (
      <div className="space-y-5">
        <div className="skeleton h-8 w-56" />
        <div className="skeleton h-14 w-full rounded-2xl" />
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );

  const apps = board.stages.flatMap((s) => board.columns[s] ?? []);
  const counts = Object.fromEntries(ALL_STAGES.map((s) => [s, (board.columns[s] ?? []).length]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Application Tracker</h1>
          <p className="mt-1 text-sm text-muted">{board.total} application(s) across your pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={uniId} onChange={(e) => setUniId(e.target.value)} className="max-w-[220px] rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none focus:border-brand-2/60">
            <option value="">Add a university…</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button onClick={add} disabled={!uniId} className="btn-gradient rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">Add</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Pipeline overview — every stage at a glance, no scrolling */}
      <div className="glass animate-fade-up flex flex-wrap gap-1.5 rounded-2xl p-3">
        {ALL_STAGES.filter((s) => counts[s] > 0 || PIPELINE.includes(s)).map((s) => (
          <span key={s} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs ${counts[s] > 0 ? "bg-black/[0.03] text-foreground" : "text-muted"}`}>
            <span className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold ${chipTone(s)}`}>{counts[s]}</span>
            {STAGE_LABEL[s]}
          </span>
        ))}
      </div>

      {/* Compact application list */}
      {apps.length === 0 ? (
        <div className="glass animate-fade-up rounded-2xl p-12 text-center">
          <div className="text-4xl">📋</div>
          <p className="mt-3 font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted">Pick a university above and hit <span className="font-medium text-foreground">Add</span> to start tracking.</p>
        </div>
      ) : (
        <div className="glass animate-fade-up overflow-hidden rounded-2xl">
          {apps.map((app) => {
            const activeIdx = pipelineIndex(app.stage);
            const rejected = app.stage === "REJECTED";
            const accepted = app.stage === "ACCEPTED";
            return (
              <div key={app.id} className="flex items-center gap-3 border-t border-black/[0.06] px-3 py-2.5 transition-colors first:border-t-0 hover:bg-black/[0.02] sm:px-4">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor(app.stage)}`} title={STAGE_LABEL[app.stage]} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{app.targetName ?? "Application"}</div>
                </div>

                {/* mini stepper (desktop only) */}
                <div className="hidden w-24 items-center gap-0.5 md:flex lg:w-32" title={STAGE_LABEL[app.stage]}>
                  {PIPELINE.map((st, i) => (
                    <span key={st} className={`h-1.5 flex-1 rounded-full transition-all ${rejected ? "bg-danger/25" : i <= activeIdx ? (accepted ? "bg-success" : "bg-gradient-to-r from-brand to-brand-2") : "bg-black/[0.08]"}`} />
                  ))}
                </div>

                {app.deadline && (
                  <span className="hidden whitespace-nowrap text-xs text-muted sm:inline">⏰ {new Date(app.deadline).toLocaleDateString()}</span>
                )}

                <select
                  value={app.stage}
                  onChange={(e) => move(app.id, e.target.value)}
                  className={`shrink-0 rounded-lg border border-black/10 bg-black/[0.04] px-2 py-1.5 text-xs font-medium outline-none focus:border-brand-2/60 ${chipTone(app.stage).split(" ")[0]}`}
                >
                  {ALL_STAGES.map((s) => <option key={s} value={s} className="text-foreground">{STAGE_LABEL[s]}</option>)}
                </select>

                <button onClick={() => remove(app.id)} aria-label="Remove" className="shrink-0 text-lg leading-none text-muted transition-colors hover:text-danger">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
