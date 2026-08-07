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

function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={path} />
    </svg>
  );
}

const toneChip: Record<string, string> = {
  brand: "from-brand/25 to-brand/10 text-brand",
  "brand-2": "from-brand-2/25 to-brand-2/10 text-brand-2",
  accent: "from-accent/30 to-accent/10 text-accent",
  success: "from-success/25 to-success/10 text-success",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>("/dashboard/summary").then(setS).catch(() => {});
  }, []);

  const name = s?.profile.fullName?.split(" ")[0] ?? "";
  const completion = s?.profile.completionPercent ?? 0;
  const greeting = getGreeting();

  const stats = [
    { label: "Matches", value: s?.counts.matches ?? 0, href: "/matches", tone: "brand", icon: "M12 3 1 9l11 6 9-4.9V17h2V9M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8" },
    { label: "Documents", value: s?.counts.documents ?? 0, href: "/documents", tone: "brand-2", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M9 13h6M9 17h4" },
    { label: "Emails", value: s?.counts.emails ?? 0, href: "/emails", tone: "accent", icon: "M4 4h16v16H4Zm0 2 8 6 8-6" },
    { label: "Applications", value: s?.counts.applications ?? 0, href: "/tracker", tone: "success", icon: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" },
  ];

  return (
    <div className="space-y-6">
      {/* ===== Welcome hero ===== */}
      <div className="glass animate-fade-up relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="glow animate-pulse-glow -right-16 -top-16 h-64 w-64 bg-brand-2/25" />
        <div className="glow -bottom-20 left-1/3 h-56 w-56 bg-accent/20" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted">{greeting}</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Welcome{name ? <>, <span className="gradient-text">{name}</span></> : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-muted">{user?.email}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/matches" className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-medium text-white">
                Run AI matching →
              </Link>
              <Link href="/profile" className="rounded-xl border border-black/10 bg-black/[0.04] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.06]">
                {completion < 100 ? "Complete profile" : "View profile"}
              </Link>
            </div>
          </div>
          <ProfileRing percent={completion} />
        </div>
      </div>

      {/* ===== Stat tiles ===== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st, i) => (
          <Link
            key={st.label}
            href={st.href}
            className="card-hover glass animate-fade-up rounded-2xl p-5"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${toneChip[st.tone]}`}>
              <Icon path={st.icon} className="h-5 w-5" />
            </span>
            <div className="mt-4 text-3xl font-bold">{st.value}</div>
            <div className="mt-0.5 text-sm text-muted">{st.label}</div>
          </Link>
        ))}
      </div>

      {/* ===== Deadlines + Notifications ===== */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="glass animate-fade-up rounded-2xl p-6 md:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand/20 to-brand-2/20 text-brand-2">
              <Icon path="M12 8v4l3 3M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" className="h-4 w-4" />
            </span>
            Upcoming deadlines
          </h2>
          {s && s.upcomingDeadlines.length > 0 ? (
            <ul className="space-y-2">
              {s.upcomingDeadlines.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-black/[0.02] px-4 py-3 text-sm">
                  <span className="text-muted">{d.stage.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="font-medium">{new Date(d.deadline).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-muted">
              No upcoming deadlines. <Link href="/tracker" className="text-brand hover:underline">Add applications →</Link>
            </div>
          )}
        </div>

        <div className="glass animate-fade-up flex flex-col justify-between rounded-2xl p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent/25 to-brand/20 text-accent">
                  <Icon path="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" className="h-4 w-4" />
                </span>
                Notifications
              </h2>
              {s?.unreadNotifications ? (
                <span className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-2 py-0.5 text-xs font-bold text-white">{s.unreadNotifications}</span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-muted">
              {s?.unreadNotifications ? `You have ${s.unreadNotifications} unread notification${s.unreadNotifications > 1 ? "s" : ""}.` : "You’re all caught up 🎉"}
            </p>
          </div>
          <Link href="/notifications" className="mt-5 inline-block text-sm font-medium text-brand hover:underline">View all →</Link>
        </div>
      </div>

      {/* ===== Action cards ===== */}
      <div className="grid gap-5 sm:grid-cols-2">
        <ActionCard
          href="/matches"
          title="Find your matches"
          desc="AI-ranked universities, scholarships and professors for your profile."
          cta="Run matching"
          icon="M12 3 1 9l11 6 9-4.9V17h2V9M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8"
        />
        <ActionCard
          href="/assistant"
          title="AI Application Assistant"
          desc="Honest admission & funding chances, plus a step-by-step roadmap."
          cta="Analyze my profile"
          icon="M9.663 17h4.673M12 3v1M18.36 5.64l-.7.7M21 12h-1M4 12H3M6.34 6.34l-.7-.7M12 7a5 5 0 0 0-3 9h6a5 5 0 0 0-3-9Z"
        />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning ☀️";
  if (h < 18) return "Good afternoon 👋";
  return "Good evening 🌙";
}

function ProfileRing({ percent }: { percent: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, percent)) / 100) * circ;
  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(60,40,56,0.08)" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2694f" />
            <stop offset="100%" stopColor="#a06bf0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="gradient-text text-2xl font-bold">{percent}%</div>
        <div className="text-[10px] uppercase tracking-wide text-muted">complete</div>
      </div>
    </div>
  );
}

function ActionCard({ href, title, desc, cta, icon }: { href: string; title: string; desc: string; cta: string; icon: string }) {
  return (
    <Link href={href} className="card-hover glass animate-fade-up group relative block overflow-hidden rounded-2xl p-6">
      <div className="glow -right-10 -top-10 h-32 w-32 bg-brand-2/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative z-10 mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-lg">
        <Icon path={icon} className="h-5 w-5" />
      </span>
      <h3 className="relative z-10 text-lg font-semibold">{title}</h3>
      <p className="relative z-10 mt-2 text-sm leading-6 text-muted">{desc}</p>
      <span className="relative z-10 mt-4 inline-block text-sm font-medium text-brand">{cta} →</span>
    </Link>
  );
}
