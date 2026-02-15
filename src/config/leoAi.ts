export const LEO_AI_CONFIG = {
  routePath: '/leo-ai',
  sessionStorageKey: 'leoAi:isAuthenticated',
  passcodeLength: 6,
  // NOTE: This is only a lightweight client-side gate (similar to LandingPage).
  // Change this value to whatever you want Leo AI's code to be.
  passcode: '212388',
  ui: {
    appName: 'Leo AI',
    loginTitle: 'Enter Passcode',
    loginSubtitle: 'Enter the 6-digit code to access Leo AI.',
  },
} as const;

