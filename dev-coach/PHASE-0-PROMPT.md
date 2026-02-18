# Phase 0 — Prep & Archive

## Context
Read the full implementation plan at `D:\Non-RIA\dvo88\dev-coach\DASHBOARD-IMPLEMENTATION-PLAN.md` before starting. Read `D:\CLAUDE.md` for project rules (config-driven design, safety rules, commit conventions).

This is the dvo88.com repo — a React + Vite + Tailwind CDN app deployed on Vercel. The current landing page at `/` will be replaced by a Project Command Center dashboard in later phases. Phase 0 just archives the old page and creates the data config.

## Objective
1. Create a feature branch
2. Archive the current landing page to `/legacy`
3. Create `src/config/projects.ts` — the single source of truth for all project data
4. Verify build passes
5. Commit and push to remote

## Steps

### Step 1: Branch
```
cd D:\Non-RIA\dvo88
git checkout main
git pull origin main
git checkout -b feature/project-dashboard
```

### Step 2: Archive Landing Page
- Rename `components/LandingPage.tsx` → `components/LegacyLandingPage.tsx`
- Update the import inside `App.tsx`:
  - Change the import path from `./components/LandingPage` to `./components/LegacyLandingPage`
  - Add a new route: `<Route path="/legacy" element={<LegacyLandingPage />} />`
  - The `/` route should STILL point to `<LegacyLandingPage />` for now (Phase 1 will swap it)
  - The `*` fallback should also still point to `<LegacyLandingPage />`
- Do NOT change anything else in App.tsx — leave `/dashboard`, `/calculator`, `/leo-ai` routes exactly as they are

### Step 3: Create `src/config/projects.ts`
Create this file with the type definitions and all 7 projects populated. Read the project briefs in `dev-coach/` for accurate data.

Here are the types:

```typescript
export type ProjectStatus = "green" | "yellow" | "red";
export type ProjectPhase =
  | "discovery"
  | "build"
  | "hardening"
  | "launch"
  | "maintenance"
  | "paused";

export interface RecentChange {
  date: string;
  summary: string;
}

export interface RoadmapItem {
  milestone: string;
  target: string;
  status: ProjectStatus;
}

export interface ProjectConfig {
  slug: string;
  name: string;
  url?: string;
  repoUrl?: string;
  localPath?: string;
  oneLiner: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  lastUpdated: string;
  techStack: string[];
  healthCheckUrl?: string;
  description: string;
  recentChanges: RecentChange[];
  nextSteps: string[];
  roadmap: RoadmapItem[];
  knownIssues: string[];
  securityStatus: ProjectStatus;
  notes?: string;
}
```

Populate the PROJECTS array with these 7 projects. Use the dev-coach briefs for accurate data where available. For projects without briefs, use reasonable defaults based on what's in the repo.

| # | slug | name | url | localPath | phase |
|---|------|------|-----|-----------|-------|
| 1 | `672-elm-street` | 672 Elm Street | https://672elmstreet.com | D:\Non-RIA\672elmstreet | hardening |
| 2 | `ria-marketing` | RIA Marketing Page | https://youarepayingtoomuch.com | D:\RIA\RIA-marketing-page | maintenance |
| 3 | `ria-builder` | RIA Builder | https://riabuilder.dvo88.com | D:\RIA\RIA-builder | build |
| 4 | `ai-leo` | AI Leo | (check vercel.json or .vercel) | D:\Non-RIA\ai-leo | build |
| 5 | `dvo88-hub` | dvo88.com Hub | https://dvo88.com | D:\Non-RIA\dvo88 | build |
| 6 | `ai-core` | ai-core | https://github.com/dvanosdol88/ai-core | D:\Non-RIA\ai-core | maintenance |
| 7 | `masterworks-scanner` | Masterworks Scanner | (none — local only) | D:\Non-RIA\masterworks-scanner | maintenance |

For `recentChanges`, `nextSteps`, `roadmap`, and `knownIssues` — pull from the dev-coach briefs where they exist. For projects without briefs, add 1-2 placeholder items marked `"TODO: fill in"`.

Export the array as: `export const PROJECTS: ProjectConfig[] = [...]`

Also export a helper:
```typescript
export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
```

### Step 4: Verify Build
```
npm run build
```
Fix any TypeScript or build errors before proceeding.

### Step 5: Commit & Push
```
git add -A
git commit -m "phase 0: archive landing page, add project config

- Rename LandingPage → LegacyLandingPage, add /legacy route
- Create src/config/projects.ts with all 7 project definitions
- No functional changes to existing routes"
git push -u origin feature/project-dashboard
```

## Verification Checklist
- [ ] `npm run build` passes with zero errors
- [ ] `components/LegacyLandingPage.tsx` exists (old file renamed)
- [ ] `components/LandingPage.tsx` does NOT exist (it was renamed)
- [ ] `App.tsx` imports from `./components/LegacyLandingPage`
- [ ] `App.tsx` has route `/legacy` pointing to LegacyLandingPage
- [ ] `App.tsx` has `/` still pointing to LegacyLandingPage (temporary)
- [ ] `src/config/projects.ts` exports PROJECTS array with 7 items
- [ ] `src/config/projects.ts` exports getProjectBySlug helper
- [ ] Each project has: slug, name, status, phase, oneLiner, techStack, nextSteps
- [ ] Feature branch pushed to origin

## Do NOT
- Do NOT modify `DashboardApp.tsx`, `server/`, `api/`, or `vercel.json`
- Do NOT install new npm packages
- Do NOT create any new components (that's Phase 1)
- Do NOT change the Tailwind config in index.html
- Do NOT delete any files (only rename)
