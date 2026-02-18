# AI Coach Project Snapshot — RIA Marketing Page

## 1) Project Metadata
- **Project name:** RIA-marketing-page
- **Primary domain/app URL:** https://youarepayingtoomuch.com
- **Repository URL:** https://github.com/dvanosdol88/ria-marketing-page
- **Primary owner(s):** David J. Van Osdol, CFA, CFP
- **Last updated (YYYY-MM-DD):** 2026-02-15
- **Current phase:** active

## 2) Project Description
- **One-sentence summary:** A Next.js marketing site with interactive fee-impact calculators that demonstrates how percentage-based advisory fees erode long-term portfolio outcomes.
- **Business/user goal:** Convert visitors into leads by educating them on fee drag and positioning a flat-fee advisory offer.
- **Primary users/personas:** Cost-sensitive investors evaluating advisory alternatives.
- **Core value proposition:** Equivalent or better advisory quality for a flat monthly fee vs. a traditional AUM percentage fee.
- **Success metrics (KPIs):** Calculator engagement, time on key landing pages, lead/contact conversion rate.

## 3) Product Scope
- **In scope now:** Marketing pages, calculator experience, value-proposition pages (`/upgrade-your-advice`, `/improve`, `/save`), and supporting API routes for quiz/gallery status interactions.
- **Out of scope now:** Multi-tenant SaaS workflows, account login systems, and large backend data platforms.
- **Key user flows:**
  1. Visitor arrives on homepage, uses calculator, and sees projected fee impact.
  2. Visitor explores one or more value pages and supporting trust content.
  3. Visitor converts through contact/lead channel.

## 4) Major Technologies
### Application Stack
- **Framework/runtime:** Next.js App Router (currently pinned in repo as Next 16.x).
- **Language(s):** TypeScript + React.
- **UI/styling:** Tailwind CSS v4 + shared design tokens.
- **State/data model:** URL query-string state for calculator scenarios.
- **Visualization/interaction libraries:** Recharts, Framer Motion, Lucide React, next-view-transitions.

### Tooling & Quality
- **Package manager:** npm (`package-lock.json` present).
- **Linting/type checking:** ESLint (`npm run lint`) + TypeScript (`npx tsc --noEmit`).
- **Testing:** No formal test suite currently declared in scripts; validation is primarily lint/type/build and manual checks.
- **Build/deploy platform:** Vercel-oriented Next.js deployment.
- **CI/CD automation:** Renovate is configured for dependency management.

### External Services & Integrations
- **Hosting/platform services:** Vercel.
- **Database/storage:** `@vercel/kv` dependency present (tracked in infra notes as active usage needing migration planning).
- **APIs/vendors:** Internal API routes under `src/app/api/*`.
- **Analytics/monitoring:** Not explicitly documented in current top-level docs.

## 5) File Structure (High-Signal Map)
- `src/app/` — App Router pages, layout/error/loading files, and API routes.
- `src/components/` — Shared and route-specific UI components (calculator, charts, navigation, value pages).
- `src/lib/` — Core calculation and formatting logic.
- `src/config/` — Content/config-driven page definitions and site settings.
- `src/styles/` — Design tokens used by Tailwind.
- `docs/` — Architecture notes, dependency strategy, backlog, and project planning artifacts.
- `public/` — Brand assets, images, icons, and downloadable resources.
- `scripts/` — Utility scripts for maintenance tasks.

## 6) Core Architecture Notes
- **Key architectural patterns:** Configuration-driven content in `src/config`, URL-state-driven calculator inputs, and centralized design tokens.
- **Critical modules/components:**
  - `src/components/CostAnalysisCalculator.tsx` (core interactive conversion experience)
  - `src/lib/feeProjection.ts` (fee/growth math)
  - `src/lib/calculatorState.ts` (shareable URL state)
- **Data flow summary:** User inputs -> state normalization -> projection math -> chart rendering -> optional URL persistence.
- **Configuration hot spots:** `tailwind.config.ts`, `src/app/globals.css`, `next.config.mjs`, and page configs in `src/config/`.
- **Known coupling points:** Next.js/React version coupling, Tailwind/PostCSS coupling, and `eslint-config-next` coupling to framework version.

## 7) Runbook (Developer Commands)
- **Install:** `npm install`
- **Run locally:** `npm run dev`
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`
- **Test:** No dedicated test command currently defined.
- **Build:** `npm run build`

## 8) Security Status
### Current Status
- **Overall posture:** yellow (healthy baseline with active dependency governance and known follow-ups).
- **Last security review date:** 2026-02-09 (documented DevOps audit/action plan).
- **Known vulnerabilities:** No explicit active CVE list documented in-repo; vulnerability handling path is configured in Renovate strategy notes.
- **Secrets handling approach:** Repo documentation references configured GitHub secrets for automation workflows.
- **Dependency update policy:** Renovate with staged risk lanes and dashboard approvals for higher-risk updates.

### Open Risks
1. `@vercel/kv` deprecation remains a migration/removal decision point.
2. Security bypass path for vulnerability alerts is documented but only fully proven during real vulnerability events.
3. No explicit test suite may reduce early detection of regression/security-sensitive behavior changes.

### Mitigations in Place
- Renovate dashboard approvals for major/framework updates.
- Documented dependency management and periodic review cadence.

## 9) Reliability & Operations
- **Runtime environments:** Local Next.js runtime + Vercel production runtime.
- **Error handling strategy:** App Router-level error and loading boundaries exist.
- **Observability/logging:** Not centrally documented in repo docs.
- **Incident response notes:** Dependency/security remediation process documented in DevOps action plan.
- **Performance considerations:** Heavy use of interactive visuals and media assets suggests periodic bundle/image optimization reviews.

## 10) Delivery Status
- **Current milestone/sprint focus:** Ongoing conversion improvements and content/experience refinement.
- **Completed recently:** Renovate policy corrections and dependency-governance hardening (per DevOps execution notes).
- **Blocked/on hold:** `@vercel/kv` migration/removal decision if usage changes.

## 11) Backlog & Next Steps
- **Backlog source of truth:** `docs/backlog.md`
- **Top 3 next steps:**
  1. Add this snapshot template/process to team workflow checklist.
  2. Add explicit testing strategy to reduce regression risk (unit tests around fee projection and URL-state parsing).
  3. Create a formal security section in README that links dependency and secrets policies.
- **Recommended AI support actions this week:**
  - Draft and prioritize test-plan options with minimal setup overhead.
  - Propose `@vercel/kv` migration paths based on current usage footprint.

## 12) AI Coach Working Notes
- **Preferred decision style:** Balanced (conversion speed with explicit risk controls).
- **Code change guardrails:** Keep calculator math and URL parameters backward compatible.
- **Documentation expectations:** Update architecture/security/backlog docs when major behavior or dependency policy changes.
- **When AI should escalate/ask for review:** Framework major upgrades, pricing/value messaging changes, and any edits to security/dependency policies.
- **Useful project-specific prompts:**
  - "Summarize conversion-impacting UI changes and propose A/B hypotheses."
  - "Review fee-calculation logic for edge-case correctness and explain user-visible implications."

## 13) Change Log for This Snapshot
- **What changed in this snapshot:** Added a reusable template and a populated project snapshot baseline for AI-coach reuse.
- **Why this update was made:** Establish consistent project brief format for repeated coaching sessions.
- **Author:** Codex (GPT-5.2-Codex)
