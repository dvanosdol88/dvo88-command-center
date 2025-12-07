import React, { useState, useEffect } from 'react';
import { VendorResult, WeightState } from '../types';
import { NARRATIVES, CATEGORIES } from '../constants';
import { ArrowLeft, Save, Sparkles, Check, X, Loader2, ZoomIn, XIcon } from 'lucide-react';
import { getVendorInsight } from '../services/geminiService';

interface VendorDetailProps {
    vendor: VendorResult;
    weights: WeightState;
    onBack: () => void;
}

// Image Modal Component
const ImageModal: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-8 animate-fade-in"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-blue-400 transition z-10"
            >
                <XIcon size={32} />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-[200%] max-h-[200%] object-contain rounded-lg shadow-2xl"
                style={{ transform: 'scale(2)' }}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// Vendor screenshot mapping
const VENDOR_SCREENSHOTS: Record<string, string[]> = {
    "RightCapital": ["/uploaded_image_1765143260406.png"]
};

const VendorDetail: React.FC<VendorDetailProps> = ({ vendor, weights, onBack }) => {
    const narrative = NARRATIVES[vendor.name];

    // Persistent Notes State
    const [notes, setNotes] = useState(() => {
        return localStorage.getItem(`vendor_notes_${vendor.name}`) || '';
    });
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // AI Insight State
    const [insight, setInsight] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    // Image Modal State
    const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (notes !== localStorage.getItem(`vendor_notes_${vendor.name}`)) {
                setSaveStatus('saving');
                localStorage.setItem(`vendor_notes_${vendor.name}`, notes);
                setTimeout(() => setSaveStatus('saved'), 500);
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [notes, vendor.name]);

    const handleGetInsight = async () => {
        setLoadingInsight(true);
        const text = await getVendorInsight(vendor, weights);
        setInsight(text);
        setLoadingInsight(false);
    };

    const handleImageClick = (src: string, alt: string) => {
        setEnlargedImage({ src, alt });
    };

    const screenshots = VENDOR_SCREENSHOTS[vendor.name] || [];

    return (
        <>
            <div className="h-full bg-slate-900 flex flex-col animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">{vendor.name}</h2>
                            <div className="text-xs text-slate-400">Vendor Detail & Analysis</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold text-slate-500">Match Score</div>
                            <div className="text-2xl font-bold text-blue-400">{vendor.finalScore}<span className="text-sm text-slate-600">/10</span></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Screenshot Gallery */}
                        {screenshots.length > 0 && (
                            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                                <h3 className="text-xs uppercase font-bold text-blue-400 mb-4">Screenshots & Visuals</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {screenshots.map((screenshot, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-video bg-slate-900/50 rounded-lg border-2 border-slate-700 overflow-hidden group cursor-zoom-in"
                                            onClick={() => handleImageClick(screenshot, `${vendor.name} Screenshot ${index + 1}`)}
                                        >
                                            <img
                                                src={screenshot}
                                                alt={`${vendor.name} Screenshot ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Column: Stats & Narrative */}
                            <div className="space-y-6">

                                {/* Best For Card */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                                    <h3 className="text-xs uppercase font-bold text-blue-400 mb-2">Best For</h3>
                                    <p className="text-slate-200 italic">{narrative.bestFor}</p>
                                </div>

                                {/* Pros/Cons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                        <h4 className="text-xs uppercase font-bold text-emerald-500 mb-3 flex items-center gap-2">
                                            <Check size={14} /> Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {narrative.pros.map((p, i) => (
                                                <li key={i} className="text-xs text-slate-300 leading-snug">• {p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                        <h4 className="text-xs uppercase font-bold text-rose-500 mb-3 flex items-center gap-2">
                                            <X size={14} /> Weaknesses
                                        </h4>
                                        <ul className="space-y-2">
                                            {narrative.cons.map((c, i) => (
                                                <li key={i} className="text-xs text-slate-400 leading-snug">• {c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* AI Insight Box */}
                                <div className="bg-gradient-to-br from-indigo-900/20 to-slate-800 border border-indigo-500/30 p-6 rounded-lg relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-indigo-300 font-bold text-sm flex items-center gap-2">
                                            <Sparkles size={16} /> Gemini Assessment
                                        </h3>
                                        {!insight && !loadingInsight && (
                                            <button
                                                onClick={handleGetInsight}
                                                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition shadow-lg shadow-indigo-900/20"
                                            >
                                                Generate Insight
                                            </button>
                                        )}
                                    </div>

                                    {loadingInsight && (
                                        <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                                            <Loader2 size={16} className="animate-spin" /> Analyzing against philosophy...
                                        </div>
                                    )}

                                    {insight && (
                                        <div className="prose prose-invert prose-sm text-sm text-slate-300 leading-relaxed">
                                            {insight.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Notes & Scores */}
                            <div className="space-y-6 flex flex-col h-full">

                                {/* Notes Section - Takes available height */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 flex-1 flex flex-col min-h-[400px]">
                                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-lg">
                                        <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">My Notes & Questions</h3>
                                        <span className={`text-[10px] uppercase font-bold transition-colors duration-300 ${saveStatus === 'saved' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Auto-save'}
                                        </span>
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Type questions for the vendor demo here..."
                                        className="flex-1 w-full bg-slate-900/50 text-slate-200 p-4 resize-none focus:outline-none focus:bg-slate-900 transition text-sm leading-relaxed rounded-b-lg"
                                    />
                                </div>

                                {/* Detailed Category Scores */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-xs uppercase font-bold text-slate-500 mb-3">Category Breakdown</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                                        {CATEGORIES.map((cat, i) => {
                                            const score = vendor.scores[i];
                                            const weight = weights[cat.id] || 0;
                                            const isImportant = weight >= 10;

                                            return (
                                                <div key={cat.id} className="flex justify-between items-center">
                                                    <span className={`text-xs ${isImportant ? 'text-white font-medium' : 'text-slate-500'}`}>
                                                        {cat.name} {isImportant && '*'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-blue-500' : 'bg-rose-500'}`}
                                                                style={{ width: `${score * 10}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold w-4 text-right">{score}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3 text-[10px] text-slate-600 text-right">* High priority based on your weights</div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {enlargedImage && (
                <ImageModal
                    src={enlargedImage.src}
                    alt={enlargedImage.alt}
                    onClose={() => setEnlargedImage(null)}
                />
            )}
        </>
    );
};

export default VendorDetail;
