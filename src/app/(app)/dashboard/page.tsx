"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Summary {
  profile: { fullName: string | null; completionPercent: number };
  analysis: { profileStrength: number } | null;
  counts: { documents: number; emails: number; applications: number; matches: number; saved: number };
  upcomingDeadlines: { id: string; stage: string; deadline: string }[];
  unreadNotifications: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>("/dashboard/summary").then(setS).catch(() => {});
  }, []);

  const stats = [
    { label: "Matches", value: s?.counts.matches ?? 0, href: "/matches" },
    { label: "Documents", value: s?.counts.documents ?? 0, href: "/documents" },
    { label: "Emails", value: s?.counts.emails ?? 0, href: "/emails" },
    { label: "Applications", value: s?.counts.applications ?? 0, href: "/tracker" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{s?.profile.fullName ? `, ${s.profile.fullName}` : ""} 👋
        </h1>
        <p className="mt-1 text-muted">{user?.email}</p>
      </div>

      {/* Profile completion */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted">Profile completion</span>
          <span className="gradient-text text-lg font-bold">{s?.profile.completionPercent ?? 0}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.04]">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all" style={{ width: `${s?.profile.completionPercent ?? 0}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted">
          A complete profile gives sharper matches and predictions.{" "}
          <Link href="/profile" className="text-brand hover:underline">Complete it →</Link>
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className="card-hover glass rounded-2xl p-5">
            <div className="text-3xl font-bold">{st.value}</div>
            <div className="mt-1 text-sm text-muted">{st.label}</div>
          </Link>
        ))}
      </div>

      {/* Upcoming deadlines + notifications */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-3 text-base font-semibold">⏰ Upcoming deadlines</h2>
          {s && s.upcomingDeadlines.length > 0 ? (
            <ul className="space-y-2">
              {s.upcomingDeadlines.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{d.stage.replace(/_/g, " ")}</span>
                  <span className="font-medium">{new Date(d.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No upcoming deadlines. Add applications in the tracker.</p>
          )}
        </div>
        <div className="glass flex flex-col justify-between rounded-2xl p-6">
          <div>
            <h2 className="mb-1 text-base font-semibold">🔔 Notifications</h2>
            <p className="text-sm text-muted">
              {s?.unreadNotifications ? `${s.unreadNotifications} unread` : "All caught up"}
            </p>
          </div>
          <Link href="/notifications" className="mt-4 inline-block text-sm text-brand hover:underline">View all →</Link>
        </div>
      </div>

      {/* Actions */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/matches" className="card-hover glass block rounded-2xl p-6">
          <h3 className="text-lg font-semibold">Find your matches</h3>
          <p className="mt-2 text-sm leading-6 text-muted">AI-ranked universities, scholarships and professors.</p>
          <span className="mt-4 inline-block text-sm font-medium text-brand">Run matching →</span>
        </Link>
        <Link href="/assistant" className="card-hover glass block rounded-2xl p-6">
          <h3 className="text-lg font-semibold">AI Application Assistant</h3>
          <p className="mt-2 text-sm leading-6 text-muted">Honest admission &amp; funding chances, plus a roadmap.</p>
          <span className="mt-4 inline-block text-sm font-medium text-brand">Analyze my profile →</span>
        </Link>
      </div>
    </div>
  );
}
