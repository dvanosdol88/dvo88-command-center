# AI Project Brief — RIA Builder

## 1) Project Snapshot
- **Project Name:** RIA Builder
- **Repository:** `/workspace/RIA-builder`
- **Primary Owner(s):** Not explicitly defined in-repo
- **Last Updated (UTC):** 2026-02-15
- **Environment:** Local/dev + Firebase Functions backend + Vercel frontend deployment
- **Status:** Active build / iterative enhancement

## 2) Project Description
### Purpose
RIA Builder is a practice management and workflow tool for Registered Investment Advisors (RIAs), focused on organizing and executing initiatives across prospect experience, client operations, compliance, and growth.

### Core Users
- Registered Investment Advisors and related practice operators
- Internal users managing ideas, tasks, documents, and launch readiness

### Primary Workflows
1. Create and manage categorized idea cards across pages and stages.
2. Capture and manage to-do items and pre-launch checklist items.
3. Store, filter, and analyze documents.
4. Use the GenConsult AI sidebar for guided planning and execution support.
5. Integrate with Google Drive, Slack, and web research flows via backend tools.

## 3) Architecture & Technologies
### Frontend
- React + TypeScript application with Vite build tooling.
- Tailwind CSS for styling.
- HashRouter-based navigation (`/` and `/calculator`).

### Backend / APIs
- Firebase Cloud Functions (TypeScript, Node 20).
- HTTP endpoints for transcription, Slack messaging, web research, and integration checks.

### Data & State
- Firebase-backed persistence for idea and related entities.
- Zustand stores for app state (`ideaStore`, `todoStore`, `documentStore`, `consultantStore`, `authStore`).

### AI / Automation
- Google GenAI SDK (`@google/genai`) integrated in frontend services/components.
- GenConsult assistant supports tool-driven workflows for docs, cards, Slack, and web research.
- Audio transcription capability uses OpenAI in Cloud Functions.

### Integrations
- Firebase Auth + Firestore.
- Google Drive via frontend service layer.
- Slack API via server-side function and secret.
- Tavily web search via server-side function and secret.

## 4) Repository Map
### Top-Level Structure
- `src/`: React app, stores, components, and service integrations.
- `functions/`: Firebase Cloud Functions source and build artifacts.
- `tests/e2e/`: Playwright end-to-end tests.
- `docs/`: Reusable AI briefing docs and templates.
- Config files: `package.json`, `firebase.json`, `playwright.config.ts`, `eslint.config.js`, `tsconfig.json`.

### Critical Files for Onboarding
- `README.md`: Product overview, setup, stack, and deployment entry points.
- `src/ConstructionZone.tsx`: Primary workspace UI orchestration.
- `src/ideaStore.ts`: Category structure and core state model.
- `functions/src/index.ts`: Backend endpoint definitions and secret-protected integrations.
- `package.json`: Frontend scripts and dependency baseline.
- `functions/package.json`: Functions runtime/deploy scripts and dependencies.

## 5) Runtime & Operations
### Local Development
- Install: `npm install`
- Frontend dev server: `npm run dev`
- Lint: `npm run lint`
- E2E tests: `npm run test:e2e`
- Functions local serve: `cd functions && npm run serve`

### Deployment
- Frontend hosted on Vercel.
- Backend deployed via Firebase Functions (`firebase deploy --only functions`).

### Observability
- Function-level logs available via Firebase (`functions:log` script).
- No explicit in-repo telemetry or error-monitoring platform configuration found.

## 6) Security Status
### Secret Handling
- Backend functions use secret bindings for `OPENAI_API_KEY`, `SLACK_BOT_TOKEN`, and `TAVILY_API_KEY`.
- Slack channel ID is stored in Firebase config.

### Auth & Access
- Firebase Auth with Google Sign-In is used.
- Sensitive third-party API calls for Slack and Tavily are routed through Cloud Functions.

### Current Risks
1. README currently documents `VITE_GEMINI_API_KEY` in frontend env setup, which conflicts with stricter backend-only secret policy for sensitive keys.
2. CORS is permissive (`origin: true`) in functions; may require production hardening.
3. No explicit automated secret scanning workflow is documented beyond commit hygiene instructions.

### Security TODOs
- Move any sensitive AI keys from frontend-exposed env vars to backend endpoints where feasible.
- Add documented secret scanning/check tooling in CI.
- Define production CORS allowlist and threat-model per endpoint.

## 7) Current Product Scope
### Implemented
- Multi-view workspace (construction board, docs, idea hopper, todo, outline, checklist, calculator).
- Category/page-driven idea management.
- Google authentication and Firebase persistence.
- AI-assisted sidebar with tool integrations.

### In Progress
- Ongoing UI/UX iteration indicated by active Playwright screenshot artifacts and e2e tests.

### Deferred / Out of Scope
- No explicit roadmap file in repo defining deferred scope.

## 8) AI Coach Operating Notes
### Domain Context
- Categories and default pages are configuration-driven and centralized.
- Product is built around advisory-practice operations rather than generic project management.

### Decision Heuristics
- Prefer extending config/state-driven patterns over hardcoded UI branches.
- Preserve store boundaries (ideas/docs/todos/consultant/auth).
- Keep sensitive integrations server-mediated.

### Safe Change Strategy
- Safe: View-level UI updates, component-level UX improvements, store-level non-breaking enhancements.
- Needs extra review: Auth changes, data-model migrations, secret/integration architecture changes.

## 9) Next Steps
### Immediate (1-2 weeks)
- [ ] Standardize this AI brief update cadence (weekly or per sprint).
- [ ] Decide whether Gemini usage should be server-proxied for policy alignment.
- [ ] Add a concise architecture diagram linking stores, services, and backend endpoints.

### Near-Term (this sprint/month)
- [ ] Add CI checks for lint + e2e smoke paths.
- [ ] Introduce security checklist gating for integration changes.
- [ ] Document core Firestore collections and schema assumptions.

### Later
- [ ] Add observability standards (error reporting, analytics, SLOs).
- [ ] Create release checklist for frontend + functions coordinated deploys.

## 10) Open Questions
- Should all AI model calls be routed through backend functions?
- What are the production auth/authorization boundaries beyond Google sign-in?
- Which workflows are mission-critical vs. experimental for upcoming releases?

## 11) Changelog for This Brief
- `2026-02-15`: Initial project brief created from README, package manifests, app entry/routing, and functions code.
