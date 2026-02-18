# AI Coach Project Brief (Template + 672 Elm Street Baseline)

This document provides:
1. A reusable template for capturing consistent project context for your AI coach.
2. A filled baseline snapshot for the **672 Elm Street** project.

---

## 1) Reusable Template (copy for any project)

> Suggested filename pattern: `docs/AI_COACH_BRIEF_<project-name>.md`

### Project Snapshot
- **Project name:**
- **Primary domain / deployment URL:**
- **Owner / team:**
- **One-sentence mission:**
- **Current phase:** (discovery, build, hardening, launch, maintenance)
- **Last updated:**

### Project Description
- **Business purpose:**
- **Primary users:**
- **Core workflows:**
- **In-scope capabilities:**
- **Out-of-scope (explicitly):**

### Major Technologies
- **Frontend:**
- **Backend/API:**
- **Database/ORM:**
- **Infrastructure/hosting:**
- **Auth/security dependencies:**
- **AI/ML integrations:**
- **3rd-party APIs/services:**
- **Testing/tooling:**

### Architecture & Runtime Model
- **Monolith vs. distributed:**
- **Data flow (high-level):**
- **Key system boundaries:**
- **Critical background jobs / sync loops:**
- **Known performance hotspots:**

### File Structure (High-Value Map)
- **Top-level directories and purpose:**
  - `client/`:
  - `server/`:
  - `shared/`:
  - `database/`:
  - `docs/`:
  - `assets/`:
  - `e2e/`:
- **Files AI should read first:**
- **Files AI should edit cautiously:**
- **Generated or reference-only areas:**

### API & Data Contracts
- **Key API routes/endpoints:**
- **Primary tables/entities:**
- **Validation/schema source of truth:**
- **Backward compatibility constraints:**

### Configuration & Secrets
- **Required environment variables:**
- **Optional environment variables:**
- **Secrets that must never be exposed client-side:**
- **Non-production-only variables:**

### Security Status
- **Current status:** (green / yellow / red)
- **Secret management posture:**
- **AuthN/AuthZ posture:**
- **Data protection posture (PII/financial data):**
- **3rd-party risk summary:**
- **Recent incidents or unresolved concerns:**
- **Immediate mitigations needed:**

### Quality Status
- **Build health:**
- **Typecheck/lint health:**
- **Automated test coverage summary:**
- **Manual smoke-test checklist:**

### Operational Runbook (AI Quick Actions)
- **Install:**
- **Run dev server:**
- **Run checks/tests:**
- **Build/production command:**
- **Database migration/push command:**
- **Health check endpoints:**

### Product Context for AI Coach
- **Terminology glossary:**
- **High-priority constraints:**
- **Decision log pointers:**
- **What “good” output looks like in this repo:**

### Current Priorities
- **Priority #1:**
- **Priority #2:**
- **Priority #3:**

### Next Steps
- [ ]
- [ ]
- [ ]

### Backlog Notes / Tech Debt
- **Potential backlog additions discovered this cycle:**
- **Resolved backlog items this cycle:**

---

## 2) Filled Baseline: 672 Elm Street

### Project Snapshot
- **Project name:** 672elmstreet
- **Primary domain / deployment URL:** `https://672elmstreet.com`
- **One-sentence mission:** Rental property management + LLC finance dashboard with connected banking, docs, messaging, and AI assistant workflows.
- **Current phase:** Active feature development + hardening
- **Last updated:** 2026-02-15

### Project Description
- **Business purpose:** Centralize rent roll, loans/mortgage/HELOC, contacts, and transaction visibility for property operations.
- **Primary users:** Property owner/operator and internal collaborators.
- **Core workflows:**
  - Manage rent roll and monthly rent records.
  - Track LLC financial accounts/liabilities and member finances.
  - Sync bank activity via Plaid and classify alerts.
  - Use AI assistant/chat and optional voice channels.
  - Manage property docs/photos and Google Workspace integrations.

### Major Technologies
- **Frontend:** React 18 + Vite + Tailwind + Radix/shadcn UI components.
- **Backend/API:** Node.js + Express + TypeScript.
- **Database/ORM:** PostgreSQL + Drizzle ORM + drizzle-zod.
- **AI/LLM:** Google Gemini + OpenAI SDK.
- **Integrations:** Plaid, Google Drive/Gmail/Calendar/Docs/Sheets, Twilio, Google Cloud Storage/TTS.
- **Testing/tooling:** TypeScript compiler checks and Playwright e2e support.

### Architecture & Runtime Model
- **Model:** Full-stack TypeScript app with React client + Express API server + shared schemas.
- **Data contracts:** `shared/schema.ts` defines table/schema + insert validators used by server logic.
- **Runtime behavior:** API layer registers many route groups (health, finance entities, integrations, AI/chat).

### File Structure (High-Value Map)
- **`client/`**: Frontend app (components, hooks, pages, UI primitives).
- **`server/`**: Express server, route handlers, service clients (AI + Google + Twilio + Plaid).
- **`shared/`**: Cross-cutting schema/config used by client/server.
- **`database/`**: SQL migrations + DB utility scripts.
- **`docs/`**: Project documentation, plans, troubleshooting.
- **`e2e/`**: Playwright tests.
- **`assets/` / `references/`**: Visual assets and reference implementations.

### API & Data Contracts
- **Representative endpoints:**
  - `GET /api/health`
  - `GET /api/health/db`
  - `POST /api/ai/chat`
  - `GET /api/chat/history`
  - `POST /api/google-tts`
- **Representative entities in `shared/schema.ts`:**
  - Rent roll + tenants + monthly rent records
  - Mortgage/HELOC/member loans + transactions
  - Contacts, expenses, member finance/equity
  - Plaid config/accounts/transactions + alerts
  - Google OAuth config + evergreen documents + drive folders
  - AI chat conversations/messages
  - Maintenance requests/attachments, leases, monthly reports

### Configuration & Secrets
- **Required env:** `DATABASE_URL`, Plaid credentials (`PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`), Google OAuth, `GEMINI_API_KEY`, `APP_URL`.
- **Optional env:** `OPENAI_API_KEY`, Twilio creds, Google Cloud API key, `VITE_GEMINI_API_KEY` (browser-exposed if used).
- **Security caution:** Any `VITE_*` variable is bundled to the client and should never include high-privilege secrets.

### Security Status
- **Current status:** **Yellow** (production-capable stack with multiple sensitive integrations that require strict secret hygiene and periodic review).
- **Strengths:**
  - Secrets are externalized to environment variables.
  - Server health endpoints show integration readiness for diagnostics.
  - Shared schema validation via Zod/Drizzle patterns reduces malformed payload risk.
- **Watch items:**
  - Validate no privileged keys are ever passed through `VITE_*` variables.
  - Confirm least-privilege scopes for Google/Plaid/Twilio tokens.
  - Continue periodic audit of legacy/replit-only env variables.

### Quality Status
- **Build/typecheck commands available:** `npm run build`, `npm run check`.
- **e2e support:** `npm run test:e2e` (Playwright).
- **Current note:** Use `npm` and committed lockfile workflow.

### Operational Runbook (AI Quick Actions)
- **Install deps:** `npm install`
- **Run dev:** `npm run dev`
- **Typecheck:** `npm run check`
- **Build:** `npm run build`
- **DB push:** `npm run db:push`
- **E2E tests:** `npm run test:e2e`

### Product Context for AI Coach
- **Domain language:** rent roll, HELOC, mortgage, member equity, plaid transactions, evergreen docs.
- **AI coach behavior target:** Suggest operationally safe changes, preserve financial-data correctness, and prefer schema-first updates.
- **High-priority non-functional goals:** reliability, observability, secure integrations, and low-friction day-to-day workflows.

### Current Priorities (recommended)
1. Harden integration reliability and diagnostics (Plaid + Google APIs + AI providers).
2. Improve test confidence on critical financial and sync flows.
3. Continue security hygiene around secrets and OAuth scopes.

### Next Steps
- [ ] Create a recurring “AI coach project snapshot” update cadence (e.g., weekly) and keep this file current.
- [ ] Add/maintain a concise endpoint index (owner, input schema, failure modes) for high-value API routes.
- [ ] Add a security checklist pass for env vars and OAuth scopes before each release.

### Backlog Notes / Tech Debt
- **Suggested addition:** Track “maintain AI coach project brief freshness (weekly update + ownership)” as an explicit backlog item.
