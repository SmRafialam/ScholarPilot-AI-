"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Profile {
  fullName: string | null;
  completionPercent: number;
  targetCountries: string[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api<Profile>("/profile/me").then(setProfile).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{profile?.fullName ? `, ${profile.fullName}` : ""} 👋
        </h1>
        <p className="mt-1 text-muted">{user?.email}</p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted">Profile completion</span>
          <span className="gradient-text text-lg font-bold">
            {profile?.completionPercent ?? 0}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all"
            style={{ width: `${profile?.completionPercent ?? 0}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-muted">
          A complete profile gives sharper matches and predictions.{" "}
          <Link href="/profile" className="text-brand hover:underline">
            Complete it →
          </Link>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ActionCard
          href="/matches"
          title="Find your matches"
          desc="AI-ranked universities, scholarships and professors for your profile."
          cta="Run matching"
        />
        <ActionCard
          href="/assistant"
          title="AI Application Assistant"
          desc="Honest admission & funding chances, plus a roadmap to improve."
          cta="Analyze my profile"
        />
      </div>
    </div>
  );
}

function ActionCard({
  href,
  title,
  desc,
  cta,
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link href={href} className="card-hover glass block rounded-2xl p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
      <span className="mt-4 inline-block text-sm font-medium text-brand">{cta} →</span>
    </Link>
  );
}
