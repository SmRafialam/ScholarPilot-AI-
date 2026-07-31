"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Publication {
  id: string;
  title: string;
  venue: string | null;
  year: number | null;
  link: string | null;
}
interface Professor {
  id: string;
  name: string;
  email: string | null;
  facultyWebsite: string | null;
  googleScholarUrl: string | null;
  acceptingStudents: boolean;
  hasFunding: boolean;
  lab: string | null;
  keywords: string[];
  university: { id: string; name: string } | null;
  department: { name: string } | null;
  publications: Publication[];
  researchAreas: { name: string }[];
}

export default function ProfessorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Professor | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Professor>(`/professors/${id}`)
      .then(setP)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  if (error) return <BackShell><p className="text-sm text-red-500">{error}</p></BackShell>;
  if (!p) return <BackShell><p className="text-muted">Loading…</p></BackShell>;

  return (
    <BackShell>
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">{p.name}</h1>
            {p.university && (
              <Link href={`/universities/${p.university.id}`} className="mt-2 inline-block text-muted hover:text-foreground">
                {p.university.name}
                {p.department ? ` · ${p.department.name}` : ""}
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {p.acceptingStudents ? (
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">Accepting students</span>
            ) : (
              <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs text-muted">Not currently accepting</span>
            )}
            {p.hasFunding && (
              <span className="rounded-full bg-gradient-to-r from-brand/15 to-brand-2/15 px-3 py-1 text-xs font-medium">Funding available</span>
            )}
          </div>
        </div>

        {p.researchAreas.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-muted">Research areas</h2>
            <div className="flex flex-wrap gap-2">
              {p.researchAreas.map((a) => (
                <span key={a.name} className="rounded-full bg-gradient-to-r from-brand/15 to-brand-2/15 px-3 py-1 text-sm">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.keywords.map((k) => (
              <span key={k} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-xs text-muted">#{k}</span>
            ))}
          </div>
        )}

        {p.email && (
          <a href={`mailto:${p.email}`} className="mt-6 inline-block text-sm text-brand hover:underline">
            ✉ {p.email}
          </a>
        )}
      </div>

      {p.publications.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Selected publications</h2>
          <div className="space-y-3">
            {p.publications.map((pub) => (
              <div key={pub.id} className="glass rounded-2xl p-5">
                <h3 className="font-medium">{pub.title}</h3>
                <p className="mt-1 text-sm text-muted">
                  {[pub.venue, pub.year].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
