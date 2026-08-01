"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

/** Stable anonymous per-browser id, stored in localStorage. */
function getVisitorId(): string {
  let id = localStorage.getItem("sp_visitor");
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("sp_visitor", id);
  }
  return id;
}

/** Fires a lightweight, fire-and-forget page-view beacon on every route change. */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    let visitorId: string;
    try {
      visitorId = getVisitorId();
    } catch {
      return; // never break the page over analytics
    }

    const post = (endpoint: string, body: object) =>
      fetch(`${BASE}/analytics/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {});

    // Record the page view.
    post("track", { path: pathname, visitorId, referrer: document.referrer || undefined });

    // Heartbeat: keep this visitor counted as "online" while the tab is open.
    const ping = () => post("ping", { path: pathname, visitorId });
    ping();
    const timer = setInterval(ping, 45_000);
    return () => clearInterval(timer);
  }, [pathname]);

  return null;
}
