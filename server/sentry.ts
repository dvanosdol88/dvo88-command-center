import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Environment tag
  environment: process.env.NODE_ENV || "development",

  // Only send errors in production by default
  enabled: process.env.NODE_ENV === "production",
});

export default Sentry;
