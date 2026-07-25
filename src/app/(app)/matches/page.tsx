"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Match {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  reasoning?: string;
}
interface MatchResponse {
  profileStrength: number;
  universities: Match[];
  scholarships: Match[];
  professors: Match[];
}

export default function MatchesPage() {
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      setData(await api<MatchResponse>("/matching/run", { method: "POST" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Matching failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your matches</h1>
          <p className="mt-1 text-sm text-muted">
            AI-ranked universities, scholarships and professors for your profile.
          </p>
        </div>
        <button onClick={run} disabled={loading} className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Analyzing…" : data ? "Re-run" : "Run matching"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading && !data && (
        <div className="glass rounded-2xl p-10 text-center text-muted">
          Scoring universities, embedding your research interests, and asking the AI why each fits…
        </div>
      )}

      {data && (
        <>
          <div className="glass flex items-center gap-4 rounded-2xl p-5">
            <span className="text-sm text-muted">Profile strength</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${data.profileStrength}%` }} />
            </div>
            <span className="gradient-text font-bold">{data.profileStrength}%</span>
          </div>

          <Section title="🎓 Universities" items={data.universities} />
          <Section title="💰 Scholarships" items={data.scholarships} />
          <Section title="🔬 Professors" items={data.professors} />
        </>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: Match[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.slice(0, 6).map((m) => (
          <div key={m.id} className="card-hover glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{m.name}</h3>
                {m.subtitle && <p className="text-sm text-muted">{m.subtitle}</p>}
              </div>
              <span className="shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-2 px-2.5 py-1 text-xs font-bold text-white">
                {m.score}%
              </span>
            </div>
            {m.reasoning && <p className="mt-3 text-sm leading-6 text-muted">{m.reasoning}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
