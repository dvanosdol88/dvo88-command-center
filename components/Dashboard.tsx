import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORIES, NARRATIVES } from '../constants';
import { VendorResult, WeightState } from '../types';
import GeminiPanel from './GeminiPanel';
import { Info } from 'lucide-react';

interface DashboardProps {
  weights: WeightState;
  onWeightChange: (id: string, value: number) => void;
  results: VendorResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ weights, onWeightChange, results }) => {
  const winner = results[0];
  const narrative = NARRATIVES[winner.name];

  // Cast Object.values(weights) to number[] to ensure correct type inference for reduce
  const totalWeight = (Object.values(weights) as number[]).reduce((a, b) => a + b, 0);
  const weightColor = Math.abs(totalWeight - 100) < 2 ? 'bg-emerald-600' : 'bg-rose-500';

  return (
    <div className="p-6 h-full grid grid-cols-12 gap-6 overflow-y-auto">
      {/* Sidebar: Tunable Weights */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
          <div className="mb-4 flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="text-accent-gold font-bold font-heading uppercase text-xs tracking-wider">Tunable Weights</h3>
            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${weightColor.replace('bg-emerald-600', 'bg-evergreen')}`}>
              {totalWeight}%
            </span>
          </div>

          <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex flex-col">
                <div className="flex justify-between text-[10px] uppercase text-slate-400 font-bold mb-1">
                  <span>{cat.name}</span>
                  <span>{weights[cat.id]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={weights[cat.id]}
                  onChange={(e) => onWeightChange(cat.id, parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-evergreen hover:accent-evergreen-light transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col gap-6">

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-accent-gold rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Info size={64} className="text-accent-gold" />
            </div>
            <span className="text-[10px] uppercase text-accent-gold tracking-wider font-bold font-heading">Projected Winner</span>
            <div className="text-3xl font-bold font-heading text-white mt-1">{winner.name}</div>
            <div className="text-sm text-accent-gold mt-1 opacity-90">Score: {winner.finalScore}/10</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col justify-center">
            <span className="text-[10px] uppercase text-accent-gold tracking-wider font-bold font-heading">Key Strength</span>
            <div className="text-lg font-semibold text-white mt-1 line-clamp-2">{narrative.pros[0]}</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col justify-center">
            <span className="text-[10px] uppercase text-accent-gold tracking-wider font-bold font-heading">Best For</span>
            <div className="text-sm font-semibold text-white mt-1 leading-tight">{narrative.bestFor}</div>
          </div>
        </div>

        {/* Gemini Panel */}
        <GeminiPanel winner={winner} weights={weights} allResults={results} />

        {/* Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={results}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 10]} hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 700, fontFamily: 'Montserrat' }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
              />
              <Bar dataKey="finalScore" radius={[0, 4, 4, 0]} barSize={32}>
                {results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#af8a49' : '#475569'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;