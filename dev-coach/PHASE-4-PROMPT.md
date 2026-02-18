# Phase 4 — Polish & Production Deploy

## Context
Read `D:\CLAUDE.md` for project rules. Read `D:\Non-RIA\dvo88\dev-coach\DASHBOARD-IMPLEMENTATION-PLAN.md` for the full plan.

Phase 3 is complete on branch `feature/project-dashboard` (commit 6ea3ef6). Current state:
- `/` → ProjectDashboard with 7 project cards + ProjectChatDrawer
- `/project/:slug` → ProjectDetailView with full drill-down + ProjectChatDrawer
- `/api/ai/chat` accepts `context: "projects"` and injects portfolio system prompt
- `/legacy`, `/dashboard`, `/calculator`, `/leo-ai` all still work
- Build passes

## Objective
Final polish pass, then merge to main and deploy to production. This phase has 4 goals:

1. **Extract shared layout** — DRY up the passcode gate, canvas, and header that are copy-pasted across 3 components
2. **Responsive & dark mode QA fixes** — address any layout issues on mobile or dark mode
3. **Update README**
4. **Merge and deploy**

## Steps

### Step 1: Extract Shared Layout Component

Create `components/SharedLayout.tsx`. This component wraps any page that needs the passcode gate, floating $ canvas, and frosted header.

**What to extract (move FROM ProjectDashboard.tsx INTO SharedLayout.tsx):**
- `isAuthenticated` state + `sessionStorage` check
- `passcode` state + `handlePasscodeChange` + `handleKeyDown` + `inputsRef`
- Passcode overlay JSX
- Canvas ref + full Particle class + canvas `useEffect` + `<canvas>` element
- Frosted glass header JSX
- The outer `<div className="min-h-screen ...">` wrapper

**SharedLayout accepts `children` as a prop and renders them in the `<main>` area.**

```tsx
interface SharedLayoutProps {
  children: React.ReactNode;
}
```

Structure:
```tsx
const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  // ... passcode state + logic
  // ... canvas ref + useEffect + Particle class

  return (
    <div className="min-h-screen flex flex-col relative ...">
      {/* Passcode Overlay */}
      {!isAuthenticated && ( ... )}

      {/* Canvas */}
      <div id="canvas-container" ...>
        <canvas ref={canvasRef} id="floatCanvas" />
      </div>

      {/* Header */}
      <header ...> ... </header>

      {/* Content */}
      <main className="flex-grow pt-28 pb-12 px-6 relative z-10">
        {children}
      </main>
    </div>
  );
};
```

**Then refactor ProjectDashboard.tsx:**
- Remove all passcode, canvas, and header code
- Wrap the card grid content in `<SharedLayout>` instead
- The component should now be MUCH shorter — just the title, subtitle, and card grid
- Keep the `<ProjectChatDrawer />` INSIDE the SharedLayout children (so it renders within the layout)

**Then refactor ProjectDetailView.tsx:**
- Same treatment — remove passcode, canvas, header
- Wrap content in `<SharedLayout>`
- Keep `<ProjectChatDrawer />` inside

**Do NOT refactor LegacyLandingPage.tsx** — it keeps its own copy (it's archived and won't be maintained).

After refactoring, verify that:
- ProjectDashboard.tsx is significantly shorter (should be ~100 lines or less, was ~384)
- ProjectDetailView.tsx is significantly shorter (should be ~200 lines or less, was ~454)
- SharedLayout.tsx contains all the shared UI (~200-250 lines)
- The rendered output is IDENTICAL to before the refactor

### Step 2: Add Error Boundary for Chat Drawer

Wrap `<ProjectChatDrawer />` in a simple error boundary so if the AI call fails hard, it doesn't crash the whole page. Add this to `components/ProjectChatDrawer.tsx` (or create a tiny wrapper):

At the top of ProjectChatDrawer, add a try-catch in the submit handler (if not already present). The existing code likely already has a try-catch — verify it does. If the `getProjectChatResponse` call throws, it should show an error message in the chat, NOT crash the component. For example:

```typescript
try {
  const responseText = await getProjectChatResponse(messages, userMsg);
  setMessages((prev) => [...prev, { role: "assistant", text: responseText }]);
} catch (error) {
  setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
}
```

If this pattern is already in place, skip this step.

### Step 3: Mobile Responsiveness Check

Review `ProjectDashboard.tsx` and `ProjectDetailView.tsx` for mobile layout. Verify these classes are present:

**Dashboard cards:**
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (should already be there)
- Container: `max-w-6xl mx-auto px-6`

**Detail view:**
- Status banner badges: should wrap on mobile (`flex flex-wrap`)
- Two-column grid: `grid grid-cols-1 lg:grid-cols-2 gap-6` (should already be there)
- Back/Visit Site row: `flex items-center justify-between gap-4`

**Header nav:**
- `hidden md:flex` on the nav (mobile hamburger not required for Phase 4 — items are hidden on mobile, which is fine for now)

**Chat drawer:**
- Toggle button: `fixed bottom-6 right-6` (should clear any content)
- Panel width: `w-80 md:w-96` (narrows on mobile)

If any of these are missing, add them. If they're all present, no changes needed.

### Step 4: Dark Mode Verification

The app uses `class` dark mode strategy (Tailwind config in `index.html` has `darkMode: 'class'`). Verify:
- SharedLayout wrapper div has dark mode classes
- All card backgrounds have `dark:` variants
- All text colors have `dark:` variants
- Status dots use Tailwind color classes (not custom hex) — these auto-support dark mode
- Chat drawer already has dark-friendly styles (`bg-slate-900` base)

If the system doesn't currently have a dark mode toggle visible on the new pages, that's OK — the DashboardApp has one but the new pages inherit from the system/browser preference. No need to add a toggle in Phase 4.

### Step 5: Loading States

Add a simple loading check to ProjectDetailView for when `getProjectBySlug` is called. Currently the project is looked up synchronously from config so there's no async loading state needed — but verify the 404 "Project not found" state renders cleanly and doesn't flash.

For the dashboard, if PROJECTS array is empty (shouldn't happen, but defensive), show a message: "No projects configured."

### Step 6: Update README.md

Update `D:\Non-RIA\dvo88\README.md` to reflect the new state of the app:

```markdown
<div align="center">
</div>

## dvo88.com — Project Command Center

This repo deploys to [dvo88.com](https://dvo88.com) via Vercel.

### Features
- **Dashboard** (`/`) — Traffic-light overview of all active projects
- **Project Details** (`/project/:slug`) — Full drill-down per project (status, tech stack, changes, roadmap, issues)
- **AI Assistant** — Chat drawer with full portfolio context for status summaries, priority recommendations, and cross-project insights
- **Legacy Landing** (`/legacy`) — Original dvo88.com landing page

### Also hosts
- Vendor Intelligence Dashboard (`/dashboard`)
- Capacity Calculator (`/calculator`)
- Leo AI (`/leo-ai`)

### Links to
1. LLC App — [672ElmStreet.com](https://672elmstreet.com)
2. Calculator — [youpaytoomuchforadvice.com](https://youpaytoomuchforadvice.com)
3. RIA Builder — [riabuilder.dvo88.com](https://riabuilder.dvo88.com)

### Project Data
All project status data is managed in `src/config/projects.ts`. Update this file to change project statuses, roadmaps, and known issues.

### AI Configuration
AI routing is configured in `src/config/ai.ts`. The project assistant context is built in `server/services/project-context.ts`.
```

### Step 7: Verify Build
```
cd D:\Non-RIA\dvo88
npm run build
```

### Step 8: Local Dev Final Test
```
npm run dev
```

Full smoke test:
- `/` renders dashboard with 7 cards (shared layout: passcode gate, canvas, header)
- Click any card → `/project/:slug` renders detail view (shared layout reused)
- Chat drawer works on both pages
- "← Back to Dashboard" returns to `/`
- `/legacy` still renders old landing page (NOT using SharedLayout)
- `/dashboard` vendor dashboard works (independent of changes)
- `/calculator` works
- `/leo-ai` works
- `/project/fake-slug` shows "Project not found"
- No console errors (warnings are OK)

### Step 9: Commit Polish
```
git add -A
git commit -m "phase 4: extract shared layout, polish, update README

- Extract SharedLayout component (passcode gate, canvas, header)
- Refactor ProjectDashboard and ProjectDetailView to use SharedLayout
- Verify error handling in chat drawer
- Update README with new feature documentation
- Production-ready polish pass"
git push origin feature/project-dashboard
```

### Step 10: Merge to Main & Deploy

```
git checkout main
git pull origin main
git merge feature/project-dashboard
git push origin main
```

After push, Vercel will auto-deploy from main. Wait for the deployment to complete.

### Step 11: Verify Production

Check the production deployment:
1. Visit https://dvo88.com — should show passcode gate, then dashboard
2. Enter passcode → 7 project cards should render
3. Click a card → detail view should load
4. Open chat drawer → send a message → get AI response
5. Visit https://dvo88.com/legacy — should show old landing page
6. Visit https://dvo88.com/dashboard — vendor dashboard works
7. Visit https://dvo88.com/api/health — should return JSON with status: "ok"

If production deploy succeeds, the feature is shipped.

## Verification Checklist
- [ ] `npm run build` passes with zero errors
- [ ] `components/SharedLayout.tsx` exists with passcode gate, canvas, and header
- [ ] `ProjectDashboard.tsx` uses `<SharedLayout>` wrapper (no duplicate passcode/canvas/header)
- [ ] `ProjectDetailView.tsx` uses `<SharedLayout>` wrapper (no duplicate passcode/canvas/header)
- [ ] `LegacyLandingPage.tsx` is NOT modified (keeps its own copy)
- [ ] Rendered output is identical to before the refactor
- [ ] Chat drawer error handling: failed AI calls show error message, don't crash
- [ ] Dashboard grid is responsive (1/2/3 columns)
- [ ] Detail view two-column layout works on desktop
- [ ] Dark mode classes present throughout
- [ ] README.md updated with new feature docs
- [ ] `feature/project-dashboard` merged to `main`
- [ ] Pushed to `origin/main`
- [ ] Vercel production deployment succeeds
- [ ] dvo88.com shows new dashboard after passcode
- [ ] dvo88.com/project/:slug shows detail view
- [ ] dvo88.com chat drawer returns AI responses
- [ ] dvo88.com/legacy shows old landing page
- [ ] dvo88.com/dashboard still works
- [ ] dvo88.com/api/health returns ok

## Do NOT
- Do NOT modify `src/config/projects.ts` or `src/config/ai.ts`
- Do NOT modify `server/services/project-context.ts` or `server/routes.ts`
- Do NOT modify `services/geminiService.ts` or `components/ChatWidget.tsx`
- Do NOT modify `DashboardApp.tsx` or `vercel.json`
- Do NOT install new npm packages
- Do NOT modify `LegacyLandingPage.tsx`
- Do NOT modify the Tailwind config in `index.html`
- Do NOT delete the `feature/project-dashboard` branch yet (keep it for reference)
