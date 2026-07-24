# ScholarPilot AI — Frontend

> Your AI copilot for studying abroad — match universities, scholarships & professors, predict admission & funding chances, and generate SOPs, emails and motivation letters. Across 12 study destinations.

This repository contains the **student-facing web application** (Next.js). The backend API and admin dashboard live in a separate repository: [`ScholarPilot-AI-Backend`](https://github.com/SmRafialam/ScholarPilot-AI-Backend).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Runtime | React 19 |

All open-source — no paid tooling required.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3100](http://localhost:3100) (the dev script runs on port `3100`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

## Project Structure

```
src/
  app/
    layout.tsx     # Root layout, fonts, metadata
    page.tsx       # Landing page
    globals.css    # Design system (Tailwind v4 tokens, animations)
```

## Product Docs

- [`PRD.md`](./PRD.md) — full Product Requirements Document

## Roadmap (frontend)

- [x] Landing page
- [ ] Auth (signup / login)
- [ ] Student profile builder
- [ ] Match dashboard (universities · scholarships · professors)
- [ ] Prediction views
- [ ] AI Document Studio
- [ ] Application tracker

---

© 2026 ScholarPilot AI
