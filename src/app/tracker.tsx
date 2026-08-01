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
    try {
      const visitorId = getVisitorId();
      fetch(`${BASE}/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          visitorId,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* never break the page over analytics */
    }
  }, [pathname]);

  return null;
}
