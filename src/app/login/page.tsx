"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSlow(false);
    // The free backend may be waking from sleep — tell the user instead of hanging.
    const t = setTimeout(() => setSlow(true), 4000);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      clearTimeout(t);
      setLoading(false);
      setSlow(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="glow animate-pulse-glow left-1/2 top-1/4 h-[400px] w-[500px] -translate-x-1/2 bg-brand/30" />
      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8">
        <Link href="/" className="mb-6 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white">
            S
          </span>
          <span className="text-sm font-semibold">
            ScholarPilot <span className="gradient-text">AI</span>
          </span>
        </Link>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to continue your journey.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {slow && (
            <p className="rounded-xl border border-brand-2/30 bg-brand-2/10 px-3 py-2 text-xs text-muted">
              ⏳ Waking up the server (free tier) — the first request can take up to ~40s. Hang tight…
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          No account?{" "}
          <Link href="/signup" className="text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-2/60"
      />
    </label>
  );
}
