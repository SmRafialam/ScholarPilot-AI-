"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/matches", label: "Matches" },
  { href: "/assistant", label: "Assistant" },
  { href: "/documents", label: "Documents" },
  { href: "/emails", label: "Emails" },
  { href: "/tracker", label: "Tracker" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const load = () =>
      api<{ count: number }>("/notifications/unread-count")
        .then((r) => setUnread(r.count))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40">
        <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between gap-2 rounded-2xl px-5 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white">
              S
            </span>
            <span className="hidden text-[15px] font-semibold lg:block">
              ScholarPilot <span className="gradient-text">AI</span>
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
                  pathname === item.href
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/billing"
              className="hidden rounded-lg bg-gradient-to-r from-brand/20 to-brand-2/20 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:from-brand/30 hover:to-brand-2/30 sm:block"
            >
              Upgrade ✨
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-brand to-brand-2 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
