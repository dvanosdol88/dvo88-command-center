# Phase 2 — Project Detail View

## Context
Read `D:\CLAUDE.md` for project rules. Read `D:\Non-RIA\dvo88\dev-coach\DASHBOARD-IMPLEMENTATION-PLAN.md` for the full plan.

Phase 1 is complete on branch `feature/project-dashboard`. The current state:
- `App.tsx` routes `/` to `ProjectDashboard`, `/legacy` to `LegacyLandingPage`
- `ProjectDashboard.tsx` renders 7 cards, each with `<Link to={'/project/' + slug}>`
- `src/config/projects.ts` exports `PROJECTS` array and `getProjectBySlug(slug)`
- Build passes

## Objective
Create `ProjectDetailView.tsx` and wire `/project/:slug` route in `App.tsx`. When a user clicks "View Details →" on any card, they land on a rich detail page for that project.

## Design Requirements

### Same aesthetics as ProjectDashboard
Study `components/ProjectDashboard.tsx` for visual reference. Reuse:
- Same frosted glass header (copy from ProjectDashboard)
- Same floating $ particle canvas background (copy from ProjectDashboard)
- Same passcode gate (copy from ProjectDashboard)
- Same font/color system (Montserrat headings, Source Sans 3 body, evergreen/lime/gold palette, dark mode)

**IMPORTANT — DRY concern acknowledged but deferred.** Yes, the passcode gate, canvas, and header are now duplicated across 3 components. That's intentional for now — we'll extract shared layout in Phase 4 polish. For Phase 2, just copy them so each route works standalone.

### Status dot colors (same as dashboard):
- green: `bg-emerald-500`
- yellow: `bg-amber-400`
- red: `bg-red-500`

### Page Layout

```
┌──────────────────────────────────────────────────────────┐
│  HEADER (frosted glass — same as dashboard)              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ← Back to Dashboard          [Visit Site ↗] (if url)   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  STATUS BANNER                                    │    │
│  │  🟡  672 Elm Street                               │    │
│  │  Phase: Hardening  •  Security: Yellow            │    │
│  │  Last updated: Feb 15, 2026                       │    │
│  │  https://672elmstreet.com                         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Description ────────────────────────────────────┐    │
│  │  Full description text from config                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Tech Stack ─────────────────────────────────────┐    │
│  │  [React] [Vite] [Tailwind] [Express] [PostgreSQL] │    │
│  │  [Drizzle ORM] [Gemini] [OpenAI]                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Recent Changes ─────────┐ ┌─ What's Next ────────┐  │
│  │  • Feb 15: Published AI  │ │  1. Harden Plaid...   │  │
│  │    coach baseline...     │ │  2. Test financial... │  │
│  │  • Feb 15: Documented    │ │  3. Env var audit...  │  │
│  │    integration readiness │ │                       │  │
│  └──────────────────────────┘ └───────────────────────┘  │
│                                                          │
│  ┌─ Roadmap ────────────────────────────────────────┐    │
│  │  🟡 Integration Reliability — Q1 2026             │    │
│  │  🟡 Critical Flow Test Coverage — Q2 2026         │    │
│  │  🟡 Secrets and Scope Audit — Q2 2026             │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─ Known Issues ───────────────────────────────────┐    │
│  │  ⚠ Validate no privileged keys in VITE_* vars    │    │
│  │  ⚠ OAuth scope least-privilege review needed      │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  $ $ $ $ (particle canvas behind everything)             │
└──────────────────────────────────────────────────────────┘
```

### Section Card Styling
Each section (Description, Tech Stack, Recent Changes, etc.) should be a card:
- `bg-white dark:bg-slate-800/80 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 backdrop-blur-sm p-6`
- Section title: `text-lg font-heading font-bold text-slate-900 dark:text-white mb-4`
- Content: `text-sm text-slate-600 dark:text-slate-300`

### Specific section rendering:

**Status Banner (top, full-width):**
- Large status dot + project name in `text-3xl font-heading font-extrabold`
- Below: phase badge, security status badge, last updated date — all inline
- URL as clickable link below that
- Background: slightly distinct — `bg-white/90 dark:bg-slate-800/90`

**Tech Stack:**
- Render ALL tech stack items as badges (not just first 4 like the card)
- Badge style: `px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm font-medium`

**Recent Changes:**
- Render as a timeline/list. Each entry: date in `font-semibold text-xs text-slate-400` above, summary text below
- If empty array, show "No recent changes recorded."

**What's Next (Next Steps):**
- Numbered list. Each item: number in emerald circle, text beside it
- If empty, show "No next steps defined."

**Roadmap:**
- Each milestone: status dot + milestone name + target date right-aligned
- If empty, show "No roadmap items defined."

**Known Issues:**
- Each issue prefixed with ⚠ icon
- If empty, show "No known issues — looking good!"

### Two-column layout for Recent Changes + What's Next
On desktop (`lg:`), these two sections sit side-by-side:
- `grid grid-cols-1 lg:grid-cols-2 gap-6`

All other sections are full-width stacked.

### Back Navigation
- Top-left: `← Back to Dashboard` using `<Link to="/">` (react-router, NOT `<a>`)
- Top-right: `Visit Site ↗` as external `<a>` link (only if `project.url` exists)

### 404 Handling
If `getProjectBySlug(slug)` returns `undefined`, render a simple centered message:
- "Project not found"
- `<Link to="/">← Back to Dashboard</Link>`
- No need for a fancy 404 page

## Steps

### Step 1: Create `components/ProjectDetailView.tsx`

One file. It must:
- Import `useParams`, `Link` from `react-router-dom`
- Import `getProjectBySlug`, `ProjectStatus` from `../src/config/projects`
- Extract `slug` from URL params via `useParams<{ slug: string }>()`
- Look up project via `getProjectBySlug(slug)`
- Handle not-found case (show "Project not found" + back link)
- Include the full passcode gate (copy from ProjectDashboard)
- Include the full floating $ particle canvas (copy from ProjectDashboard)
- Include the frosted glass header (copy from ProjectDashboard)
- Render all sections described above
- Support dark mode throughout

### Step 2: Update `App.tsx`

Add ONE new import and ONE new route:
```tsx
import ProjectDetailView from './components/ProjectDetailView';
```
Add route BEFORE the `*` fallback:
```tsx
<Route path="/project/:slug" element={<ProjectDetailView />} />
```

Do NOT change any existing routes.

### Step 3: Verify Build
```
cd D:\Non-RIA\dvo88
npm run build
```

### Step 4: Local Dev Test
```
npm run dev
```
Verify:
- Click "View Details →" on any card from `/` — detail page renders
- Status banner shows correct project data
- All sections render (description, tech stack, recent changes, next steps, roadmap, known issues)
- "← Back to Dashboard" returns to `/`
- "Visit Site ↗" opens external URL in new tab (where applicable)
- Navigate to `/project/nonexistent-slug` — shows "Project not found" message
- `/legacy`, `/dashboard`, `/calculator`, `/leo-ai` all still work

### Step 5: Commit & Push
```
git add -A
git commit -m "phase 2: project detail view with drill-down sections

- Create ProjectDetailView.tsx with status banner, description, tech stack,
  recent changes, next steps, roadmap, and known issues sections
- Wire /project/:slug route in App.tsx
- 404 handling for unknown slugs
- Two-column layout for changes + next steps on desktop
- Dark mode support throughout"
git push origin feature/project-dashboard
```

## Verification Checklist
- [ ] `npm run build` passes with zero errors
- [ ] `components/ProjectDetailView.tsx` exists and is the only new file
- [ ] `App.tsx` has route `/project/:slug` pointing to ProjectDetailView
- [ ] All existing routes unchanged (`/`, `/legacy`, `/dashboard`, `/calculator`, `/leo-ai`, `*`)
- [ ] Detail view shows: status banner with dot + name + phase + security + last updated + URL
- [ ] Detail view shows: description section
- [ ] Detail view shows: full tech stack as badges
- [ ] Detail view shows: recent changes as timeline/list
- [ ] Detail view shows: next steps as numbered list
- [ ] Detail view shows: roadmap with status dots and target dates
- [ ] Detail view shows: known issues with ⚠ prefix
- [ ] Empty arrays show appropriate placeholder text (not blank sections)
- [ ] "← Back to Dashboard" uses react-router `<Link to="/">`
- [ ] "Visit Site ↗" uses `<a>` with `target="_blank"` (only renders when url exists)
- [ ] `/project/nonexistent-slug` shows "Project not found" + back link
- [ ] Passcode gate works on the detail page
- [ ] Floating $ canvas renders behind content
- [ ] Dark mode classes present on all new elements
- [ ] Recent Changes + What's Next are side-by-side on desktop (`lg:grid-cols-2`)
- [ ] Commit pushed to `origin/feature/project-dashboard`

## Do NOT
- Do NOT modify `src/config/projects.ts`
- Do NOT modify `ProjectDashboard.tsx`
- Do NOT modify `LegacyLandingPage.tsx`
- Do NOT modify `DashboardApp.tsx`, `server/`, `api/`, or `vercel.json`
- Do NOT install new npm packages
- Do NOT extract shared layout components yet (that's Phase 4)
- Do NOT create the AI chat drawer (that's Phase 3)
- Do NOT change the Tailwind config in `index.html`
