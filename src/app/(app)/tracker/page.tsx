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

// Linear progression pipeline (terminal states handled separately).
const PIPELINE = ["INTERESTED", "PLANNING", "DOCUMENTS_PENDING", "APPLIED", "WAITING", "INTERVIEW", "OFFER"];
const ALL_STAGES = [...PIPELINE, "ACCEPTED", "REJECTED"];

function stageTone(stage: string): string {
  if (stage === "ACCEPTED" || stage === "OFFER") return "text-success bg-success/15";
  if (stage === "REJECTED") return "text-danger bg-danger/15";
  if (stage === "INTERVIEW" || stage === "WAITING") return "text-accent bg-accent/15";
  return "text-brand bg-brand/15";
}
function pipelineIndex(stage: string): number {
  if (stage === "ACCEPTED") return PIPELINE.length - 1;
  return PIPELINE.indexOf(stage); // -1 for REJECTED
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

  if (!board) return <div className="text-muted">Loading…</div>;

  const apps = board.stages.flatMap((s) => board.columns[s] ?? []);
  const counts = Object.fromEntries(ALL_STAGES.map((s) => [s, (board.columns[s] ?? []).length]));

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

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Pipeline overview — every stage at a glance, no scrolling */}
      <div className="glass animate-fade-up rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          {ALL_STAGES.map((s) => (
            <div key={s} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${counts[s] > 0 ? "bg-black/[0.03]" : ""}`}>
              <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold ${stageTone(s)}`}>{counts[s]}</span>
              <span className={counts[s] > 0 ? "text-foreground" : "text-muted"}>{STAGE_LABEL[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Applications with a progress stepper each */}
      {apps.length === 0 ? (
        <div className="glass animate-fade-up rounded-2xl p-12 text-center">
          <div className="text-4xl">📋</div>
          <p className="mt-3 font-medium">No applications yet</p>
          <p className="mt-1 text-sm text-muted">Pick a university above and hit <span className="font-medium text-foreground">Add</span> to start tracking.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {apps.map((app, i) => (
            <ApplicationCard key={app.id} app={app} index={i} onMove={move} onRemove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ app, index, onMove, onRemove }: { app: AppItem; index: number; onMove: (id: string, stage: string) => void; onRemove: (id: string) => void }) {
  const activeIdx = pipelineIndex(app.stage);
  const rejected = app.stage === "REJECTED";
  const accepted = app.stage === "ACCEPTED";

  return (
    <div className="card-hover glass animate-fade-up rounded-2xl p-5" style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{app.targetName ?? "Application"}</h3>
          {app.targetType && <span className="text-xs text-muted">{app.targetType.toLowerCase()}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageTone(app.stage)}`}>{STAGE_LABEL[app.stage]}</span>
          <button onClick={() => onRemove(app.id)} aria-label="Remove" className="text-lg leading-none text-muted transition-colors hover:text-danger">×</button>
        </div>
      </div>

      {/* Progress stepper — click a segment to jump to that stage */}
      <div className="mt-4">
        <div className="flex items-center gap-1">
          {PIPELINE.map((st, i) => {
            const filled = !rejected && i <= activeIdx;
            return (
              <button
                key={st}
                onClick={() => onMove(app.id, st)}
                title={STAGE_LABEL[st]}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  rejected
                    ? "bg-danger/25"
                    : filled
                      ? accepted
                        ? "bg-gradient-to-r from-success to-success"
                        : "bg-gradient-to-r from-brand to-brand-2"
                      : "bg-black/[0.08] hover:bg-black/[0.15]"
                }`}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wide text-muted">
          <span>Interested</span>
          <span>{accepted ? "Accepted 🎉" : rejected ? "Rejected" : "Offer"}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2">
        <select
          value={app.stage}
          onChange={(e) => onMove(app.id, e.target.value)}
          className="flex-1 rounded-lg border border-black/10 bg-black/[0.04] px-3 py-2 text-xs outline-none focus:border-brand-2/60"
        >
          {ALL_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
        {app.deadline && (
          <span className="whitespace-nowrap rounded-lg bg-black/[0.04] px-2.5 py-2 text-xs text-muted">
            ⏰ {new Date(app.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
