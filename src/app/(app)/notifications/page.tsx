"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Notif {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_STYLE: Record<string, string> = {
  MATCH: "bg-brand/15 text-brand",
  STATUS: "bg-accent/15 text-accent",
  DEADLINE: "bg-amber-500/15 text-amber-400",
  SYSTEM: "bg-white/10 text-muted",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await api<{ data: Notif[] }>("/notifications?limit=50");
    setItems(res.data);
    setLoading(false);
  }
  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    await load();
  }
  async function markAll() {
    await api("/notifications/read-all", { method: "PATCH" });
    await load();
  }
  async function remove(id: string) {
    await api(`/notifications/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {items.some((n) => !n.read) && (
          <button onClick={markAll} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-muted hover:text-foreground">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted">You&apos;re all caught up 🎉</div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`glass flex items-start gap-3 rounded-xl p-4 ${n.read ? "opacity-60" : ""}`}>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-brand to-brand-2" />}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[n.type] ?? "bg-white/10 text-muted"}`}>{n.type}</span>
                  <span className="font-medium">{n.title}</span>
                </div>
                {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!n.read && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-brand hover:underline">Mark read</button>
                )}
                <button onClick={() => remove(n.id)} className="text-muted hover:text-red-400">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
