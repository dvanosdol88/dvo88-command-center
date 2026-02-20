import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LegacyLandingPage from './components/LegacyLandingPage';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectDetailView from './components/ProjectDetailView';
import CapacityCalculator from './components/miniapps/CapacityCalculator';
import CommandCenterLayout from './components/CommandCenterLayout';
import CommandCenter from './components/CommandCenter';
import ErrorTriagePanel from './components/ErrorTriagePanel';

// Lazy load DashboardApp to prevent top-level crashes
const DashboardApp = React.lazy(() => import('./DashboardApp'));
const LeoAiGate = React.lazy(() => import('./components/leo-ai/LeoAiGate'));

const DashboardLoading = () => (
  <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>
);
const LeoAiLoading = () => (
  <div className="p-10 text-center text-slate-500">Loading Leo AI...</div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── NEW: Command Center (Concept A) ── */}
        <Route
          path="/"
          element={
            <CommandCenterLayout>
              <CommandCenter />
            </CommandCenterLayout>
          }
        />

        {/* Project detail — also inside Command Center shell */}
        <Route
          path="/project/:slug"
          element={
            <CommandCenterLayout>
              <ProjectDetailView />
            </CommandCenterLayout>
          }
        />

        {/* Error triage — inside Command Center shell */}
        <Route
          path="/error-triage"
          element={
            <CommandCenterLayout>
              <ErrorTriagePanel />
            </CommandCenterLayout>
          }
        />

        {/* ── Legacy / standalone routes ── */}
        <Route path="/legacy" element={<LegacyLandingPage />} />
        <Route path="/old-dashboard" element={<ProjectDashboard />} />
        <Route path="/calculator" element={<CapacityCalculator />} />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<DashboardLoading />}>
              <DashboardApp />
            </Suspense>
          }
        />
        <Route
          path="/leo-ai"
          element={
            <Suspense fallback={<LeoAiLoading />}>
              <LeoAiGate />
            </Suspense>
          }
        />
        <Route path="*" element={<LegacyLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
