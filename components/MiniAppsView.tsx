import React, { useState } from 'react';
import { Target, Map, Calculator } from 'lucide-react';
import GoalDesignerView from './GoalDesignerView';
import ClientJourneyView from './ClientJourneyView';
import CapacityCalculator from './miniapps/CapacityCalculator';

type MiniApp = 'goals' | 'journey' | 'calculator';

const MiniAppsView: React.FC = () => {
    const [activeApp, setActiveApp] = useState<MiniApp>('goals');

    const NavButton = ({ id, label, icon: Icon }: { id: MiniApp, label: string, icon: any }) => (
        <button
            onClick={() => setActiveApp(id)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-2 ${activeApp === id
                ? 'border-accent-gold bg-slate-800 text-white'
                : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
        >
            <Icon size={18} className={activeApp === id ? 'text-accent-gold' : 'text-slate-500'} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    return (
        <div className="flex h-full animate-fade-in">
            {/* Left Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col pt-6 z-10 shrink-0">
                <div className="px-6 mb-6">
                    <h2 className="text-xs uppercase font-bold text-slate-500 font-heading tracking-wider">Mini Applications</h2>
                </div>
                <nav className="flex-1 space-y-1">
                    <NavButton id="goals" label="Goal Designer" icon={Target} />
                    <NavButton id="journey" label="Client Journey" icon={Map} />
                    <NavButton id="calculator" label="Capacity Calculator" icon={Calculator} />
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden bg-slate-900/50 relative">
                {activeApp === 'goals' && (
                    <div className="h-full overflow-y-auto">
                        <GoalDesignerView />
                    </div>
                )}
                {activeApp === 'journey' && (
                    <div className="h-full overflow-y-auto">
                        <ClientJourneyView />
                    </div>
                )}
                {activeApp === 'calculator' && (
                    <div className="h-full overflow-hidden">
                        <CapacityCalculator />
                    </div>
                )}
            </main>
        </div>
    );
};

export default MiniAppsView;
