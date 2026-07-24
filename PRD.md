# ScholarPilot AI — Product Requirements Document (PRD)

**Version:** 1.0
**Status:** Draft for approval
**Date:** 2026-07-25
**Owner:** Product / CTO
**Document type:** Product Requirements Document

---

## 0. Document Purpose

This PRD defines *what* ScholarPilot AI is, *who* it serves, and *what* it must do — before any code is written. It is the single source of truth for scope, priorities, and success criteria. Engineering architecture is covered in `ARCHITECTURE.md`; this document focuses on product.

---

## 1. Problem Statement

Applying for higher studies abroad (Master's / PhD) is **fragmented, expensive, and intimidating** — especially for students from developing countries.

Today a student must, largely manually:

- Search hundreds of universities across many countries, each with different requirements
- Hunt for scholarships across scattered, poorly-indexed sources
- Find and cold-email professors whose research matches theirs
- Guess their real chance of admission and funding
- Write SOPs, motivation letters, and emails with little feedback
- Track dozens of deadlines and application states across spreadsheets and email

**The consequences:**

- Students apply to the *wrong* universities (too ambitious or too safe), wasting application fees.
- Strong candidates miss scholarships they were eligible for simply because they never found them.
- Weak documents (SOP/email) sink otherwise-qualified applicants.
- Professional consultancies charge **$500–$3,000+** per student — out of reach for most.

**The gap:** There is no affordable, data-driven, AI-powered platform that takes a student's profile and returns a *personalized, honest, actionable* roadmap — matching, prediction, document generation, and tracking in one place.

**ScholarPilot AI closes this gap.**

---

## 2. Target Users

### Primary Persona — "Ambitious Applicant"
- Undergraduate final-year or recent graduate (age 21–27)
- From South Asia, Africa, Middle East, Southeast Asia (initial focus)
- Targets Master's/PhD in USA, Canada, Europe, Australia
- Budget-conscious; needs funding/scholarships
- Tech-comfortable, mobile-first
- **Pain:** overwhelmed, can't afford a consultant, afraid of wasting fees

### Secondary Persona — "Research-Track PhD Seeker"
- Wants professor/lab matching and cold-email help
- Needs funding (assistantships, scholarships)
- Values research-fit accuracy over volume

### Tertiary Persona — "Working Professional Upskiller"
- 1–5 years experience, wants a funded Master's abroad
- Time-poor, willing to pay for automation

### Internal Users
- **Admin / Content team** — maintains the knowledge base, reviews data quality
- **Counselor (future B2B)** — agencies managing many students

### Target Countries (v1)
USA · Canada · Germany · Australia · UK · Italy · Finland · Sweden · Norway · Netherlands · Ireland · Denmark

---

## 3. Business Goals

| # | Goal | Why it matters |
|---|---|---|
| G1 | Reduce a student's research + application-prep time by **70%** | Core value proposition |
| G2 | Reach **10,000 registered users** within 12 months of launch | Market validation |
| G3 | Convert **5%+ of active users to paid** | Revenue viability |
| G4 | Maintain a **fresh, accurate knowledge base** (≥95% valid data) | Product credibility |
| G5 | Keep **AI cost per active user** below a defined margin threshold | Unit economics |
| G6 | Build a **defensible data moat** (structured university/scholarship/professor data) | Long-term advantage |

**North Star Metric:** *Number of quality applications submitted through the platform.*

---

## 4. Features

Features are grouped by module (see `ARCHITECTURE.md`) and tagged with priority: **P0** = MVP must-have, **P1** = fast-follow, **P2** = later.

### 4.1 Account & Profile
| Feature | Priority |
|---|---|
| Email + Google signup/login | P0 |
| Academic profile builder (degree, GPA, tests, research, preferences) | P0 |
| CV upload + parsing | P1 |
| Profile completeness meter | P1 |

### 4.2 Knowledge Base (the data engine)
| Feature | Priority |
|---|---|
| Automated scraping pipeline (ToS-aware) for universities, programs, scholarships, professors | P0 |
| Data validation + freshness re-checks | P0 |
| Admin review/override of scraped data | P0 |
| Semantic embeddings for matching | P0 |

### 4.3 Matching
| Feature | Priority |
|---|---|
| University matching (hard filters + semantic + AI re-rank) | P0 |
| Scholarship matching | P0 |
| Professor matching (research-fit) | P1 |
| "Why matched" explanation per result | P0 |

### 4.4 Prediction
| Feature | Priority |
|---|---|
| Admission chance % with breakdown | P0 (rule-based) |
| Funding chance % with breakdown | P1 |
| Transparent factor explanation | P0 |

### 4.5 AI Document Generation
| Feature | Priority |
|---|---|
| SOP generator (profile + target aware) | P1 |
| Cold email to professor | P1 |
| Motivation letter generator | P1 |
| Version history + regenerate + edit | P1 |

### 4.6 CV & Improvement
| Feature | Priority |
|---|---|
| CV analyzer (gap vs target) | P1 |
| Profile improvement roadmap ("do X → chance rises Y%") | P1 |

### 4.7 Application Management
| Feature | Priority |
|---|---|
| Application tracker (Kanban stages) | P1 |
| Deadline reminders | P1 |
| In-app + email notifications | P1 |

### 4.8 Monetization & Admin
| Feature | Priority |
|---|---|
| Subscription tiers + usage limits | P1 |
| Payment integration (Stripe/Paddle) | P1 |
| Admin dashboard (data + users + analytics) | P0 (basic) |

---

## 5. User Journey

```
Discover → Sign up → Build profile → (Upload CV)
    │
    ▼
See MATCHES (universities + scholarships + professors)
    │  each with fit score + "why matched"
    ▼
See PREDICTIONS (admission % + funding %) with honest breakdown
    │
    ▼
Get IMPROVEMENT roadmap ("raise IELTS 0.5 → +12% chance")
    │
    ▼
Shortlist targets → GENERATE documents (SOP / email / letter)
    │  edit → regenerate → finalize
    ▼
Add to TRACKER → deadlines + reminders
    │
    ▼
Apply → update status → receive results → (celebrate / iterate)
```

**Emotional arc we design for:** *Overwhelmed → Oriented → Confident → In-control.*

---

## 6. Admin Journey

```
Admin login (role-gated)
    │
    ▼
KNOWLEDGE BASE management
    ├── Review newly scraped universities/scholarships/professors
    ├── Approve / edit / reject entries
    ├── Trigger or schedule re-scrapes
    └── Flag stale or invalid data
    │
    ▼
USER & USAGE analytics
    ├── Signups, active users, conversions
    ├── Feature usage (matches run, docs generated)
    └── AI cost monitoring
    │
    ▼
QUALITY & MODERATION
    ├── Review flagged AI outputs
    ├── Manage prompt templates / versions
    └── Handle support / data-correction requests
```

Admin quality control is **mandatory** because the product's credibility depends on accurate data. Scraped data is *never* shown to students without passing validation (auto + spot-check).

---

## 7. AI Features (detailed)

All AI runs through a central **AI Orchestrator** using the Claude API, with a **RAG (Retrieval-Augmented Generation)** pattern so the model reasons over *verified knowledge-base data*, not memory.

| AI Feature | What it does | Guardrail |
|---|---|---|
| **Match re-ranking** | Scores nuanced fit between profile & top candidates | Only ranks KB-retrieved items |
| **Match explanation** | Human-readable "why this fits you" | Grounded in retrieved data |
| **Admission/funding reasoning** | Explains score factors in plain language | Deterministic score + AI narration |
| **SOP generation** | Tailored draft from profile + target | User must review/edit before use |
| **Cold email** | Personalized professor outreach | Never auto-sends; user sends |
| **Motivation letter** | Country/program-appropriate | Templated + editable |
| **CV analysis** | Parses + finds gaps vs requirements | Suggestions, not guarantees |
| **Improvement advisor** | Prioritized, quantified action roadmap | Transparent assumptions |

**AI principles:**
1. **Grounded, not hallucinated** — factual claims come from the knowledge base.
2. **Honest** — predictions never inflate chances to please the user.
3. **Human-in-the-loop** — nothing consequential (emails, submissions) auto-executes.
4. **Cost-aware** — model routing (cheaper model for simple tasks, premium for complex reasoning), caching, token tracking.

---

## 8. Future Roadmap

| Horizon | Item |
|---|---|
| **Q1 post-launch** | Professor matching GA, CV analyzer, document generation GA |
| **Q2** | Application tracker + notifications, billing tiers live |
| **Q3** | Mobile app (React Native), more countries (Japan, S. Korea, France) |
| **Q4** | ML prediction model trained on real admission outcomes |
| **Year 2** | Counselor/agency B2B dashboard, AI interview prep, university-partnership API, multi-language UI (Bangla/Hindi), auto-submission integrations |

---

## 9. Database Requirements

**Primary store:** PostgreSQL 16 (relational + JSONB + pgvector).

**Core entities:**
- `users`, `profiles`
- `universities`, `programs`, `scholarships`, `professors` (each with embedding vectors)
- `matches`, `predictions`
- `documents`, `applications`, `notifications`
- `subscriptions`, `ai_logs`
- `scrape_jobs`, `data_sources`, `review_queue` (knowledge-base ops)

**Requirements:**
- JSONB for variable-shape data (requirements differ per country/university)
- `pgvector` for semantic search (start), migratable to Pinecone at scale
- Full audit trail on knowledge-base edits (who/when/what)
- Soft-deletes for user data (compliance)
- Indexed on country, deadline, GPA/test thresholds for fast filtering

**Data retention & privacy:**
- Student PII encrypted at rest
- Right-to-delete (GDPR-aligned) — critical for EU target countries
- CVs/documents in object storage (S3/R2), not the DB

---

## 10. API Requirements

**Style:** RESTful JSON over HTTPS; WebSocket for real-time notifications.

**Representative endpoints (illustrative):**

```
POST   /auth/signup            POST  /auth/login          POST /auth/refresh
GET    /profile                PUT   /profile             POST /profile/cv
POST   /match/run              GET   /match/results
GET    /predictions/:targetId
POST   /documents             GET   /documents/:id       PUT  /documents/:id
GET    /applications          POST  /applications        PUT  /applications/:id
GET    /notifications         WS    /ws/notifications

# Admin
GET    /admin/review-queue    POST  /admin/data/:id/approve
POST   /admin/scrape/trigger  GET   /admin/analytics
```

**Cross-cutting requirements:**
- JWT auth + role-based access control (RBAC)
- Request validation on every endpoint (schema-level)
- Rate limiting (per user + per IP), stricter on AI endpoints
- Idempotency keys for write operations
- Pagination + filtering on list endpoints
- Consistent error envelope + correlation IDs
- Versioned API (`/v1/...`)
- Async pattern for long jobs (matching, scraping) → job id + status polling / webhook

---

## 11. Security

| Area | Requirement |
|---|---|
| **Auth** | JWT + refresh rotation, secure password hashing (bcrypt/argon2), OAuth |
| **Authorization** | RBAC; students can only access own data; admin gated |
| **Transport** | TLS everywhere; HSTS |
| **Data at rest** | Encrypted PII; secrets in a vault, never in code/repo |
| **Input safety** | Validation + sanitization; SQL-injection safe (ORM/parameterized) |
| **AI safety** | Prompt-injection defenses; untrusted scraped/user content treated as data, never instructions; output filtering |
| **Scraping** | Respect robots.txt/ToS; rate-limit; no unauthorized personal data harvesting; store only publicly-listed professor contact info with clear opt-out |
| **Compliance** | GDPR-aligned (EU countries in scope): consent, data export, right-to-delete |
| **Payments** | PCI handled by provider (Stripe/Paddle); no card data on our servers |
| **Monitoring** | Audit logs, anomaly alerts, dependency scanning |

> **Legal note:** Automated scraping must be reviewed for each source's terms and local law. Professor contact data is sensitive — outreach features must include opt-out handling and comply with anti-spam regulations (CAN-SPAM, GDPR). This is a product-risk item flagged for legal review before scaling.

---

## 12. Performance

| Metric | Target |
|---|---|
| Page load (web, cached) | < 2s |
| API p95 latency (non-AI) | < 400ms |
| Match run (async) | Result within 10–30s, non-blocking |
| AI document generation | Streamed; first token < 3s |
| Scraping jobs | Background only; never block user requests |
| Uptime | 99.5%+ (MVP), 99.9% (scale) |
| Concurrent users (MVP target) | 1,000 simultaneous |

**Strategy:** stateless horizontally-scalable API, background queue for heavy work, read replicas, multi-layer caching (Redis + response cache + prompt cache), CDN for static assets.

---

## 13. Success Metrics

### Acquisition & Activation
- Signups; **profile completion rate** (target ≥ 60%)
- Time-to-first-match (target < 5 min from signup)

### Engagement
- Weekly active users
- Matches run per user; documents generated per user
- Applications tracked per user

### Value / Outcome
- **North Star:** applications submitted via platform
- Self-reported admissions / scholarships won
- % users who say chances were "clearer" (survey)

### Business
- Free → paid conversion (target ≥ 5%)
- MRR, churn, LTV : CAC
- **AI cost per active user** (must stay under margin threshold)

### Quality
- Knowledge-base data validity (≥ 95%)
- AI output accuracy (spot-check pass rate)
- Support tickets per 100 users

---

## 14. Pricing Strategy

**Model:** Freemium SaaS with usage-based limits. Deliberately far cheaper than $500–$3,000 consultants — that affordability *is* the market position.

| Tier | Price (indicative) | Includes |
|---|---|---|
| **Free** | $0 | Profile, limited matches, 1 prediction, 1 SOP/month, basic tracker |
| **Pro** | ~$9–15 / mo | Unlimited matches, full predictions, 10 documents/mo, CV analyzer, reminders |
| **Premium** | ~$25–40 / mo | Everything + professor matching, unlimited documents, priority AI, improvement roadmap |
| **One-time "Application Pack"** | ~$29–49 | For students who want a burst, not a subscription (season-based) |
| **B2B / Agency (future)** | Custom | Counselor dashboard, multi-student management |

**Pricing principles:**
- Free tier must deliver a real "aha" (see matches + one prediction) to drive conversion.
- Usage limits align cost (AI tokens) with revenue.
- Regional pricing (PPP-adjusted) for South Asia/Africa to maximize reach.
- Seasonal one-time pack captures students who won't commit to a subscription.

> Final prices to be validated with market testing before launch. Figures above are planning placeholders, not commitments.

---

## 15. Out of Scope (v1)

- Visa application processing
- Direct application submission to universities
- Financial/loan services
- Human counselor marketplace
- Guaranteed-admission claims (we provide guidance, never guarantees)

---

## 16. Open Questions / Risks

| # | Item | Owner |
|---|---|---|
| R1 | Legal review of scraping per-source & professor-contact usage | Legal |
| R2 | MVP scope not yet locked (pending your input) | Product |
| R3 | AI cost per user at scale — needs modeling | Eng/Finance |
| R4 | Knowledge-base data freshness at scale | Data team |
| R5 | Prediction accuracy without historical outcome data (cold start) | Data/ML |

---

*End of PRD v1.0 — pending your review and approval.*
