diff --git a/README.md b/README.md
index 1982e6ffbe2da66bbc5f853a1f14974598c0ac33..4299b42e7f8927c802d409305dec76ac9d1bf3ab 100644
--- a/README.md
+++ b/README.md
@@ -8,25 +8,31 @@ AI learning app: a guided "journey" experience for learning AI, backed by a simp
 2. Install deps:
    - You must set `NPM_TOKEN` (GitHub Packages) in your shell so `@dvanosdol88/ai-core` can install.
 3. Run:
 
 ```bash
 npm run dev
 ```
 
 - Web: `http://localhost:5173`
 - API: `http://localhost:5001/api/health`
 
 ## Vercel
 
 This project expects:
 - `NPM_TOKEN` (GitHub PAT with `read:packages` and typically `repo` because the package is private)
 - At least one AI provider key: `GEMINI_API_KEY` or `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
 
 `vercel.json` builds:
 - Frontend: `vite build` -> `dist/`
 - API: bundles `server/index.ts` -> `api/index.js` and rewrites `/api/*` to it
 
 ## Notes
 
 - Uploads are currently stored in-memory (good for local dev, not durable in serverless). Next step is adding persistent storage + real retrieval (embeddings).
 
+
+## Project Briefing Docs
+
+- `docs/PROJECT_BRIEF.md`: current structured snapshot of this project for AI-coach handoffs.
+- `docs/PROJECT_BRIEF_TEMPLATE.md`: reusable template for future project snapshots to keep updates uniform.
+
   