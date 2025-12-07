import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, VENDORS } from './constants';
import { ViewState, WeightState, VendorResult } from './types';
import Dashboard from './components/Dashboard';
import VendorCards from './components/VendorCards';
import VendorDetail from './components/VendorDetail';
import Matrix from './components/Matrix';
import DependencyMap from './components/DependencyMap';
import ResearchView from './components/ResearchView';
import GoalDesignerView from './components/GoalDesignerView';
import ClientJourneyView from './components/ClientJourneyView';
import ChatWidget from './components/ChatWidget';
import { LayoutGrid, BarChart2, Table, Network, Save, Layers } from 'lucide-react';
import { addItem, subscribeToItems } from './services/db';

type ModuleState = 'vendors' | 'research' | 'goals' | 'journey';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleState>('vendors');
  const [activeVendorView, setActiveVendorView] = useState<ViewState>('dashboard');
  const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);

  // Initialize state with defaults
  const [weights, setWeights] = useState<WeightState>(() => {
    const defaults: WeightState = {};
    CATEGORIES.forEach(c => defaults[c.id] = c.defaultWeight * 100);
    return defaults;
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Real-time subscription to Firestore
  useEffect(() => {
    const unsubscribe = subscribeToItems('weights', (items: any[]) => {
      setWeights(prevWeights => {
        const newWeights = { ...prevWeights };
        // Apply updates from the database
        // Assuming items are appended updates: { categoryId: string, value: number }
        items.forEach(item => {
          if (item.categoryId && typeof item.value === 'number') {
            newWeights[item.categoryId] = item.value;
          }
        });
        return newWeights;
      });

      // Trigger save feedback
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    });

    return () => unsubscribe();
  }, []);

  // Calculate results based on current weights
  const results: VendorResult[] = useMemo(() => {
    const currentTotalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);

    const mapped = VENDORS.map(vendor => {
      let rawScore = 0;
      CATEGORIES.forEach((cat, index) => {
        const w = (weights[cat.id] || 0) / 100;
        const score = vendor.scores[index];
        rawScore += score * w;
      });

      const normalized = currentTotalWeight > 0
        ? (rawScore / (currentTotalWeight / 100))
        : 0;

      return {
        ...vendor,
        finalScore: parseFloat(normalized.toFixed(2))
      };
    });

    return mapped.sort((a, b) => b.finalScore - a.finalScore);
  }, [weights]);

  const handleWeightChange = async (id: string, value: number) => {
    // Instead of local state, write to Firebase
    try {
      await addItem('weights', { categoryId: id, value });
    } catch (error) {
      console.error("Error saving weight:", error);
    }
  };

  const selectedVendor = useMemo(() =>
    results.find(r => r.name === selectedVendorName),
    [results, selectedVendorName]);

  const TopNavButton = ({ id, label }: { id: ModuleState, label: string }) => (
    <button
      onClick={() => setActiveModule(id)}
      className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all ${activeModule === id
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      {label}
    </button>
  );

  const SubNavButton = ({ id, label, icon: Icon }: { id: ViewState, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveVendorView(id);
        setSelectedVendorName(null); // Clear detail view when switching main views
      }}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all w-16 group relative ${activeVendorView === id && !selectedVendorName
          ? 'text-blue-400 bg-blue-900/20 shadow-[inset_3px_0_0_0_#3b82f6]'
          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
        }`}
      title={label}
    >
      <Icon size={20} className={activeVendorView === id ? 'stroke-[2.5px]' : 'stroke-2'} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-900 text-slate-200">

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center font-bold text-white shadow">
            R
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">RIA COMMAND CENTER</h1>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
              Vendor Intelligence Module
              {saveStatus === 'saved' && (
                <span className="text-emerald-500 flex items-center gap-1 animate-fade-in">
                  <Save size={8} /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <nav className="flex gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
          <TopNavButton id="vendors" label="Vendors" />
          <TopNavButton id="research" label="AI Research" />
          <TopNavButton id="goals" label="Goal Designer" />
          <TopNavButton id="journey" label="Client Journey" />
        </nav>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Module Content */}
        {activeModule === 'vendors' && (
          <>
            {/* View Content */}
            <main className="flex-1 overflow-hidden relative bg-slate-900/50">

              {selectedVendor ? (
                <VendorDetail
                  vendor={selectedVendor}
                  weights={weights}
                  onBack={() => setSelectedVendorName(null)}
                />
              ) : (
                <>
                  {activeVendorView === 'dashboard' && (
                    <Dashboard
                      weights={weights}
                      onWeightChange={handleWeightChange}
                      results={results}
                    />
                  )}
                  {activeVendorView === 'cards' && (
                    <VendorCards
                      results={results}
                      weights={weights}
                      onSelectVendor={(v) => setSelectedVendorName(v.name)}
                    />
                  )}
                  {activeVendorView === 'matrix' && <Matrix />}
                  {activeVendorView === 'dependency' && <DependencyMap />}
                </>
              )}
            </main>

            {/* Right Sidebar Sub-navigation */}
            <aside className="w-20 bg-slate-950 border-l border-slate-800 flex flex-col items-center py-6 gap-2 z-20 shadow-xl">
              <div className="text-[10px] uppercase text-slate-600 font-bold mb-2 tracking-widest rotate-180 [writing-mode:vertical-rl] opacity-50">Views</div>
              <SubNavButton id="dashboard" label="Model" icon={LayoutGrid} />
              <SubNavButton id="cards" label="Cards" icon={BarChart2} />
              <SubNavButton id="matrix" label="Matrix" icon={Table} />
              <SubNavButton id="dependency" label="Map" icon={Network} />
            </aside>
          </>
        )}

        {activeModule === 'research' && (
          <ResearchView />
        )}

        {activeModule === 'goals' && (
          <GoalDesignerView />
        )}

        {activeModule === 'journey' && (
          <ClientJourneyView />
        )}

      </div>

      {/* Global Chat Widget */}
      <ChatWidget weights={weights} results={results} />

    </div>
  );
};

export default App;
