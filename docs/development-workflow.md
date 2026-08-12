# Development Workflow

## 1. Overview

This document defines how the team works overnight to ship the MVP: repo structure, environment setup, branching, task split, and the build order that keeps the demo safe even if later steps run out of time.

---

## 2. Repository Structure

```text
hackathon_project/
├── AGENTS.md                 # instructions for AI coding agents working in this repo
├── README.md
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── database.md
│   ├── api-contract.md
│   ├── ai-rag.md
│   ├── ui-design.md
│   ├── development-workflow.md
│   └── stitch/                # design references / exports
├── supabase/
│   ├── migrations/            # SQL migrations (tables, RLS, functions)
│   ├── functions/             # Edge Functions (TypeScript)
│   │   ├── complete-profile/
│   │   ├── embed-learner-profile/
│   │   ├── embed-provider-profile/
│   │   ├── upsert-opportunity/
│   │   ├── search-opportunities/
│   │   ├── match-opportunities/
│   │   ├── rag-ask/
│   │   ├── admin-upsert-knowledge/
│   │   ├── admin-verify-provider/
│   │   ├── create-booking/
│   │   ├── respond-booking/
│   │   ├── create-sponsorship/
│   │   └── impact-summary/
│   ├── seed.sql                # demo seed data
│   └── config.toml
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── lib/                # supabase client, api helpers
    │   ├── hooks/
    │   ├── types/
    │   └── App.tsx
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

Note: `frontend/` and `supabase/` are separate top-level projects (not nested inside `src/`). Run frontend commands from inside `frontend/`, and Supabase CLI commands from inside `supabase/` (or repo root, depending on how `supabase/config.toml` was initialized).

---

## 3. Environment Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`.env.example` (inside `frontend/`):

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Supabase

```bash
cd supabase
supabase start
supabase db reset          # applies migrations + seed.sql locally
```

Secrets for Edge Functions (never in frontend `.env`):

```bash
supabase secrets set LLM_API_KEY=xxx EMBEDDING_API_KEY=xxx LLM_API_URL=xxx EMBEDDING_API_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## 4. Branching Strategy (lightweight, hackathon-appropriate)

- `main` — always demo-able. Only merge working code.
- `dev` — integration branch, merged into `main` at each stable checkpoint.
- Feature branches: `feat/<area>`, e.g. `feat/auth`, `feat/matching`, `feat/rag`, `feat/booking`, `feat/sponsorship`, `feat/admin-dashboard`.

Given the time constraint, prefer small, frequent merges to `dev` over long-lived branches. Tag a commit as a fallback checkpoint before starting any risky change (e.g. `git tag checkpoint-mvp-core`).

---

## 5. Suggested Team Split

| Track | Scope | Primary folder(s) |
|---|---|---|
| **Backend/DB** | Supabase schema + migrations, RLS policies, seed data | `supabase/migrations/`, `supabase/seed.sql` |
| **AI** | Embedding helper, `match-opportunities`, `rag-ask`, knowledge base seeding | `supabase/functions/` |
| **Frontend — Learner/Provider** | Auth flow, profiles, discovery, opportunity CRUD, bookings | `frontend/src/pages/`, `frontend/src/components/` |
| **Frontend — Sponsor/Admin + Dashboard** | Sponsorship flow, admin screens, impact dashboard, RAG assistant UI | `frontend/src/pages/`, `frontend/src/components/` |

Adjust based on actual headcount — the split above assumes 4 people; collapse tracks if the team is smaller.

---

## 6. Build Order (priority-ordered for overnight demo safety)

Build in this order so that if time runs out, what exists is still demo-able:

1. **Supabase project + schema + RLS** (`database.md`, `supabase/migrations/`) — foundation, blocks everything else.
2. **Auth + role-based profiles** (learner, provider signup/login, `complete-profile` function).
3. **Opportunity CRUD** (provider create/edit, learner browse/search) — core value without AI.
4. **Booking flow** (create/accept/reject) — completes the core loop.
5. **Seed data** (`supabase/seed.sql`: providers, opportunities, knowledge base entries) — needed before AI features are demo-able.
6. **AI Matching** (`embed-*`, `match-opportunities`) — first AI layer, builds on step 3.
7. **RAG Assistant** (`admin-upsert-knowledge`, `rag-ask`) — second AI layer, independent of matching.
8. **Sponsorship flow** — secondary mechanism, build after core + AI are stable.
9. **Admin dashboard + impact metrics** — polish layer, last priority.
10. **UI polish pass** — spacing, empty states, loading states, AI tags — only after all flows work end-to-end.

If time runs critically short, steps 8–10 can be cut or stubbed without breaking the core pitch (problem → solution → AI matching → RAG → impact).

---

## 7. Testing Approach (MVP-scope)

No formal test suite required overnight. Instead:

- Manual smoke test after each merge to `dev`: signup as each role, create an opportunity, run a match, ask the RAG assistant one question, create a booking.
- Keep a running checklist of the "golden path" demo script and re-run it before each checkpoint tag.
- Test each Edge Function via `supabase functions serve <name>` + `curl`, or the Supabase Studio function invoker, before wiring into the frontend, to isolate backend vs frontend bugs quickly.

---

## 8. AGENTS.md Guidance

Since the repo includes an `AGENTS.md` at the root, keep it updated with:

- The folder structure above (so an AI agent doesn't assume a merged `src/` layout).
- Where secrets/env files live and that they must never be committed.
- The build order in §6, so an agent prioritizes correctly if asked to "continue the build."
- A pointer to `docs/` as the source of truth for schema, API contract, and AI design — agents should read those before generating code, not guess.

---

## 9. Demo-Day Checklist

- [ ] Seed data loaded (providers, opportunities, knowledge base — all verified/active)
- [ ] At least one full learner journey works end-to-end (search → AI match → book)
- [ ] RAG assistant answers the A/L ICT budget example correctly with sources
- [ ] Sponsorship flow creates a record (even without real payment)
- [ ] Admin impact dashboard shows non-zero, real numbers from seed data
- [ ] `main` branch tagged and deployed/runnable without last-minute git surprises
- [ ] Presentation deck matches what's actually built (no claiming unimplemented features)

---

## 10. Notes

- Keep Edge Functions thin — validate input, call the shared embedding/vector-search/LLM helpers, return a consistent response shape (see `api-contract.md` §2).
- Avoid premature optimization (caching, rate limiting, advanced RLS edge cases) — correctness and a working demo path matter more than robustness for this scope.
- Commit `docs/` alongside code so the final repo tells a coherent story if judges look at it.