import React from 'react';
import { Link } from 'react-router-dom';
import { LEO_AI_CONFIG } from '../../src/config/leoAi';

type Props = {
  onLogout: () => void;
};

const LeoAiHome: React.FC<Props> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/40 dark:from-slate-950 dark:to-emerald-950/20 text-slate-900 dark:text-white">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-950/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-extrabold tracking-tight">
            {LEO_AI_CONFIG.ui.appName}
            <span className="text-emerald-700 dark:text-lime-500">.</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-lime-500 transition-colors"
            >
              Back to dvo88
            </Link>
            <button
              onClick={onLogout}
              className="text-sm font-bold px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Leo AI workspace
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl">
          This route is wired with its own login gate. Next step is plugging in the actual Leo AI UI.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40">
            <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              Status
            </div>
            <div className="mt-2 font-semibold">Ready</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Login is independent from `dvo88` landing gate.
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40">
            <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              Route
            </div>
            <div className="mt-2 font-semibold">#/leo-ai</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Change passcode/session key in `src/config/leoAi.ts`.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeoAiHome;

