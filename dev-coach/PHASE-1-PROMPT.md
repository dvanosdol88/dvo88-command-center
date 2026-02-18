# Phase 1 — Dashboard Landing Page

## Context
Read `D:\CLAUDE.md` for project rules. Read `D:\Non-RIA\dvo88\dev-coach\DASHBOARD-IMPLEMENTATION-PLAN.md` for the full plan.

Phase 0 is complete (commit 93e3b7b on `feature/project-dashboard`). The current state:
- `App.tsx` routes `/` and `/legacy` both point to `LegacyLandingPage`
- `src/config/projects.ts` exports `PROJECTS` (7 items) and `getProjectBySlug()`
- Build passes, branch is `feature/project-dashboard`

## Objective
Create a new `ProjectDashboard.tsx` component and wire it as the `/` route. This is the new dvo88.com homepage — a grid of project status cards behind the existing passcode gate.

## Design Requirements

### Aesthetic — match existing site exactly
Study `components/LegacyLandingPage.tsx` and `index.html` for the source of truth. Key elements:

**Fonts:** Montserrat (headings, `font-heading`) + Source Sans 3 (body, `font-sans`) — already loaded via Google Fonts CDN in `index.html`

**Colors (from Tailwind config in index.html):**
- `evergreen`: #006044 (primary brand)
- `evergreen-light`: #007050
- `evergreen-dark`: #004a35
- `accent-green`: #76a923 (lime accent)
- `accent-gold`: #af8a49
- `brand-black`: #0f172a
- Standard Tailwind slate scale for grays
- Dark mode supported via `dark:` classes

**Visual signatures to KEEP:**
- Floating $ particle canvas background (copy the entire canvas `useEffect` + `<canvas>` element from LegacyLandingPage)
- Frosted glass header: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md`
- "dvo88" + ".com" in lime-600 logo treatment
- Passcode overlay (copy the entire passcode gate from LegacyLandingPage)
- Rounded cards with subtle shadows and border

**Status dot colors:**
- 🟢 green: `bg-emerald-500`
- 🟡 yellow: `bg-amber-400`
- 🔴 red: `bg-red-500`

### Layout

```
┌──────────────────────────────────────────────────────┐
│  HEADER (frosted glass, same as current)             │
│  dvo88.com    [AI Tools] [Calculator] [672elm] [RIA] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  "Project Command Center"  (hero-style title)        │
│  subtitle: portfolio overview                        │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ 🟡 672  │  │ 🟡 RIA  │  │ 🟡 RIA  │              │
│  │  Elm St │  │  Mktg   │  │ Builder │              │
│  │         │  │         │  │         │              │
│  │ [View →]│  │ [View →]│  │ [View →]│              │
│  └─────────┘  └─────────┘  └─────────┘              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ 🟡 AI   │  │ 🟢 dvo  │  │ 🟢 ai-  │              │
│  │  Leo    │  │  88 Hub │  │  core   │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│  ┌─────────┐                                         │
│  │ 🟢 MW   │                                         │
│  │ Scanner │                                         │
│  └─────────┘                                         │
│                                                      │
│  $ $ $ $ $ $ (floating particle canvas behind)       │
└──────────────────────────────────────────────────────┘
```

### Card Design

Each card:
- White bg with dark mode variant (`bg-white dark:bg-slate-800/80`)
- Rounded corners (`rounded-xl`), subtle shadow (`shadow-md`)
- Slight border (`border border-slate-200 dark:border-slate-700`)
- Backdrop blur for glass effect (`backdrop-blur-sm`)
- Hover: lift effect (`hover:-translate-y-1 hover:shadow-lg transition-all`)

Card contents (top to bottom):
1. **Status row:** colored dot + phase badge (e.g., "Hardening") right-aligned
2. **Project name:** bold, `text-lg font-heading font-bold`
3. **URL:** small muted text, clickable external link (if url exists)
4. **One-liner:** 2-line max, `text-sm text-slate-500 dark:text-slate-400`
5. **Tech stack:** horizontal row of small badges (first 4 only, `+N more` if overflow)
6. **Footer row:** `Last updated: Feb 15` left, `View Details →` link right
7. The "View Details →" link should use `react-router-dom`'s `<Link to={'/project/' + slug}>` (the detail page doesn't exist yet — that's Phase 2 — but wire the link now)

### Responsive Grid
- Desktop: 3 columns (`grid-cols-3`)
- Tablet: 2 columns (`md:grid-cols-2`)
- Mobile: 1 column (`grid-cols-1`)
- Gap: `gap-6`
- Max width container: `max-w-6xl mx-auto px-6`

## Steps

### Step 1: Create `components/ProjectDashboard.tsx`

Create one file. It must:
- Import `PROJECTS` and `ProjectStatus` from `../src/config/projects`
- Import `Link` from `react-router-dom`
- Include the FULL passcode gate (copy from `LegacyLandingPage.tsx` — the `isAuthenticated` state, `passcode` state, `handlePasscodeChange`, `handleKeyDown`, `inputsRef`, `sessionStorage` check, and the overlay JSX)
- Include the FULL floating $ particle canvas (copy the entire canvas `useEffect`, the `Particle` class, and the `<canvas>` element from `LegacyLandingPage.tsx`)
- Include the frosted glass header (copy from `LegacyLandingPage.tsx`, keep the same nav links)
- Render the project card grid in the main area
- Support dark mode with `dark:` classes throughout

### Step 2: Update `App.tsx`

- Add import for `ProjectDashboard`
- Change the `/` route from `LegacyLandingPage` to `ProjectDashboard`
- Keep `/legacy` pointing to `LegacyLandingPage`
- Keep the `*` fallback pointing to `LegacyLandingPage` (so unknown routes still go to the old page for now)
- Do NOT touch any other routes

### Step 3: Verify Build
```
cd D:\Non-RIA\dvo88
npm run build
```
Fix any errors.

### Step 4: Local Dev Test
```
npm run dev
```
Open http://localhost:3000 in a browser (or use available browser tools) and verify:
- Passcode gate appears first
- After entering passcode, the card grid renders with 7 cards
- Each card shows the correct status color, name, and one-liner
- "View Details →" links go to `/project/{slug}` (will show fallback page — that's fine)
- `/legacy` still shows the old landing page
- `/dashboard`, `/calculator`, `/leo-ai` still work

### Step 5: Commit & Push
```
git add -A
git commit -m "phase 1: project dashboard landing page

- Create ProjectDashboard.tsx with status card grid for all 7 projects
- Wire / route to new dashboard, /legacy preserves old landing page
- Reuse passcode gate, particle canvas, and frosted header from legacy page
- Cards show status dot, phase, one-liner, tech stack badges, last updated
- Responsive 3/2/1 column grid with dark mode support"
git push origin feature/project-dashboard
```

## Verification Checklist
- [ ] `npm run build` passes with zero errors
- [ ] `components/ProjectDashboard.tsx` exists and is the only new file
- [ ] `App.tsx` route `/` points to ProjectDashboard
- [ ] `App.tsx` route `/legacy` still points to LegacyLandingPage
- [ ] ProjectDashboard imports from `../src/config/projects`
- [ ] All 7 project cards render in the grid
- [ ] Each card shows: status dot (colored), project name, one-liner, phase badge, tech stack badges, last updated date, "View Details →" link
- [ ] Status dot uses correct color: green → emerald-500, yellow → amber-400, red → red-500
- [ ] "View Details →" links to `/project/{slug}` using react-router `<Link>`
- [ ] Passcode gate works (blocks access until correct code entered)
- [ ] Floating $ canvas renders behind the cards
- [ ] Frosted glass header renders with nav links
- [ ] Dark mode classes present on all new elements
- [ ] `/legacy`, `/dashboard`, `/calculator`, `/leo-ai` routes all still work
- [ ] Commit pushed to `origin/feature/project-dashboard`

## Do NOT
- Do NOT modify `src/config/projects.ts` (that's the data layer — it's done)
- Do NOT modify `LegacyLandingPage.tsx`
- Do NOT modify `DashboardApp.tsx`, `server/`, `api/`, or `vercel.json`
- Do NOT install new npm packages
- Do NOT create more than one new file (`ProjectDashboard.tsx`)
- Do NOT create the detail view component (that's Phase 2)
- Do NOT change the Tailwind config in `index.html`
