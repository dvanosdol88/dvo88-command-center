import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CapacityCalculator from './components/miniapps/CapacityCalculator';

// Lazy load DashboardApp to prevent top-level crashes (e.g. missing Firebase config) from breaking the Landing Page
const DashboardApp = React.lazy(() => import('./DashboardApp'));

const Loading = () => <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calculator" element={<CapacityCalculator />} />
        <Route path="/dashboard" element={
          <Suspense fallback={<Loading />}>
            <DashboardApp />
          </Suspense>
        } />
        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
