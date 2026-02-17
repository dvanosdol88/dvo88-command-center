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

export const PROJECTS: ProjectConfig[] = [
  {
    slug: "672-elm-street",
    name: "672 Elm Street",
    url: "https://672elmstreet.com",
    localPath: "D:\\Non-RIA\\672elmstreet",
    oneLiner:
      "Rental property operations and LLC finance dashboard with connected banking, docs, messaging, and AI assistant workflows.",
    status: "yellow",
    phase: "hardening",
    lastUpdated: "2026-02-15",
    techStack: [
      "React",
      "Vite",
      "Tailwind CSS",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Drizzle ORM",
      "Gemini",
      "OpenAI",
    ],
    healthCheckUrl: "https://672elmstreet.com/api/health",
    description:
      "Centralizes rent roll, loans, contacts, documents, and transaction visibility for day-to-day property operations.",
    recentChanges: [
      {
        date: "2026-02-15",
        summary:
          "Published AI coach baseline snapshot and standardized project context for future updates.",
      },
      {
        date: "2026-02-15",
        summary:
          "Documented integration readiness and security watch items across Plaid, Google, and Twilio paths.",
      },
    ],
    nextSteps: [
      "Harden integration reliability and diagnostics for Plaid, Google APIs, and AI providers.",
      "Increase test confidence for critical financial and sync workflows.",
      "Run recurring pre-release checks for env var exposure and OAuth scope least privilege.",
    ],
    roadmap: [
      {
        milestone: "Integration Reliability Hardening",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "Critical Flow Test Coverage",
        target: "2026-Q2",
        status: "yellow",
      },
      {
        milestone: "Secrets and Scope Audit Cadence",
        target: "2026-Q2",
        status: "yellow",
      },
    ],
    knownIssues: [
      "Validate that no privileged keys are exposed through VITE_* variables.",
      "Google/Plaid/Twilio scopes and token permissions need recurring least-privilege review.",
    ],
    securityStatus: "yellow",
  },
  {
    slug: "ria-marketing",
    name: "RIA Marketing Page",
    url: "https://youarepayingtoomuch.com",
    repoUrl: "https://github.com/dvanosdol88/ria-marketing-page",
    localPath: "D:\\RIA\\RIA-marketing-page",
    oneLiner:
      "Next.js marketing site with interactive fee-impact calculators to convert visitors into flat-fee advisory leads.",
    status: "yellow",
    phase: "maintenance",
    lastUpdated: "2026-02-15",
    techStack: [
      "Next.js App Router",
      "TypeScript",
      "React",
      "Tailwind CSS v4",
      "Recharts",
      "Framer Motion",
      "Vercel",
    ],
    description:
      "Educates prospects on long-term fee drag and supports conversion through interactive analysis and value proposition pages.",
    recentChanges: [
      {
        date: "2026-02-15",
        summary:
          "Hardened dependency governance with Renovate policy corrections and risk-lane controls.",
      },
      {
        date: "2026-02-15",
        summary:
          "Added standardized AI coach project snapshot baseline for repeatable handoffs.",
      },
    ],
    nextSteps: [
      "Define explicit test strategy for fee projection and URL-state parsing paths.",
      "Decide @vercel/kv migration or removal plan based on current usage.",
      "Add formal security section in README linking dependency and secrets policies.",
    ],
    roadmap: [
      {
        milestone: "Calculator Regression Test Coverage",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "@vercel/kv Migration Decision",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "Security and Ops Docs Hardening",
        target: "2026-Q2",
        status: "yellow",
      },
    ],
    knownIssues: [
      "@vercel/kv deprecation remains an open migration decision.",
      "No dedicated automated test suite currently defined in package scripts.",
    ],
    securityStatus: "yellow",
  },
  {
    slug: "ria-builder",
    name: "RIA Builder",
    url: "https://riabuilder.dvo88.com",
    localPath: "D:\\RIA\\RIA-builder",
    oneLiner:
      "Practice management and execution workspace for RIAs with AI-guided workflows and integration tooling.",
    status: "yellow",
    phase: "build",
    lastUpdated: "2026-02-15",
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Firebase Auth",
      "Firestore",
      "Firebase Functions",
      "Zustand",
      "Playwright",
    ],
    description:
      "Supports categorized idea management, docs, to-dos, launch readiness, and an AI consultant sidebar for advisory practice operations.",
    recentChanges: [
      {
        date: "2026-02-15",
        summary:
          "Published structured AI project brief from current README, package manifests, and backend/frontend entry points.",
      },
      {
        date: "2026-02-15",
        summary:
          "Continued iterative UI and e2e refinement across multi-view workspace flows.",
      },
    ],
    nextSteps: [
      "Decide whether Gemini usage should be fully server-proxied for key-management policy alignment.",
      "Add CI gates for lint and Playwright smoke coverage.",
      "Document Firestore collection assumptions and integration boundaries.",
    ],
    roadmap: [
      {
        milestone: "Security Checklist for Integration Changes",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "CI Smoke Validation",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "Observability and Release Standards",
        target: "2026-Q2",
        status: "yellow",
      },
    ],
    knownIssues: [
      "README still references VITE_GEMINI_API_KEY, which conflicts with stricter backend-only secret policy.",
      "Functions CORS config is permissive and needs production allowlist hardening.",
    ],
    securityStatus: "yellow",
  },
  {
    slug: "ai-leo",
    name: "AI Leo",
    url: "https://ai-leo.vercel.app",
    localPath: "D:\\Non-RIA\\ai-leo",
    oneLiner:
      "Guided AI learning app with multi-provider chat and lightweight knowledge-base uploads.",
    status: "yellow",
    phase: "build",
    lastUpdated: "2026-02-16",
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "Express",
      "ai-core",
      "Gemini",
      "OpenAI",
      "Anthropic",
      "Vercel",
    ],
    healthCheckUrl: "https://ai-leo.vercel.app/api/health",
    description:
      "Delivers a journey-style AI learning experience backed by provider-routed chat endpoints and upload-assisted content flows.",
    recentChanges: [
      {
        date: "2026-02-16",
        summary: "README now points to standardized project briefing docs for AI coach handoffs.",
      },
      {
        date: "2026-02-16",
        summary: "TODO: fill in latest feature and deployment updates from the formal AI Leo brief.",
      },
    ],
    nextSteps: [
      "Add durable storage and retrieval for uploads instead of in-memory-only handling.",
      "TODO: fill in prioritized roadmap items from the AI Leo project brief.",
    ],
    roadmap: [
      {
        milestone: "Persistent Upload Storage and Retrieval",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "TODO: fill in additional milestones",
        target: "TODO: fill in",
        status: "yellow",
      },
    ],
    knownIssues: [
      "Uploads are currently in-memory only and are not durable in serverless environments.",
      "TODO: fill in known reliability and security issues from AI Leo brief.",
    ],
    securityStatus: "yellow",
    notes:
      "No dedicated AI Leo snapshot was found in dev-coach; data inferred from README, vercel.json, and local metadata.",
  },
  {
    slug: "dvo88-hub",
    name: "dvo88.com Hub",
    url: "https://dvo88.com",
    localPath: "D:\\Non-RIA\\dvo88",
    oneLiner:
      "Portfolio command-center hub that links major products and hosts shared dashboard and utility routes.",
    status: "green",
    phase: "build",
    lastUpdated: "2026-02-16",
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind",
      "Express",
      "Vercel",
      "ai-core",
    ],
    healthCheckUrl: "https://dvo88.com/api/health",
    description:
      "Central hub for dvo88 properties with passcode-gated landing experience, calculator, vendor dashboard, and AI routes.",
    recentChanges: [
      {
        date: "2026-02-17",
        summary: "Project Command Center implementation plan created and Phase 0 initiated.",
      },
      {
        date: "2026-02-17",
        summary: "TODO: fill in latest production changes from ongoing dashboard phases.",
      },
    ],
    nextSteps: [
      "Ship Phase 1 dashboard landing cards and wire root route to the new command center view.",
      "TODO: fill in additional priorities after Phase 1/2 implementation.",
    ],
    roadmap: [
      {
        milestone: "Dashboard Landing Page (Phase 1)",
        target: "2026-Q1",
        status: "yellow",
      },
      {
        milestone: "Project Detail Views and AI Context Drawer",
        target: "2026-Q1",
        status: "yellow",
      },
    ],
    knownIssues: [
      "TODO: fill in known issues for hub-level routing, auth gate, and deployment workflow.",
    ],
    securityStatus: "yellow",
    notes:
      "No dedicated dvo88 hub snapshot was found in dev-coach; core metadata inferred from repo files and implementation plan.",
  },
  {
    slug: "ai-core",
    name: "ai-core",
    url: "https://github.com/dvanosdol88/ai-core",
    repoUrl: "https://github.com/dvanosdol88/ai-core",
    localPath: "D:\\Non-RIA\\ai-core",
    oneLiner:
      "Shared TypeScript AI runtime package for provider routing, tool calling, and knowledge-base interfaces.",
    status: "green",
    phase: "maintenance",
    lastUpdated: "2026-02-15",
    techStack: ["TypeScript", "Node.js", "GitHub Packages", "GitHub Actions"],
    description:
      "Maintained shared package consumed by multiple apps to keep AI provider logic and interfaces consistent.",
    recentChanges: [
      {
        date: "2026-02-15",
        summary: "Published version 0.1.2 for downstream app consumption.",
      },
      {
        date: "2026-02-15",
        summary: "TODO: fill in recent architecture or API changes from ai-core brief.",
      },
    ],
    nextSteps: [
      "Maintain semver release discipline across dependent apps.",
      "TODO: fill in next maintenance priorities from ai-core project brief.",
    ],
    roadmap: [
      {
        milestone: "Provider Routing Stability",
        target: "2026-Q2",
        status: "green",
      },
      {
        milestone: "TODO: fill in additional ai-core milestones",
        target: "TODO: fill in",
        status: "yellow",
      },
    ],
    knownIssues: [
      "TODO: fill in known issues from ai-core maintenance log.",
    ],
    securityStatus: "yellow",
    notes: "No dedicated ai-core snapshot was found in dev-coach; data inferred from README and package metadata.",
  },
  {
    slug: "masterworks-scanner",
    name: "Masterworks Scanner",
    localPath: "D:\\Non-RIA\\masterworks-scanner",
    oneLiner:
      "Local Python automation that scans the Masterworks trading bulletin for high discount-to-NAV opportunities.",
    status: "green",
    phase: "maintenance",
    lastUpdated: "2026-01-14",
    techStack: ["Python", "Playwright", "APScheduler", "CSV exports"],
    description:
      "Automates authenticated bulletin scraping, discount calculations, and CSV export for ranked opportunity review.",
    recentChanges: [
      {
        date: "2026-01-14",
        summary: "Scanner workflow and auth helpers updated for current scraping flow.",
      },
      {
        date: "2026-01-14",
        summary: "TODO: fill in latest maintenance changes from scanner runbook.",
      },
    ],
    nextSteps: [
      "Add selector and parsing regression checks for bulletin UI changes.",
      "TODO: fill in operational priorities for scheduling and alerting.",
    ],
    roadmap: [
      {
        milestone: "Stability Hardening for Login and Table Parsing",
        target: "2026-Q2",
        status: "yellow",
      },
      {
        milestone: "TODO: fill in additional scanner milestones",
        target: "TODO: fill in",
        status: "yellow",
      },
    ],
    knownIssues: [
      "Authentication sessions expire and require manual auth_setup refresh.",
      "TODO: fill in known production-like issues for scheduled runs.",
    ],
    securityStatus: "yellow",
    notes:
      "No dedicated masterworks scanner brief was found in dev-coach; data inferred from README and repository files.",
  },
];

export function getProjectBySlug(slug: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
