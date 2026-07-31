"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  fundingType: string;
  coverage: string | null;
  benefits: string[];
  deadline: string | null;
  applicationLink: string | null;
  description: string | null;
  country: { name: string } | null;
  university: { id: string; name: string } | null;
  eligibility: {
    minCgpa: number | null;
    minIelts: number | null;
    degreeLevels: string[];
    eligibleCountries: string[];
  } | null;
  requirements: { id: string; document: string; mandatory: boolean }[];
}

const FUNDING_LABEL: Record<string, string> = {
  FULLY_FUNDED: "Fully funded",
  PARTIAL: "Partial",
  TUITION_WAIVER: "Tuition waiver",
  STIPEND: "Stipend",
  TRAVEL_GRANT: "Travel grant",
  OTHER: "Other",
};

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<Scholarship | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Scholarship>(`/scholarships/${id}`)
      .then(setS)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  if (error) return <BackShell><p className="text-sm text-red-500">{error}</p></BackShell>;
  if (!s) return <BackShell><p className="text-muted">Loading…</p></BackShell>;

  return (
    <BackShell>
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{s.name}</h1>
            {s.provider && <p className="mt-2 text-muted">{s.provider}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <PinIcon />
              {s.university?.name ?? s.country?.name ?? "—"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-2 px-3 py-1.5 text-sm font-bold text-white">
            {FUNDING_LABEL[s.fundingType] ?? s.fundingType}
          </span>
        </div>

        {s.coverage && (
          <p className="mt-5 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm">{s.coverage}</p>
        )}

        {s.benefits.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">Benefits</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {s.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <span className="text-success">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {s.eligibility && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">Eligibility</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              {s.eligibility.minCgpa != null && <Chip>Min CGPA {s.eligibility.minCgpa}</Chip>}
              {s.eligibility.minIelts != null && <Chip>Min IELTS {s.eligibility.minIelts}</Chip>}
              {s.eligibility.degreeLevels.map((d) => (
                <Chip key={d}>{d}</Chip>
              ))}
            </div>
          </div>
        )}

        {s.university && (
          <Link href={`/universities/${s.university.id}`} className="mt-6 inline-block text-sm text-brand hover:underline">
            View {s.university.name} →
          </Link>
        )}
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

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-black/[0.05] px-3 py-1">{children}</span>;
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5 shrink-0">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}
