"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface RoadmapStep { action: string; impact: string; priority: string; }
interface Analysis {
  profileStrength: number;
  admissionChances: Record<string, number>;
  fundingChances: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  roadmap: RoadmapStep[];
  estimatedBudget: { tuitionUsdPerYear?: number; livingUsdPerYear?: number; notes?: string };
  timeline: { phases?: { phase: string; when: string }[]; requiredExams?: string[] };
}

export default function AssistantPage() {
  const [data, setData] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Analysis>("/assistant/analysis").then((d) => d && setData(d)).catch(() => {});
  }, []);

  async function run() {
    setLoading(true);
    setError("");
    try {
      setData(await api<Analysis>("/assistant/analyze", { method: "POST" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Application Assistant</h1>
          <p className="mt-1 text-sm text-muted">Honest, personalized analysis of your chances.</p>
        </div>
        <button onClick={run} disabled={loading} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Analyzing…" : data ? "Re-analyze" : "Analyze my profile"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {loading && !data && (
        <div className="glass rounded-2xl p-10 text-center text-muted">
          The AI is assessing your profile against each target country…
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <ChanceCard title="Admission chance" data={data.admissionChances} from="from-brand" to="to-brand-2" />
            <ChanceCard title="Funding chance" data={data.fundingChances} from="from-emerald-500" to="to-accent" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ListCard title="✅ Strengths" items={data.strengths} tone="text-success" />
            <ListCard title="⚠️ Weaknesses" items={data.weaknesses} tone="text-amber-400" />
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold">📈 Improvement roadmap</h2>
            <div className="space-y-3">
              {data.roadmap?.map((r, i) => (
                <div key={i} className="rounded-xl border border-black/[0.06] bg-black/[0.03] p-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle(r.priority)}`}>
                      {r.priority}
                    </span>
                    <span className="font-medium">{r.action}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{r.impact}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-3 text-lg font-semibold">💵 Estimated budget</h2>
              <p className="text-sm text-muted">Tuition: <span className="text-foreground">${data.estimatedBudget?.tuitionUsdPerYear?.toLocaleString() ?? "—"}/yr</span></p>
              <p className="text-sm text-muted">Living: <span className="text-foreground">${data.estimatedBudget?.livingUsdPerYear?.toLocaleString() ?? "—"}/yr</span></p>
              {data.estimatedBudget?.notes && <p className="mt-2 text-sm text-muted">{data.estimatedBudget.notes}</p>}
            </div>
            <div className="glass rounded-2xl p-6">
              <h2 className="mb-3 text-lg font-semibold">📝 Required exams</h2>
              <div className="flex flex-wrap gap-2">
                {(data.timeline?.requiredExams ?? []).map((e, i) => (
                  <span key={i} className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1.5 text-sm text-muted">{e}</span>
                ))}
                {!data.timeline?.requiredExams?.length && <span className="text-sm text-muted">—</span>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChanceCard({ title, data, from, to }: { title: string; data: Record<string, number>; from: string; to: string }) {
  const entries = Object.entries(data ?? {});
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">
        {entries.length === 0 && <span className="text-sm text-muted">—</span>}
        {entries.map(([country, pct]) => (
          <div key={country}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted">{country}</span>
              <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-black/[0.04]">
              <div className={`h-full rounded-full bg-gradient-to-r ${from} ${to}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2">
        {(items ?? []).map((s, i) => (
          <li key={i} className={`text-sm ${tone}`}>• <span className="text-foreground">{s}</span></li>
        ))}
        {!items?.length && <span className="text-sm text-muted">—</span>}
      </ul>
    </div>
  );
}

function priorityStyle(priority: string): string {
  switch (priority?.toLowerCase()) {
    case "high": return "bg-red-500/15 text-red-400";
    case "medium": return "bg-amber-500/15 text-amber-400";
    default: return "bg-brand/15 text-brand";
  }
}
