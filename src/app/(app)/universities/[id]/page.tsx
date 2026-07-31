"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Program {
  id: string;
  name: string;
  degree: string;
  durationMonths: number | null;
  tuitionFeeUsd: number | null;
  englishRequirement: { ielts?: number; toefl?: number } | null;
}
interface Department {
  id: string;
  name: string;
  programs: Program[];
}
interface University {
  id: string;
  name: string;
  qsRanking: number | null;
  worldRanking: number | null;
  acceptanceRate: number | null;
  tuitionFeeUsd: number | null;
  applicationFeeUsd: number | null;
  website: string | null;
  description: string | null;
  country: { name: string } | null;
  city: { name: string } | null;
  departments: Department[];
  researchAreas: { name: string }[];
}

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [u, setU] = useState<University | null>(null);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    api<University>(`/universities/${id}`)
      .then(setU)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  async function addToTracker() {
    if (!u) return;
    setTracking("saving");
    try {
      await api("/applications", { method: "POST", body: JSON.stringify({ universityId: u.id }) });
      setTracking("done");
    } catch {
      setTracking("idle");
    }
  }

  if (error) return <BackShell><p className="text-sm text-red-500">{error}</p></BackShell>;
  if (!u) return <BackShell><p className="text-muted">Loading…</p></BackShell>;

  return (
    <BackShell>
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{u.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted">
              <PinIcon />
              {[u.city?.name, u.country?.name].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
          <button
            onClick={addToTracker}
            disabled={tracking !== "idle"}
            className="btn-gradient rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {tracking === "done" ? "✓ Added to tracker" : tracking === "saving" ? "Adding…" : "+ Add to tracker"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="QS Ranking" value={u.qsRanking != null ? `#${u.qsRanking}` : "—"} />
          <Stat label="Acceptance" value={u.acceptanceRate != null ? `${u.acceptanceRate}%` : "—"} />
          <Stat label="Tuition / yr" value={u.tuitionFeeUsd === 0 ? "Free" : u.tuitionFeeUsd != null ? `$${u.tuitionFeeUsd.toLocaleString()}` : "—"} />
          <Stat label="App. fee" value={u.applicationFeeUsd != null ? `$${u.applicationFeeUsd}` : "—"} />
        </div>

        {u.researchAreas.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">Research strengths</h2>
            <div className="flex flex-wrap gap-2">
              {u.researchAreas.map((a) => (
                <span key={a.name} className="rounded-full bg-gradient-to-r from-brand/15 to-brand-2/15 px-3 py-1 text-sm">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Programs */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Programs</h2>
        <div className="space-y-3">
          {u.departments.flatMap((d) =>
            d.programs.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted">{d.name}</p>
                  </div>
                  <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-medium">{p.degree}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                  {p.durationMonths && <span>⏱ {p.durationMonths} months</span>}
                  {p.tuitionFeeUsd != null && <span>💵 {p.tuitionFeeUsd === 0 ? "No tuition" : `$${p.tuitionFeeUsd.toLocaleString()}/yr`}</span>}
                  {p.englishRequirement?.ielts && <span>🗣 IELTS {p.englishRequirement.ielts}</span>}
                </div>
              </div>
            )),
          )}
          {u.departments.every((d) => d.programs.length === 0) && (
            <p className="text-sm text-muted">No programs listed yet.</p>
          )}
        </div>
      </div>
    </BackShell>
  );
}

function BackShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
        <span>←</span> Back to Explore
      </Link>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-black/[0.02] p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 shrink-0">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}
