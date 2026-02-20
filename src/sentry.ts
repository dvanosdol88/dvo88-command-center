import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  
  // Performance monitoring — capture 100% of transactions in dev, 20% in prod
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,

  // Session replay — captures what the user was doing when an error occurred
  replaysSessionSampleRate: 0.1,   // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% of sessions with errors

  // Environment tag so you can filter dev vs production in the dashboard
  environment: import.meta.env.DEV ? "development" : "production",

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Only send errors in production by default
  // Remove this line if you also want to see dev errors in Sentry
  enabled: import.meta.env.PROD,
});

export default Sentry;
