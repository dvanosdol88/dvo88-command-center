# DVO88 Project Backlog

> Priority: P0 (critical) > P1 (high) > P2 (medium) > P3 (low)
> Status: `[ ]` pending | `[~]` in progress | `[x]` done

---

## P0 - Critical

### Telemetry & Analytics Implementation
> Source: [Marketing and Error tracking- Telemetry - Sentry - PostHog.md](./Marketing%20and%20Error%20tracking-%20Telemetry%20-%20Sentry%20-%20PostHog.md)

- [ ] **Sentry Integration (Error & Performance Monitoring)**
  - Sentry project already exists: [dvo88 on Sentry](https://dvo-inc.sentry.io/settings/dvo-inc/projects/dvo88/)
  - Wire up client-side error tracking (`src/sentry.ts` exists but needs integration)
  - Wire up server-side error tracking (`server/sentry.ts` exists but needs integration)
  - Verify errors are flowing to Sentry dashboard

- [ ] **Product Analytics Setup (PostHog or Plausible)**
  - Choose analytics provider (PostHog recommended for event tracking + session replays; Plausible for lightweight privacy-first)
  - Install and configure SDK
  - Define "Rule of 5" core events:
    1. `site_visited` (auto)
    2. `core_value_action` (e.g., calculator used, key feature engaged)
    3. `commitment_signal` (e.g., pricing viewed, email submitted)
    4. `conversion` (e.g., call booked, checkout completed)
  - Instrument the core events across the app

---

## P1 - High

_(empty - add items as needed)_

---

## P2 - Medium

_(empty - add items as needed)_

---

## P3 - Low

_(empty - add items as needed)_

---

## Done

_(completed items move here)_
