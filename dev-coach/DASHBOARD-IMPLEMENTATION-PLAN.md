# Project Command Center — Implementation Plan

**Author:** Claude (AI Coach)  
**Date:** 2026-02-17  
**Location:** `D:\Non-RIA\dvo88` → deployed at `dvo88.com`

---

## What We're Building

A single-page **Project Command Center** that replaces the current dvo88.com landing page. It gives you an at-a-glance traffic-light view (🟢🟡🔴) of every project, with drill-down detail pages and an AI assistant that knows your full portfolio.

### Design Constraints
- **Same aesthetics** as current dvo88.com: Montserrat + Source Sans 3, evergreen/lime/gold palette, dark mode, floating $ particle canvas background
- **Same tech stack**: React + Vite + Tailwind CDN + Express backend on Vercel
- **Same repo**: `D:\Non-RIA\dvo88` — no new repos
- **Passcode gate stays** (the 6-digit overlay)

---

## Your Project Portfolio (7 items to track)

| # | Project | URL | Stack | Current Status |
|---|---------|-----|-------|---------------|
| 1 | 672 Elm Street | 672elmstreet.com | React/Express/PostgreSQL | 🟡 Yellow |
| 2 | RIA Marketing | youarepayingtoomuch.com | Next.js/Vercel | 🟡 Yellow |
| 3 | RIA Builder | riabuilder.dvo88.com | React/Firebase | 🟡 Active build |
| 4 | AI Leo | (Vercel preview) | React/Vite/Vercel | 🟡 Active |
| 5 | dvo88.com Hub | dvo88.com | React/Vite/Vercel | 🟢 This project |
| 6 | ai-core | npm package | TypeScript lib | 🟢 v0.1.2 |
| 7 | Masterworks Scanner | Local Python | Python/scheduler | 🟢 Utility |

---

## Architecture Overview

```
dvo88.com (React + Vite + Vercel)
├── / ..................... NEW ProjectDashboard (passcode-gated)
│   ├── Summary cards (traffic light per project)
│   ├── Click card → /project/:slug detail view
│   └── AI chat drawer (knows all projects)
├── /legacy .............. Archived current landing page
├── /dashboard ........... Existing RIA vendor dashboard (unchanged)
├── /calculator .......... Existing capacity calculator (unchanged)
├── /leo-ai .............. Existing Leo AI gate (unchanged)
└── /api
    ├── /api/health ...... Existing health check (unchanged)
    ├── /api/ai/chat ..... Existing AI chat (enhanced with project context)
    └── /api/projects .... NEW project status endpoint (reads config)
```

### Data Flow (Phase 1 — Manual Config)

```
projects.config.ts (you edit manually)
        ↓
  /api/projects endpoint (serves JSON)
        ↓
  ProjectDashboard component (renders cards)
        ↓
  ProjectDetail component (shows full brief)
        ↓
  AI Chat (system prompt includes all project configs)
```

---

## Phased Build Plan

### Phase 0: Prep & Archive (30 min)
**Goal:** Safe foundation — archive current page, create project config structure

| Step | What | Files |
|------|------|-------|
| 0.1 | Git branch: `feature/project-dashboard` | — |
| 0.2 | Rename `LandingPage.tsx` → `LegacyLandingPage.tsx` | `components/` |
| 0.3 | Add `/legacy` route pointing to archived page | `App.tsx` |
| 0.4 | Create project config file with all 7 projects | `src/config/projects.ts` |
| 0.5 | Verify build passes, commit | — |

**Key learning moment:** This is the config-driven design pattern from your CLAUDE.md — all project data lives in ONE file, the UI renders from it.

---

### Phase 1: Dashboard Landing Page (2-3 hours)
**Goal:** Traffic-light summary cards as the new `/` route

| Step | What | Files |
|------|------|-------|
| 1.1 | Create `ProjectDashboard.tsx` — grid of project cards | `components/ProjectDashboard.tsx` |
| 1.2 | Each card shows: name, status dot (🟢🟡🔴), one-liner, last updated | — |
| 1.3 | Keep passcode gate (reuse existing logic) | — |
| 1.4 | Keep floating $ canvas background | — |
| 1.5 | Keep header with nav links to `/dashboard`, `/calculator`, `/leo-ai` | — |
| 1.6 | Update `App.tsx` route: `/` → `ProjectDashboard` | `App.tsx` |
| 1.7 | Deploy to Vercel preview, test | — |

**What a card looks like:**
```
┌─────────────────────────────────────┐
│ 🟡  672 Elm Street                  │
│     672elmstreet.com                │
│                                     │
│     Rental property management +    │
│     LLC finance dashboard           │
│                                     │
│     Phase: Hardening                │
│     Updated: 2026-02-15             │
│                                     │
│     [View Details →]                │
└─────────────────────────────────────┘
```

---

### Phase 2: Project Detail View (2 hours)
**Goal:** Click a card → see full project brief

| Step | What | Files |
|------|------|-------|
| 2.1 | Create `ProjectDetailView.tsx` | `components/ProjectDetailView.tsx` |
| 2.2 | Add route `/project/:slug` | `App.tsx` |
| 2.3 | Sections: Status, Description, Tech Stack, Recent Changes, Next Steps, Roadmap | — |
| 2.4 | Back button returns to dashboard | — |
| 2.5 | Links to live site, repo | — |
| 2.6 | Deploy, test | — |

**Detail view sections:**
1. **Status Banner** — big traffic light + phase + last updated
2. **Quick Stats** — is it running? deploy status? health check?
3. **Description** — from config
4. **Recent Changes** — manually maintained changelog array
5. **What's Next** — priority list from config
6. **Long-Term Roadmap** — milestone timeline from config
7. **Tech Stack** — chips/badges
8. **Known Issues** — from config

---

### Phase 3: AI Chat with Project Context (2-3 hours)
**Goal:** Chat drawer that knows all your projects

| Step | What | Files |
|------|------|-------|
| 3.1 | Create `ProjectChatDrawer.tsx` (slide-out panel) | `components/ProjectChatDrawer.tsx` |
| 3.2 | Enhance `/api/ai/chat` — inject project config as system prompt | `server/routes.ts` |
| 3.3 | System prompt includes: all project configs, statuses, priorities | `server/services/project-context.ts` |
| 3.4 | Chat can answer: "What should I work on next?", "What's the status of 672?", "Summarize recent changes" | — |
| 3.5 | Chat appears as floating button on dashboard + detail views | — |
| 3.6 | Deploy, test | — |

**System prompt strategy:**
```
You are a project management AI assistant for David's portfolio.
Here are all active projects and their current state:
[inject full projects.config.ts as JSON]

You can help with:
- Status summaries across all projects
- "What should I work on next?" recommendations based on priorities
- Answering questions about any project's tech stack, issues, or roadmap
- Generating status reports
```

---

### Phase 4: Polish & Production (1-2 hours)
**Goal:** Production-ready, merged to main

| Step | What |
|------|------|
| 4.1 | Responsive design — mobile card layout |
| 4.2 | Dark mode verification on all new components |
| 4.3 | Loading states and error boundaries |
| 4.4 | Update README.md |
| 4.5 | Merge `feature/project-dashboard` → main |
| 4.6 | Deploy to production |
| 4.7 | Verify dvo88.com in browser |

---

## File-Level Plan

### New Files to Create

```
src/config/projects.ts          ← Single source of truth for all project data
components/ProjectDashboard.tsx  ← New landing page (card grid)
components/ProjectDetailView.tsx ← Drill-down view per project
components/ProjectChatDrawer.tsx ← AI chat panel
server/services/project-context.ts ← Builds system prompt from config
```

### Files to Modify

```
App.tsx                          ← New routes: /, /legacy, /project/:slug
components/LandingPage.tsx       ← Rename to LegacyLandingPage.tsx
server/routes.ts                 ← Enhanced /api/ai/chat with project context
                                    + new GET /api/projects endpoint
```

### Files NOT Touched

```
DashboardApp.tsx                 ← Existing vendor dashboard (unchanged)
components/ChatWidget.tsx        ← Existing chat widget (unchanged)
components/leo-ai/*              ← Leo AI (unchanged)
components/miniapps/*            ← Mini apps (unchanged)
server/services/ai-router.ts    ← AI routing (unchanged)
```

---

## The Config File (Heart of the System)

`src/config/projects.ts` — this is what you manually update:

```typescript
export type ProjectStatus = 'green' | 'yellow' | 'red';
export type ProjectPhase = 'discovery' | 'build' | 'hardening' | 'launch' | 'maintenance' | 'paused';

export interface ProjectConfig {
  slug: string;
  name: string;
  url?: string;
  repoUrl?: string;
  localPath?: string;
  oneLiner: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  lastUpdated: string; // ISO date
  techStack: string[];
  healthCheckUrl?: string;
  description: string;
  recentChanges: { date: string; summary: string }[];
  nextSteps: string[];
  roadmap: { milestone: string; target: string; status: ProjectStatus }[];
  knownIssues: string[];
  securityStatus: ProjectStatus;
  notes?: string;
}

export const PROJECTS: ProjectConfig[] = [
  {
    slug: '672-elm-street',
    name: '672 Elm Street',
    url: 'https://672elmstreet.com',
    // ... full config for each project
  },
  // ... all 7 projects
];
```

---

## Future Phases (Not in this build)

### Phase 5: Auto-Enrichment (later)
- Pull Vercel deploy status via Vercel API
- Pull latest git commits via GitHub API
- Auto-update "last deployed" and "last commit" fields
- Health check pings to each project's `/api/health`

### Phase 6: Notifications & Alerts (later)
- Slack integration for status changes
- Email digest of weekly project health

---

## Build Order Summary

| Phase | Deliverable | Est. Time | Dependency |
|-------|------------|-----------|------------|
| 0 | Archive + config file | 30 min | None |
| 1 | Dashboard landing page | 2-3 hrs | Phase 0 |
| 2 | Project detail views | 2 hrs | Phase 1 |
| 3 | AI chat with context | 2-3 hrs | Phase 1 |
| 4 | Polish + production deploy | 1-2 hrs | Phases 1-3 |

**Total estimated: ~8-10 hours of build time**

---

## Ready to Build?

When you say "go", we start Phase 0: create the branch, archive the landing page, and build the config file. Each phase ends with a commit, push, and Vercel test.
