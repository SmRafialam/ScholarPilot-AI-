"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

type Tab = "universities" | "scholarships" | "professors";

interface Country {
  name: string;
  code: string;
}
interface City {
  name: string;
}
interface University {
  id: string;
  name: string;
  qsRanking: number | null;
  tuitionFeeUsd: number | null;
  country: Country | null;
  city: City | null;
}
interface Scholarship {
  id: string;
  name: string;
  provider: string | null;
  fundingType: string;
  country: Country | null;
  university: { name: string } | null;
}
interface Professor {
  id: string;
  name: string;
  acceptingStudents: boolean;
  hasFunding: boolean;
  university: { name: string } | null;
  researchAreas: { name: string }[];
}
interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "universities", label: "Universities", icon: "🎓" },
  { key: "scholarships", label: "Scholarships", icon: "💰" },
  { key: "professors", label: "Professors", icon: "🔬" },
];

// Seeded countries — value is the ISO code the API filters on.
const COUNTRIES: Country[] = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Germany", code: "DE" },
  { name: "Australia", code: "AU" },
  { name: "Netherlands", code: "NL" },
  { name: "Switzerland", code: "CH" },
  { name: "Sweden", code: "SE" },
  { name: "Finland", code: "FI" },
  { name: "Denmark", code: "DK" },
  { name: "Norway", code: "NO" },
  { name: "Ireland", code: "IE" },
  { name: "France", code: "FR" },
  { name: "Belgium", code: "BE" },
  { name: "Italy", code: "IT" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Singapore", code: "SG" },
  { name: "New Zealand", code: "NZ" },
];

const PAGE_SIZES = [24, 48, 96];

const FUNDING_LABEL: Record<string, string> = {
  FULLY_FUNDED: "Fully funded",
  PARTIAL: "Partial",
  TUITION_WAIVER: "Tuition waiver",
  STIPEND: "Stipend",
  TRAVEL_GRANT: "Travel grant",
  OTHER: "Other",
};

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>("universities");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(24);

  // Accumulated results across "Load more" pages.
  const [items, setItems] = useState<unknown[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reqId = useRef(0);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const fetchPage = useCallback(
    async (targetPage: number, replace: boolean) => {
      const mine = ++reqId.current;
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("limit", String(pageSize));
      if (debouncedQ) params.set("q", debouncedQ);
      // Country filter applies to universities & scholarships (by code).
      if (country && tab !== "professors") params.set("country", country);
      // City filter applies to universities only.
      if (city && tab === "universities") params.set("city", city);
      try {
        const res = await api<Paged<unknown>>(`/${tab}?${params.toString()}`);
        if (mine !== reqId.current) return; // stale response — ignore
        setTotal(res.total);
        setPage(res.page);
        setItems((prev) => (replace ? res.data : [...prev, ...res.data]));
      } catch (e) {
        if (mine !== reqId.current) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (mine === reqId.current) setLoading(false);
      }
    },
    [tab, debouncedQ, country, city, pageSize],
  );

  // Load the city list whenever a country is chosen on the universities tab.
  useEffect(() => {
    if (tab !== "universities" || !country) {
      setCities([]);
      return;
    }
    let active = true;
    api<string[]>(`/cities?country=${country}`)
      .then((c) => active && setCities(c))
      .catch(() => active && setCities([]));
    return () => {
      active = false;
    };
  }, [tab, country]);

  // Any filter change → reset to page 1.
  useEffect(() => {
    setItems([]);
    setTotal(0);
    fetchPage(1, true);
  }, [fetchPage]);

  const shown = items.length;
  const hasMore = shown < total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Explore</h1>
        <p className="mt-1 text-sm text-muted">
          Browse every university, scholarship and professor — filter by country and city, and open any one for full details.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              if (t.key === tab) return;
              // Clear immediately so the next render never maps stale items of the
              // previous type (e.g. rendering university rows as professors → crash).
              setItems([]);
              setTotal(0);
              setTab(t.key);
              setCountry("");
              setCity("");
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "btn-gradient text-white"
                : "glass text-muted hover:text-foreground"
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative min-w-[200px] flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${tab}…`}
            className="w-full rounded-xl border border-black/10 bg-black/[0.04] py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-brand-2/60"
          />
        </div>

        {tab !== "professors" && (
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setCity("");
            }}
            className="rounded-xl border border-black/10 bg-black/[0.04] px-3 py-2.5 text-sm outline-none focus:border-brand-2/60"
          >
            <option value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {tab === "universities" && country && cities.length > 0 && (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-black/10 bg-black/[0.04] px-3 py-2.5 text-sm outline-none focus:border-brand-2/60"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-2 text-sm text-muted">
          Show
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-xl border border-black/10 bg-black/[0.04] px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-2/60"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Count */}
      {total > 0 && (
        <p className="text-sm text-muted">
          Showing <span className="font-semibold text-foreground">{shown}</span> of{" "}
          <span className="font-semibold text-foreground">{total}</span> {tab}
        </p>
      )}

      {/* Grid */}
      {tab === "universities" && (
        <Grid>
          {(items as University[]).map((u) => (
            <Link key={u.id} href={`/universities/${u.id}`} className="card-hover glass block rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-tight">{u.name}</h3>
                {u.qsRanking != null && (
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-2 px-2.5 py-1 text-xs font-bold text-white">
                    QS #{u.qsRanking}
                  </span>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <PinIcon />
                {[u.city?.name, u.country?.name].filter(Boolean).join(", ") || "—"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {u.tuitionFeeUsd === 0
                  ? "No tuition fee"
                  : u.tuitionFeeUsd != null
                    ? `Tuition ~$${u.tuitionFeeUsd.toLocaleString()}/yr`
                    : ""}
              </p>
            </Link>
          ))}
        </Grid>
      )}

      {tab === "scholarships" && (
        <Grid>
          {(items as Scholarship[]).map((s) => (
            <Link key={s.id} href={`/scholarships/${s.id}`} className="card-hover glass block rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-tight">{s.name}</h3>
                <span className="shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-2 px-2.5 py-1 text-xs font-bold text-white">
                  {FUNDING_LABEL[s.fundingType] ?? s.fundingType}
                </span>
              </div>
              {s.provider && <p className="mt-2 text-sm text-muted">{s.provider}</p>}
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <PinIcon />
                {s.university?.name ?? s.country?.name ?? "—"}
              </p>
            </Link>
          ))}
        </Grid>
      )}

      {tab === "professors" && (
        <Grid>
          {(items as Professor[]).map((p) => (
            <Link key={p.id} href={`/professors/${p.id}`} className="card-hover glass block rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-tight">{p.name}</h3>
                {p.acceptingStudents && (
                  <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                    Accepting
                  </span>
                )}
              </div>
              {p.university?.name && <p className="mt-2 text-sm text-muted">{p.university.name}</p>}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(p.researchAreas ?? []).slice(0, 3).map((a) => (
                  <span key={a.name} className="rounded-full bg-black/[0.05] px-2 py-0.5 text-xs text-muted">
                    {a.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </Grid>
      )}

      {loading && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted">Loading…</div>
      )}
      {!loading && total === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-muted">No results — try a different search or country.</div>
      )}

      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={() => fetchPage(page + 1, false)}
            className="glass card-hover rounded-xl px-6 py-3 text-sm font-medium"
          >
            Load more ({total - shown} more)
          </button>
        </div>
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5 shrink-0">
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}
