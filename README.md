<div align="center">
</div>

## dvo88.com - Project Command Center

This repo deploys to [dvo88.com](https://dvo88.com) via Vercel.

### Features
- **Dashboard** (`/`) - Traffic-light overview of all active projects
- **Project Details** (`/project/:slug`) - Full drill-down per project (status, tech stack, changes, roadmap, issues)
- **AI Assistant** - Chat drawer with full portfolio context for status summaries, priority recommendations, and cross-project insights
- **Legacy Landing** (`/legacy`) - Original dvo88.com landing page

### Also hosts
- Vendor Intelligence Dashboard (`/dashboard`)
- Capacity Calculator (`/calculator`)
- Leo AI (`/leo-ai`)

### Links to
1. LLC App - [672ElmStreet.com](https://672elmstreet.com)
2. Calculator - [youpaytoomuchforadvice.com](https://youpaytoomuchforadvice.com)
3. RIA Builder - [riabuilder.dvo88.com](https://riabuilder.dvo88.com)

### Project Data
Base project status data is managed in `src/config/projects.ts`.
Dynamic last-updated overrides are written to `src/config/projectLastUpdatedOverrides.json`.

### Scheduled Last-Updated Sync
- Source mapping for sync is `src/config/projectUpdateSources.json`.
- `.github/workflows/sync-project-last-updated.yml` runs hourly and on manual dispatch, then executes `scripts/sync-project-last-updated.mjs`.
- The script queries GitHub commits for configured repos and updates `src/config/projectLastUpdatedOverrides.json`.
- Workflow auth assumes GitHub Actions default `GITHUB_TOKEN` is available with `contents: write` permission (no extra secret required unless you choose to override token behavior).

### Webhook Fast Path
- `POST /api/projects/github-webhook` accepts GitHub `push` events and updates in-memory timestamp overrides immediately.
- `GET /api/projects/last-updated` returns merged timestamps (base config + committed overrides + in-memory webhook overrides) for card rendering.
- Set `GITHUB_WEBHOOK_SECRET` to enforce `x-hub-signature-256` verification for webhook requests.

### AI Configuration
AI routing is configured in `src/config/ai.ts`. The project assistant context is built in `server/services/project-context.ts`.
