"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/explore", label: "Explore" },
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    setMenuOpen(false); // close mobile menu on route change
  }, [pathname]);

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

  const linkClass = (href: string, extra = "") =>
    `whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
      pathname === href ? "bg-black/[0.06] text-foreground" : "text-muted hover:text-foreground"
    } ${extra}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40">
        <nav className="glass mx-auto mt-4 max-w-6xl rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white">
                S
              </span>
              <span className="text-[15px] font-semibold">
                ScholarPilot <span className="gradient-text">AI</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden flex-1 items-center justify-center gap-1 text-sm lg:flex">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/billing"
                className="hidden rounded-lg bg-gradient-to-r from-brand/20 to-brand-2/20 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:from-brand/30 hover:to-brand-2/30 lg:block"
              >
                Upgrade ✨
              </Link>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-muted transition-colors hover:text-foreground"
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
              {/* Desktop logout */}
              <button
                onClick={logout}
                className="hidden rounded-lg border border-black/10 px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground lg:block"
              >
                Log out
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
                className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-muted lg:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-[18px] w-[18px]">
                  {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div className="mt-3 flex flex-col gap-1 border-t border-black/10 pt-3 text-sm lg:hidden">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/billing" className={linkClass("/billing", "font-medium")}>
                Upgrade ✨
              </Link>
              <button
                onClick={logout}
                className="mt-1 rounded-lg border border-black/10 px-3 py-2 text-left text-muted hover:text-foreground"
              >
                Log out
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-6">{children}</main>
    </div>
  );
}
