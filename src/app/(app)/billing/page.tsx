"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Plan {
  tier: string;
  name: string;
  priceUsd: number;
  interval: string;
  features: string[];
}
interface Subscription {
  tier: string;
  status: string;
  plan: Plan;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api<Plan[]>("/billing/plans").then(setPlans).catch(() => {});
    api<Subscription>("/billing/subscription").then(setSub).catch(() => {});
  }, []);

  async function upgrade(tier: string) {
    setBusy(tier);
    setMsg("");
    try {
      const res = await api<{ configured: boolean; message: string }>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ tier }),
      });
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Plans &amp; Billing</h1>
        <p className="mt-1 text-sm text-muted">
          You&apos;re on the{" "}
          <span className="gradient-text font-semibold">{sub?.plan.name ?? "Free"}</span> plan.
          A fraction of a $500–$3,000 consultant.
        </p>
      </div>

      {msg && (
        <div className="glass rounded-xl border border-brand-2/30 p-4 text-sm text-muted">{msg}</div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = sub?.tier === p.tier;
          const highlight = p.tier === "PRO";
          return (
            <div
              key={p.tier}
              className={`relative rounded-2xl p-7 ${
                highlight ? "border-2 border-brand-2/50 bg-gradient-to-b from-brand/10 to-transparent" : "glass"
              }`}
            >
              {highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${p.priceUsd}</span>
                <span className="text-sm text-muted">/ {p.interval}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-success"><path d="M20 6 9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="mt-8 rounded-xl border border-black/10 bg-black/[0.04] py-3 text-center text-sm text-muted">
                  Current plan
                </div>
              ) : p.tier === "FREE" ? (
                <div className="mt-8 rounded-xl py-3 text-center text-sm text-muted">—</div>
              ) : (
                <button
                  onClick={() => upgrade(p.tier)}
                  disabled={busy === p.tier}
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-medium disabled:opacity-60 ${
                    highlight ? "btn-gradient text-white" : "border border-black/10 bg-black/[0.04] text-foreground hover:bg-black/[0.06]"
                  }`}
                >
                  {busy === p.tier ? "…" : `Upgrade to ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
