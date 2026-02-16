import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CapacityCalculator from './components/miniapps/CapacityCalculator';

// Lazy load DashboardApp to prevent top-level crashes (e.g. missing Firebase config) from breaking the Landing Page
const DashboardApp = React.lazy(() => import('./DashboardApp'));
const LeoAiGate = React.lazy(() => import('./components/leo-ai/LeoAiGate'));

const DashboardLoading = () => <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;
const LeoAiLoading = () => <div className="p-10 text-center text-slate-500">Loading Leo AI...</div>;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CapacityCalculator />} />
        <Route path="/dashboard" element={
          <Suspense fallback={<DashboardLoading />}>
            <DashboardApp />
          </Suspense>
        } />
        <Route path="/leo-ai" element={
          <Suspense fallback={<LeoAiLoading />}>
            <LeoAiGate />
          </Suspense>
        } />
        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
