"use client";

import { useState } from "react";

interface Dest {
  name: string;
  flag: string;
  tag: string;
  src: string;
}

// Iconic city/campus shots (Unsplash). Each tile falls back to a gradient if the
// image fails to load, so it always looks good.
const DESTINATIONS: Dest[] = [
  { name: "United Kingdom", flag: "🇬🇧", tag: "Oxford · London", src: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=70" },
  { name: "United States", flag: "🇺🇸", tag: "MIT · Stanford", src: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=70" },
  { name: "Canada", flag: "🇨🇦", tag: "Toronto · UBC", src: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=70" },
  { name: "Australia", flag: "🇦🇺", tag: "Melbourne · Sydney", src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=70" },
  { name: "Germany", flag: "🇩🇪", tag: "TU Munich · RWTH", src: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=70" },
  { name: "Netherlands", flag: "🇳🇱", tag: "Delft · Amsterdam", src: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=70" },
  { name: "Sweden", flag: "🇸🇪", tag: "KTH · Lund", src: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=70" },
  { name: "Ireland", flag: "🇮🇪", tag: "Trinity · UCD", src: "https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=70" },
];

function Tile({ d, index }: { d: Dest; index: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className="group animate-fade-up relative h-52 overflow-hidden rounded-2xl border border-white/50 shadow-[0_10px_34px_-14px_rgba(120,70,100,0.25)]"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.5)}s` }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={d.src}
          alt={`Study in ${d.name}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-brand/40 via-brand-2/30 to-accent/40" />
      )}

      {/* readability + hover tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-0 bg-brand-2/0 transition-colors duration-300 group-hover:bg-brand-2/10" />

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{d.flag}</span>
          <span className="text-base font-semibold drop-shadow">{d.name}</span>
        </div>
        <div className="mt-0.5 text-xs text-white/80">{d.tag}</div>
      </div>
    </div>
  );
}

export default function DestinationGallery() {
  return (
    <section className="relative px-6 py-24">
      <div className="glow left-1/4 top-1/2 h-[280px] w-[280px] bg-accent/20" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">Where will you study?</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next chapter at the world&apos;s <span className="gradient-text">top destinations</span>
          </h2>
          <p className="mt-4 text-muted">
            From London to Melbourne — explore campuses, scholarships and professors across 12 countries.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((d, i) => (
            <Tile key={d.name} d={d} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
