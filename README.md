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
All project status data is managed in `src/config/projects.ts`. Update this file to change project statuses, roadmaps, and known issues.

### AI Configuration
AI routing is configured in `src/config/ai.ts`. The project assistant context is built in `server/services/project-context.ts`.
