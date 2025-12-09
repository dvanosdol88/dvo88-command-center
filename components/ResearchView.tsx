import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ArrowDown, Database, Brain, Layers, ShieldCheck, Clock, Server } from 'lucide-react';
import FileManager from './FileManager';


const radarData = [
    { subject: 'API Openness', wb: 9, rc: 8, rt: 7, fp: 7 },
    { subject: 'Native AI', wb: 5, rc: 6, rt: 4, fp: 9 },
    { subject: 'Customizability', wb: 8, rc: 7, rt: 6, fp: 6 },
    { subject: 'Data Portability', wb: 9, rc: 8, rt: 7, fp: 7 },
    { subject: 'Innovation', wb: 8, rc: 9, rt: 5, fp: 9 },
];

const efficiencyData = [
    { name: 'Newsletter', ai: 30, saved: 210 },
    { name: 'Meeting Prep', ai: 5, saved: 40 },
    { name: 'Outreach', ai: 2, saved: 13 },
    { name: 'Routine Q&A', ai: 5, saved: 25 },
];

const ResearchView: React.FC = () => {
    return (
        <div className="h-full overflow-y-auto bg-slate-900 p-6 pb-24 text-slate-200">

            {/* Header */}
            <header className="max-w-6xl mx-auto mb-12 border-b border-slate-700 pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">The AI-Powered RIA</h1>
                        <p className="text-xl text-cyan-400 font-light">Architecting the "Digital Twin" Ecosystem</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Target Architecture</p>
                        <p className="font-bold text-white text-sm">Hybrid: Vendor Core + Custom AI Layer</p>
                    </div>
                </div>
                <p className="mt-6 text-slate-400 max-w-3xl text-lg leading-relaxed">
                    Integrating advanced custom AI agents ("David's Twin") with industry-standard RIA platforms requires a strategic "Build & Integrate" approach. This analysis maps vendor API readiness and the technical path to your vision.
                </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Section 1: Vendor Landscape */}
                <div className="lg:col-span-12 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">1. Vendor AI Readiness & API Ecosystem</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <p className="text-slate-300 leading-relaxed text-sm">
                                To implement a "Digital Twin" that accesses client data and history, the underlying platform must offer robust <strong>APIs</strong>.
                                <br /><br />
                                <strong>Wealthbox</strong> stands out for its modern, open API architecture, making it the easiest CRM to build custom AI tools on top of. <strong>FP Alpha</strong> is already an AI leader for document reading.
                            </p>
                            <div className="bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                                <p className="text-xs text-blue-400 font-bold uppercase mb-1">Key Insight</p>
                                <p className="text-sm text-blue-200">You don't need the vendor to build the "Twin". You need the vendor to give you the DATA to feed your Twin. API Score is critical.</p>
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[400px]">
                                <h3 className="text-sm font-bold text-slate-400 text-center mb-4 uppercase tracking-wider">Vendor Capability Matrix</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                        <Radar name="Wealthbox" dataKey="wb" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                                        <Radar name="RightCapital" dataKey="rc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        <Radar name="Redtail" dataKey="rt" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                                        <Radar name="FP Alpha" dataKey="fp" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                            itemStyle={{ fontSize: '12px' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Logic Engine Flowchart */}
                <div className="lg:col-span-12 mb-8 bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">2. The "Digital Twin" Logic Engine</h2>
                    <p className="mb-10 text-slate-400 max-w-4xl text-sm">
                        How "David (The AI)" answers client questions safely. This custom middleware sits between your client interface and your compliance archive.
                    </p>

                    <div className="relative w-full max-w-4xl mx-auto h-[450px]">
                        {/* Level 1 */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-700 border border-slate-600 rounded-lg text-center z-10 shadow-lg">
                            <div className="text-white font-bold text-sm">Client Asks Question</div>
                            <div className="text-xs text-slate-400">"Can I retire early?"</div>
                        </div>

                        {/* Conn 1 */}
                        <div className="absolute top-[50px] left-1/2 w-px h-8 bg-slate-500"></div>

                        {/* Level 2 */}
                        <div className="absolute top-[82px] left-1/2 -translate-x-1/2 w-full flex justify-center gap-8">
                            <div className="w-48 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-center">
                                <Database className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                                <div className="text-cyan-100 font-bold text-xs">Context Retrieval</div>
                                <div className="text-[10px] text-cyan-300/70">Fetch CRM/Plan Data</div>
                            </div>
                            <div className="w-48 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-center">
                                <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                                <div className="text-cyan-100 font-bold text-xs">Compliance Guard</div>
                                <div className="text-[10px] text-cyan-300/70">Check Permitted Topics</div>
                            </div>
                        </div>

                        {/* Conn 2 */}
                        <div className="absolute top-[140px] left-1/2 w-px h-8 bg-slate-500"></div>
                        <div className="absolute top-[172px] left-[20%] right-[20%] h-px bg-slate-500"></div>
                        <div className="absolute top-[172px] left-[20%] w-px h-6 bg-slate-500"></div>
                        <div className="absolute top-[172px] left-1/2 w-px h-6 bg-slate-500"></div>
                        <div className="absolute top-[172px] right-[20%] w-px h-6 bg-slate-500"></div>

                        {/* Level 3: Scenarios */}
                        <div className="absolute top-[196px] w-full flex justify-between px-4 md:px-16">
                            {/* A */}
                            <div className="flex flex-col items-center w-1/3">
                                <div className="w-full max-w-[160px] p-2 bg-emerald-900/20 border border-emerald-500/30 rounded text-center mb-4">
                                    <div className="text-emerald-100 font-bold text-xs">Scenario A: Factual</div>
                                </div>
                                <ArrowDown size={16} className="text-emerald-500 mb-2" />
                                <div className="w-full max-w-[160px] p-3 bg-emerald-600 rounded text-center shadow-lg shadow-emerald-900/40">
                                    <div className="text-white font-bold text-xs">AI Full Answer</div>
                                    <div className="text-[10px] text-emerald-100">Instant + Log</div>
                                </div>
                            </div>
                            {/* B */}
                            <div className="flex flex-col items-center w-1/3">
                                <div className="w-full max-w-[160px] p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-center mb-4">
                                    <div className="text-yellow-100 font-bold text-xs">Scenario B: Nuanced</div>
                                </div>
                                <ArrowDown size={16} className="text-yellow-500 mb-2" />
                                <div className="w-full max-w-[160px] p-3 bg-yellow-600 rounded text-center shadow-lg shadow-yellow-900/40">
                                    <div className="text-white font-bold text-xs">Partial + Draft</div>
                                    <div className="text-[10px] text-yellow-100">Drafts email for David</div>
                                </div>
                            </div>
                            {/* C */}
                            <div className="flex flex-col items-center w-1/3">
                                <div className="w-full max-w-[160px] p-2 bg-rose-900/20 border border-rose-500/30 rounded text-center mb-4">
                                    <div className="text-rose-100 font-bold text-xs">Scenario C: Complex</div>
                                </div>
                                <ArrowDown size={16} className="text-rose-500 mb-2" />
                                <div className="w-full max-w-[160px] p-3 bg-rose-600 rounded text-center shadow-lg shadow-rose-900/40">
                                    <div className="text-white font-bold text-xs">Strict Deferral</div>
                                    <div className="text-[10px] text-rose-100">"I've alerted David"</div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-0 w-full p-3 bg-slate-900/50 border border-slate-700 rounded text-center text-[10px] text-slate-500 font-mono">
                            Compliance Archiving Layer: Every interaction (Input, Logic, Output) is hashed and stored in immutable WORM storage.
                        </div>
                    </div>
                </div>

                {/* Section 3: Tech Stack */}
                <div className="lg:col-span-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-full">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Server size={20} className="text-cyan-400" />
                            3a. Tech Stack Ownership
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                            To maintain "control of your destiny," you cannot rely solely on the vendor's internal database. You build a <strong>Data Lake</strong> that you own.
                        </p>
                        <div className="space-y-6">
                            <div className="border-l-4 border-slate-500 pl-4">
                                <h4 className="font-bold text-slate-200 text-sm">1. Source Systems (APIs)</h4>
                                <p className="text-xs text-slate-500 mt-1">Wealthbox, RightCapital, Custodian. We pull data via REST APIs.</p>
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-bold text-blue-400 text-sm">2. Your Secure Data Warehouse</h4>
                                <p className="text-xs text-slate-500 mt-1">An encrypted database (AWS/Azure) where you unify client profiles. <strong>You own this.</strong></p>
                            </div>
                            <div className="border-l-4 border-emerald-500 pl-4">
                                <h4 className="font-bold text-emerald-400 text-sm">3. Intelligence Layer (LLM)</h4>
                                <p className="text-xs text-slate-500 mt-1">OpenAI/Anthropic/Gemini API wrapped in a privacy container. Reads YOUR Warehouse, not the web.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Feasibility */}
                <div className="lg:col-span-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-full">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Brain size={20} className="text-purple-400" />
                            3b. Feasibility & Roadmap
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center shrink-0">🔐</div>
                                <div>
                                    <strong className="text-sm text-slate-200 block mb-1">Security & Privacy</strong>
                                    <p className="text-xs text-slate-400">Enterprise LLM APIs do not train on your data. PII can be masked before sending to the AI.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center shrink-0">⚙️</div>
                                <div>
                                    <strong className="text-sm text-slate-200 block mb-1">Integration Difficulty</strong>
                                    <p className="text-xs text-slate-400">Moderate. Wealthbox/RedTail have APIs. "Real-time" portfolio values usually require a bridge like Yodlee.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center shrink-0">🤖</div>
                                <div>
                                    <strong className="text-sm text-slate-200 block mb-1">"David" Assistant</strong>
                                    <p className="text-xs text-slate-400">Building a chat interface is easy. The hard part is connecting it reliably to planning scenarios in RightCapital.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Section 5: ROI */}
                <div className="lg:col-span-12 mt-4">
                    <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-cyan-500 pl-4">4. CRM Automation ROI</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                                Implementing the "AI Meeting Cadence" and "AI Newsletter" allows you to scale service without scaling headcount. By automating the data gathering and drafting phases, you focus purely on the relationship.
                            </p>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-cyan-400">~15 Hrs</span>
                                    <span className="text-sm text-cyan-200 uppercase font-bold tracking-wider">Saved Per Month</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">Assuming 500 clients, quarterly cadence. AI handles the "Zero Draft" of all outreach.</p>
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[350px]">
                            <h3 className="text-sm font-bold text-slate-400 text-center mb-4 uppercase tracking-wider">Time Expenditure: Manual vs AI</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={efficiencyData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="ai" name="Time Spent (AI)" stackId="a" fill="#06b6d4" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="saved" name="Time Saved" stackId="a" fill="#334155" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Conclusion */}
                <div className="lg:col-span-12 mt-8 mb-8">
                    <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Final Verdict: Build vs. Buy?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-lg font-bold text-cyan-400 mb-2 border-b border-cyan-500/30 pb-2">Buy (The Foundation)</h3>
                                <p className="text-cyan-100 text-sm leading-relaxed">
                                    Use <strong>Wealthbox</strong> for CRM (due to API) and <strong>RightCapital</strong> for Planning (modern UI). Use <strong>FP Alpha</strong> for immediate AI analysis. Do not build a CRM from scratch.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-purple-400 mb-2 border-b border-purple-500/30 pb-2">Build (The Edge)</h3>
                                <p className="text-purple-100 text-sm leading-relaxed">
                                    Build the <strong>"Intelligence Layer"</strong>. Use Python/LangChain to connect Wealthbox APIs to an LLM. Create the "Meeting Prep" agent that scrapes Wealthbox for recent notes and drafts the agenda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 6: Research Library */}
                <div className="lg:col-span-12 mt-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-indigo-500 pl-4">5. Research Library</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            Central repository for whitepapers, compliance notes, and architecture diagrams.
                        </p>
                        <FileManager type="research" />
                    </div>
                </div>

            </main>

        </div>
    );
};

export default ResearchView;
