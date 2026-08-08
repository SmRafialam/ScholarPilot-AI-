import Link from "next/link";
import DestinationGallery from "./_destination-gallery";

/* ------------------------------------------------------------------ data */

const COUNTRIES = [
  "USA", "Canada", "Germany", "Australia", "UK", "Italy",
  "Finland", "Sweden", "Norway", "Netherlands", "Ireland", "Denmark",
];

const FEATURES = [
  {
    title: "University Matching",
    desc: "AI ranks the best-fit universities for your profile — filtered by budget, deadlines and eligibility.",
    icon: "M12 3 1 9l11 6 9-4.9V17h2V9M5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8Z",
  },
  {
    title: "Scholarship Finder",
    desc: "Surface scholarships you actually qualify for across all 12 destinations — no more endless searching.",
    icon: "M12 2 3 7v6c0 5 3.8 8.5 9 9 5.2-.5 9-4 9-9V7Zm0 6a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z",
  },
  {
    title: "Professor Matching",
    desc: "Find professors whose research aligns with yours and reach out with confidence.",
    icon: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-4 6c-4 0-8 2-8 5v0h16v0c0-3-4-5-8-5Z",
  },
  {
    title: "Admission & Funding Predictor",
    desc: "Get an honest, transparent estimate of your admission and funding chances — with the reasoning.",
    icon: "M4 20V10m6 10V4m6 16v-7m4 7H2",
  },
  {
    title: "AI Document Studio",
    desc: "Generate tailored SOPs, motivation letters and cold emails to professors in seconds — then edit freely.",
    icon: "M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 10h8M8 17h5",
  },
  {
    title: "CV Analyzer & Advisor",
    desc: "Upload your CV to see gaps against your targets and a prioritized roadmap to boost your chances.",
    icon: "M9 11l3 3 8-8M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9",
  },
];

const STEPS = [
  { n: "01", title: "Build your profile", desc: "Add your academics, test scores, research and preferences." },
  { n: "02", title: "Get matched", desc: "AI matches universities, scholarships and professors instantly." },
  { n: "03", title: "See your chances", desc: "Transparent admission & funding predictions with a breakdown." },
  { n: "04", title: "Generate & apply", desc: "Create SOPs and emails, then track every application to results." },
];

const STATS = [
  { value: "12", label: "Study destinations" },
  { value: "6", label: "AI-powered tools" },
  { value: "100%", label: "Personalized to you" },
  { value: "24/7", label: "Always-on copilot" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: ["Academic profile", "Limited matches", "1 prediction", "1 SOP / month", "Basic tracker"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    highlight: true,
    features: ["Unlimited matches", "Full predictions", "10 documents / month", "CV analyzer", "Deadline reminders"],
    cta: "Go Pro",
  },
  {
    name: "Premium",
    price: "$29",
    period: "/ month",
    highlight: false,
    features: ["Everything in Pro", "Professor matching", "Unlimited documents", "Priority AI", "Improvement roadmap"],
    cta: "Go Premium",
  },
];

const SITE = "https://scholar-pilot-ai-flame.vercel.app";

const FAQS = [
  {
    q: "What is ScholarPilot AI?",
    a: "ScholarPilot AI is an AI copilot for studying abroad. It matches you with the best-fit universities, scholarships and professors, predicts your admission and funding chances, and generates your SOPs, motivation letters and cold emails.",
  },
  {
    q: "Which countries and study destinations does it cover?",
    a: "It covers 12 destinations including the USA, UK, Canada, Germany, Australia, Netherlands, Sweden, Ireland, Finland, Norway, Denmark and Italy.",
  },
  {
    q: "Is ScholarPilot AI free?",
    a: "Yes — you can start free with no card. Paid Pro and Premium plans unlock unlimited matches, more AI documents and professor matching.",
  },
  {
    q: "How does the AI university matching work?",
    a: "It scores universities, scholarships and professors against your academic profile, budget, deadlines and research interests, then explains why each one is a fit.",
  },
  {
    q: "Can ScholarPilot AI write my SOP and emails to professors?",
    a: "Yes. It generates tailored statements of purpose, motivation letters and cold emails grounded on your real profile — which you can freely edit before sending.",
  },
  {
    q: "How accurate are the admission and funding predictions?",
    a: "Predictions are transparent estimates based on your profile strength versus each program's requirements, shown with the reasoning — not a black box.",
  },
];

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "ScholarPilot AI",
      url: SITE,
      logo: `${SITE}/opengraph-image`,
      description: "AI copilot for studying abroad — university, scholarship and professor matching, admission and funding predictions, and AI document generation.",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "ScholarPilot AI",
      url: SITE,
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "ScholarPilot AI",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      url: SITE,
      description: "Match universities, scholarships and professors, predict admission and funding chances, and generate SOPs and emails with AI.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

/* --------------------------------------------------------------- section */

function Icon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

/* ------------------------------------------------------------------ page */

export default function Home() {
  return (
    <div className="relative w-full">
      {/* SEO — structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />

      {/* ===================== NAVBAR ===================== */}
      <header className="fixed top-0 inset-x-0 z-50">
        <nav className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white shadow-lg">
              S
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              ScholarPilot <span className="gradient-text">AI</span>
            </span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-gradient rounded-xl px-4 py-2 text-sm font-medium text-white"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden px-6 pt-40 pb-24">
        <div className="grid-bg absolute inset-0" />
        <div className="glow animate-pulse-glow left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 bg-brand/40" />
        <div className="glow animate-pulse-glow right-10 top-40 h-[300px] w-[300px] bg-accent/30" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-4 py-1.5 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            AI copilot for studying abroad
          </div>

          <h1 className="animate-fade-up text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Your dream university,
            <br />
            <span className="gradient-text">matched by AI.</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
            ScholarPilot AI matches you with the right universities, scholarships and
            professors, predicts your admission and funding chances, and writes your
            SOPs and emails — across 12 study destinations.
          </p>

          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-gradient w-full rounded-xl px-7 py-3.5 text-sm font-medium text-white sm:w-auto">
              Start free — no card needed
            </Link>
            <a href="#how" className="w-full rounded-xl border border-black/10 bg-black/[0.04] px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.06] sm:w-auto">
              See how it works
            </a>
          </div>

          <p className="animate-fade-up mt-5 text-xs text-muted">
            Free to start · 12 countries · Cancel anytime
          </p>
        </div>

        {/* Floating product preview card */}
        <div className="relative z-10 mx-auto mt-16 max-w-4xl">
          <div className="glass animate-float rounded-2xl p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                Your match dashboard
              </div>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
                Profile 82% complete
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <PreviewStat label="Best university match" value="92%" sub="TU Munich · MSc CS" tone="brand" />
              <PreviewStat label="Admission chance" value="74%" sub="Strong profile fit" tone="accent" />
              <PreviewStat label="Funding chance" value="61%" sub="3 scholarships found" tone="success" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== COUNTRY BAR ===================== */}
      <section className="relative border-y border-black/[0.06] bg-black/[0.02] px-6 py-10">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-muted">
          Match across 12 study destinations
        </p>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3">
          {COUNTRIES.map((c) => (
            <span
              key={c}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-4 py-1.5 text-sm text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-brand to-accent" />
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ===================== DESTINATION GALLERY ===================== */}
      <DestinationGallery />

      {/* ===================== FEATURES ===================== */}
      <section id="features" className="relative px-6 py-24">
        <div className="glow left-0 top-1/3 h-[300px] w-[300px] bg-brand-2/20" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need, <span className="gradient-text">in one copilot</span>
            </h2>
            <p className="mt-4 text-muted">
              From discovery to submission — ScholarPilot AI replaces a dozen browser tabs
              and an expensive consultant.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover glass rounded-2xl p-6">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand/20 to-brand-2/20 text-brand-2">
                  <Icon path={f.icon} className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-6 text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section id="how" className="relative px-6 py-24">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              From profile to offer in <span className="gradient-text">four steps</span>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="glass card-hover rounded-2xl p-6">
                <span className="gradient-text text-3xl font-bold">{s.n}</span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="glass grid grid-cols-2 gap-8 rounded-3xl px-8 py-12 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="gradient-text text-4xl font-bold sm:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRICING ===================== */}
      <section id="pricing" className="relative px-6 py-24">
        <div className="glow right-0 top-1/4 h-[320px] w-[320px] bg-accent/20" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto mb-4 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple, <span className="gradient-text">student-friendly</span> pricing
            </h2>
            <p className="mt-4 text-muted">
              A fraction of a $500–$3,000 consultant. Start free, upgrade only if you love it.
            </p>
          </div>
          <p className="mb-12 text-center text-xs text-muted">* Indicative pricing — being finalized.</p>

          <div className="grid gap-6 md:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-7 ${
                  p.highlight
                    ? "border-2 border-brand-2/50 bg-gradient-to-b from-brand/10 to-transparent shadow-2xl"
                    : "glass"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-muted">
                      <Icon path="M20 6 9 17l-5-5" className="h-4 w-4 shrink-0 text-success" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-medium transition-colors ${
                    p.highlight
                      ? "btn-gradient text-white"
                      : "border border-black/10 bg-black/[0.04] text-foreground hover:bg-black/[0.06]"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section id="faq" className="relative px-6 py-24">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="glass rounded-2xl p-5 [&[open]_svg]:rotate-45">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <Icon path="M12 5v14M5 12h14" className="h-5 w-5 shrink-0 text-brand-2 transition-transform" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="relative px-6 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-brand/20 via-brand-2/10 to-accent/20 px-8 py-16 text-center">
          <div className="glow animate-pulse-glow left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 bg-brand-2/30" />
          <div className="relative z-10">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to find <span className="gradient-text">your match?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Join students building smarter study-abroad applications with an AI copilot in their corner.
            </p>
            <Link href="/signup" className="btn-gradient mt-8 inline-block rounded-xl px-8 py-3.5 text-sm font-medium text-white">
              Start free today
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-black/[0.06] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-sm font-bold text-white">
              S
            </span>
            <span className="text-sm font-semibold">
              ScholarPilot <span className="gradient-text">AI</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
            <Link href="/signup" className="hover:text-foreground">Get started</Link>
          </div>
          <p className="text-xs text-muted">© 2026 ScholarPilot AI</p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------- preview stat card */

function PreviewStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "brand" | "accent" | "success";
}) {
  const toneMap = {
    brand: "text-brand",
    accent: "text-accent",
    success: "text-success",
  };
  return (
    <div className="rounded-xl border border-black/10 bg-black/[0.03] p-4 text-left">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${toneMap[tone]}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  );
}
