"use client";

import Link from "next/link";
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
  professorMatchingLocked?: boolean;
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
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.04]">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent" style={{ width: `${data.profileStrength}%` }} />
            </div>
            <span className="gradient-text font-bold">{data.profileStrength}%</span>
          </div>

          <Section title="🎓 Universities" items={data.universities} basePath="/universities" />
          <Section title="💰 Scholarships" items={data.scholarships} basePath="/scholarships" />
          {data.professorMatchingLocked ? (
            <div>
              <h2 className="mb-3 text-lg font-semibold">🔬 Professors</h2>
              <div className="glass rounded-2xl p-6 text-center">
                <p className="font-medium">AI professor matching is a Premium feature</p>
                <p className="mt-1 text-sm text-muted">
                  Upgrade to get AI-ranked professors whose research fits your profile. You can still browse all professors freely in{" "}
                  <Link href="/explore" className="text-brand hover:underline">Explore</Link>.
                </p>
                <Link href="/billing" className="btn-gradient mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-medium text-white">
                  Upgrade to Premium ✨
                </Link>
              </div>
            </div>
          ) : (
            <Section title="🔬 Professors" items={data.professors} basePath="/professors" />
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, items, basePath }: { title: string; items: Match[]; basePath: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted">{items.length} matched</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((m) => (
          <Link key={m.id} href={`${basePath}/${m.id}`} className="card-hover glass block rounded-2xl p-5">
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
            <span className="mt-3 inline-block text-xs font-medium text-brand">View details →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
