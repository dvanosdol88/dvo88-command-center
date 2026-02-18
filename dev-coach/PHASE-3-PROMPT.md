# Phase 3 — AI Chat with Project Context

## Context
Read `D:\CLAUDE.md` for project rules. Read `D:\Non-RIA\dvo88\dev-coach\DASHBOARD-IMPLEMENTATION-PLAN.md` for the full plan.

Phase 2 is complete on branch `feature/project-dashboard` (commit 01fe767). Current state:
- `/` → ProjectDashboard (7 cards)
- `/project/:slug` → ProjectDetailView (drill-down)
- `/api/ai/chat` exists and works (currently RIA vendor context only)
- `server/services/ai-router.ts` has `createAiRouter({ systemPromptExtra })` support
- `src/config/ai.ts` defines `AI_PERSONA` with a system prompt
- `services/geminiService.ts` has `requestAi()` that calls `/api/ai/chat`
- Build passes

## Objective
Add an AI chat drawer to the dashboard and detail views. The AI knows all 7 projects and can answer questions like "What should I work on next?", "What's the status of 672?", and "Summarize recent changes across everything."

This phase creates **3 new files** and modifies **2 existing files**.

## Architecture

```
User types message in ProjectChatDrawer
        ↓
POST /api/ai/chat  { messages, context: "projects" }
        ↓
server/routes.ts detects context === "projects"
        ↓
server/services/project-context.ts builds system prompt from PROJECTS config
        ↓
createAiRouter({ systemPromptExtra: projectContext })
        ↓
Response → drawer renders it
```

## Steps

### Step 1: Create `server/services/project-context.ts`

This file reads the PROJECTS array from `src/config/projects.ts` and builds a system prompt string. The server imports are fine since `src/config/projects.ts` is pure TypeScript with no browser-specific code.

```typescript
import { PROJECTS } from "../../src/config/projects.js";

export function buildProjectSystemPrompt(): string {
  const projectSummaries = PROJECTS.map((p) => {
    const statusEmoji = p.status === "green" ? "🟢" : p.status === "yellow" ? "🟡" : "🔴";
    return [
      `${statusEmoji} ${p.name} (${p.slug})`,
      `  Status: ${p.status} | Phase: ${p.phase} | Security: ${p.securityStatus}`,
      `  URL: ${p.url || "none"}`,
      `  Summary: ${p.oneLiner}`,
      `  Tech: ${p.techStack.join(", ")}`,
      `  Last Updated: ${p.lastUpdated}`,
      p.recentChanges.length > 0
        ? `  Recent Changes:\n${p.recentChanges.map((c) => `    - ${c.date}: ${c.summary}`).join("\n")}`
        : `  Recent Changes: none`,
      p.nextSteps.length > 0
        ? `  Next Steps:\n${p.nextSteps.map((s, i) => `    ${i + 1}. ${s}`).join("\n")}`
        : `  Next Steps: none`,
      p.roadmap.length > 0
        ? `  Roadmap:\n${p.roadmap.map((r) => `    - ${r.milestone} (${r.target}) [${r.status}]`).join("\n")}`
        : `  Roadmap: none`,
      p.knownIssues.length > 0
        ? `  Known Issues:\n${p.knownIssues.map((iss) => `    ⚠ ${iss}`).join("\n")}`
        : `  Known Issues: none`,
    ].join("\n");
  }).join("\n\n---\n\n");

  return `
You are a project management AI assistant for David's development portfolio.
You have complete knowledge of all active projects and their current state.

YOUR CAPABILITIES:
- Summarize status across all projects or a specific one
- Recommend what to work on next based on priorities, statuses, and known issues
- Answer questions about any project's tech stack, roadmap, issues, or recent changes
- Generate status reports (brief or detailed)
- Identify cross-project risks or patterns

RESPONSE STYLE:
- Be concise and actionable
- Use status indicators (🟢 🟡 🔴) when referencing project health
- When recommending priorities, explain your reasoning
- Reference specific project data (dates, issues, milestones) to back up your answers

CURRENT PORTFOLIO (${PROJECTS.length} projects):

${projectSummaries}
`.trim();
}
```

### Step 2: Create `services/projectChatService.ts`

This is the frontend service that sends messages to `/api/ai/chat` with `context: "projects"`. It's similar to the existing `geminiService.ts` but simpler and project-focused.

```typescript
type ApiChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface ProjectChatMessage {
  role: "user" | "assistant";
  text: string;
}

async function requestProjectAi(messages: ApiChatMessage[]): Promise<string> {
  const resp = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, context: "projects" }),
  });

  let data: any = null;
  try {
    data = await resp.json();
  } catch {
    data = null;
  }

  if (!resp.ok || !data?.ok) {
    const details = data?.cause ? `${data.error} (${data.cause})` : data?.error || "Unknown AI error";
    throw new Error(details);
  }

  return data?.response?.message?.content || "No response received.";
}

export async function getProjectChatResponse(
  history: ProjectChatMessage[],
  message: string,
): Promise<string> {
  const mappedHistory: ApiChatMessage[] = history.map((h) => ({
    role: h.role === "assistant" ? "assistant" : "user",
    content: h.text,
  }));

  return requestProjectAi([
    ...mappedHistory.slice(-12),
    { role: "user", content: message },
  ]);
}
```

### Step 3: Create `components/ProjectChatDrawer.tsx`

A slide-out chat panel. Design specs:

**Toggle button:** fixed bottom-right, emerald-themed (not indigo like the existing vendor chat):
- Closed: `bg-emerald-700 hover:bg-emerald-600 text-white` with a chat icon
- Open: `bg-slate-700 text-slate-300` with X icon
- Position: `fixed bottom-6 right-6 z-50`

**Drawer panel:**
- Fixed bottom-right, slides in from right
- `w-80 md:w-96` width, `max-h-[calc(100vh-120px)]`
- Background: `bg-slate-900 border border-slate-700 rounded-xl shadow-2xl`
- Same animation as existing ChatWidget: scale + opacity + translate transition

**Header:**
- Icon + "Project Assistant" title
- Subtitle: "Knows all 7 projects"
- Background: `bg-slate-900/95 backdrop-blur`

**Messages area:**
- User messages: right-aligned, `bg-emerald-900/50 text-white` (emerald themed, not slate)
- Assistant messages: left-aligned, `bg-emerald-900/20 text-slate-200 border border-emerald-500/20`
- User avatar: `bg-slate-700 text-slate-300` with User icon
- Assistant avatar: `bg-emerald-900/50 text-emerald-300` with Bot icon
- Loading: 3 bouncing dots in emerald-400

**Initial message:**
```
"Hello! I'm your project assistant. I know the current status of all 7 projects in your portfolio. Ask me anything — what to work on next, project status summaries, or cross-project insights."
```

**Input:**
- Placeholder: "Ask about your projects..."
- Emerald focus ring: `focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`
- Send button: `text-emerald-500 hover:text-emerald-400`

**Behavior:**
- Import from `lucide-react`: `MessageSquare`, `X`, `Send`, `User`, `Bot`
- Import `getProjectChatResponse` and `ProjectChatMessage` from `../services/projectChatService`
- Manage state: `isOpen`, `messages` (ProjectChatMessage[]), `input`, `loading`
- Auto-scroll to bottom on new messages
- Submit on Enter or click Send
- Disable send while loading
- Keep last 12 messages in history sent to API

**This component takes no props.** It's self-contained. No weights, no vendor results.

### Step 4: Modify `server/routes.ts`

Update the `/api/ai/chat` endpoint to support the new `context` field.

Changes needed:
1. Add `context` to the `chatSchema` zod validation:
   ```typescript
   context: z.enum(["vendors", "projects"]).optional(),
   ```
2. Import `buildProjectSystemPrompt` from `./services/project-context.js`
3. In the route handler, AFTER the zod parse succeeds, check `parsed.data.context`:
   ```typescript
   const systemPromptExtra =
     parsed.data.context === "projects" ? buildProjectSystemPrompt() : undefined;

   const router = createAiRouter({
     forceProvider: parsed.data.provider,
     systemPromptExtra,
   });
   ```

That's it for the server — the existing `createAiRouter` already supports `systemPromptExtra`. All other server behavior stays the same.

### Step 5: Modify `components/ProjectDashboard.tsx` and `components/ProjectDetailView.tsx`

Add the chat drawer to both components. At the bottom of each component's JSX (right before the closing `</div>`), add:

```tsx
import ProjectChatDrawer from './ProjectChatDrawer';

// ... at the end of the JSX, before the final closing </div>:
<ProjectChatDrawer />
```

This makes the chat available on both the dashboard grid and the detail view.

### Step 6: Verify Build
```
cd D:\Non-RIA\dvo88
npm run build
```
Fix any errors. Common issues:
- TypeScript may complain about the `.js` extension in `import ... from "../../src/config/projects.js"` — the `.js` extension IS correct for ESM module resolution. If the build system strips it, use the bare path without extension.
- If `zod`'s `.optional()` on the `context` field creates issues, try `.default("vendors")` instead.

### Step 7: Local Dev Test
```
npm run dev
```
Verify:
- Chat toggle button appears bottom-right on `/` (dashboard)
- Chat toggle button appears bottom-right on `/project/:slug` (detail view)
- Clicking opens the drawer with the initial greeting message
- Type "What should I work on next?" — should get a response referencing actual project data
- Type "Status of 672 Elm Street" — should get accurate project-specific response
- Type "Summarize all projects" — should get overview with status indicators
- Chat history is maintained within the drawer session
- Loading indicator (bouncing dots) shows while waiting
- Drawer closes with X button or toggle
- `/legacy` does NOT show the chat drawer (it's the old page)
- `/dashboard` vendor chat widget still works (it's a separate component)

### Step 8: Commit & Push
```
git add -A
git commit -m "phase 3: AI chat drawer with project portfolio context

- Create server/services/project-context.ts to build AI system prompt from all 7 projects
- Create services/projectChatService.ts for frontend API calls with context='projects'
- Create components/ProjectChatDrawer.tsx with emerald-themed slide-out chat panel
- Enhance /api/ai/chat to accept context field and inject project knowledge
- Add chat drawer to ProjectDashboard and ProjectDetailView
- AI can answer: status summaries, work priorities, project-specific questions"
git push origin feature/project-dashboard
```

## Verification Checklist
- [ ] `npm run build` passes with zero errors
- [ ] 3 new files exist: `server/services/project-context.ts`, `services/projectChatService.ts`, `components/ProjectChatDrawer.tsx`
- [ ] 2 files modified: `server/routes.ts` (context field + project prompt), `components/ProjectDashboard.tsx` (chat import), `components/ProjectDetailView.tsx` (chat import)
- [ ] `chatSchema` in routes.ts includes `context` field
- [ ] `buildProjectSystemPrompt()` includes all 7 projects with status, phase, changes, next steps, roadmap, issues
- [ ] Chat drawer renders on `/` (dashboard)
- [ ] Chat drawer renders on `/project/:slug` (detail view)
- [ ] Chat drawer does NOT render on `/legacy`
- [ ] Toggle button is emerald-themed (`bg-emerald-700`), not indigo
- [ ] Initial greeting message mentions "7 projects"
- [ ] Sending a message gets an AI response that references actual project data
- [ ] Loading indicator shows while waiting
- [ ] Chat history maintained within session
- [ ] Input placeholder says "Ask about your projects..."
- [ ] Existing vendor ChatWidget on `/dashboard` route still works
- [ ] All existing routes still work (`/`, `/legacy`, `/dashboard`, `/calculator`, `/leo-ai`, `/project/:slug`)
- [ ] Commit pushed to `origin/feature/project-dashboard`

## Do NOT
- Do NOT modify `src/config/projects.ts` (data layer is done)
- Do NOT modify `src/config/ai.ts` (AI_PERSONA stays as-is, we use systemPromptExtra)
- Do NOT modify `services/geminiService.ts` (vendor chat stays separate)
- Do NOT modify `components/ChatWidget.tsx` (vendor chat stays separate)
- Do NOT modify `LegacyLandingPage.tsx`
- Do NOT modify `DashboardApp.tsx` or `vercel.json`
- Do NOT install new npm packages
- Do NOT extract shared layout (that's Phase 4)
- Do NOT change the Tailwind config in `index.html`
