import React, { useState, useEffect } from 'react';
import { VendorResult, WeightState } from '../types';
import { NARRATIVES, CATEGORIES } from '../constants';
import { ArrowLeft, Save, Sparkles, Check, X, Loader2, ZoomIn, Settings, Plus } from 'lucide-react';
import { getVendorInsight } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import EditableText from './EditableText';
import { vendorAPI, notesAPI } from '../services/apiService';
import FileManager from './FileManager';
import { subscribeToItems } from '../services/db';
import { DocMetadata } from '../services/storage';

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
                <X size={32} />
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

// Vendor screenshot mapping (default screenshots)
const VENDOR_SCREENSHOTS: Record<string, string[]> = {
    "RightCapital": ["/uploaded_image_1765143260406.png"]
};

const VendorDetail: React.FC<VendorDetailProps> = ({ vendor, weights, onBack }) => {
    const narrative = NARRATIVES[vendor.name];

    // Editable Vendor Data State
    const [vendorData, setVendorData] = useState({
        pros: narrative?.pros || [],
        cons: narrative?.cons || [],
        bestFor: narrative?.bestFor || ''
    });

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

    // Image Management State
    const [showImageManager, setShowImageManager] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [allDocuments, setAllDocuments] = useState<DocMetadata[]>([]);

    // Subscribe to documents
    useEffect(() => {
        const unsubscribe = subscribeToItems('documents', (items: any[]) => {
            setAllDocuments(items);
        });
        return () => unsubscribe();
    }, []);

    // Load vendor data from remote storage
    useEffect(() => {
        const loadVendorData = async () => {
            try {
                const data = await vendorAPI.get(vendor.name);
                if (data.data) {
                    setVendorData(data.data);
                }
            } catch (error) {
                // Use default narrative data
                console.log('Using default narrative data');
            }
        };
        loadVendorData();
    }, [vendor.name]);

    // Load notes from remote storage
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const data = await notesAPI.get(vendor.name);
                if (data.notes) {
                    setNotes(data.notes);
                }
            } catch (error) {
                // Use local storage fallback
                const localNotes = localStorage.getItem(`vendor_notes_${vendor.name}`) || '';
                setNotes(localNotes);
            }
        };
        loadNotes();
    }, [vendor.name]);

    // Save notes to remote storage
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (notes !== localStorage.getItem(`vendor_notes_${vendor.name}`)) {
                setSaveStatus('saving');
                localStorage.setItem(`vendor_notes_${vendor.name}`, notes);

                try {
                    await notesAPI.save(vendor.name, notes);
                    setSaveStatus('saved');
                } catch (error) {
                    console.error('Failed to save notes to remote storage');
                    setSaveStatus('saved'); // Still show saved for local storage
                }

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

    // Save vendor data to remote storage
    const saveVendorData = async (data: typeof vendorData) => {
        try {
            await vendorAPI.save(vendor.name, data);
            console.log('Vendor data saved to remote storage');
        } catch (error) {
            console.error('Failed to save vendor data:', error);
        }
    };

    // Handlers for editable fields
    const handleBestForChange = async (newValue: string) => {
        const newData = { ...vendorData, bestFor: newValue };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleAddPro = async (newPro: string) => {
        const newData = { ...vendorData, pros: [...vendorData.pros, newPro] };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleUpdatePro = async (index: number, newValue: string) => {
        const newPros = [...vendorData.pros];
        newPros[index] = newValue;
        const newData = { ...vendorData, pros: newPros };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleRemovePro = async (index: number) => {
        const newPros = vendorData.pros.filter((_, i) => i !== index);
        const newData = { ...vendorData, pros: newPros };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleAddCon = async (newCon: string) => {
        const newData = { ...vendorData, cons: [...vendorData.cons, newCon] };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleUpdateCon = async (index: number, newValue: string) => {
        const newCons = [...vendorData.cons];
        newCons[index] = newValue;
        const newData = { ...vendorData, cons: newCons };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    const handleRemoveCon = async (index: number) => {
        const newCons = vendorData.cons.filter((_, i) => i !== index);
        const newData = { ...vendorData, cons: newCons };
        setVendorData(newData);
        await saveVendorData(newData);
    };

    // Combine default and custom screenshots
    const defaultScreenshots = VENDOR_SCREENSHOTS[vendor.name] || [];

    // Filter for back images
    const customBackImages = allDocuments.filter(doc =>
        doc.type === 'vendor_image' &&
        doc.vendorId === vendor.name &&
        doc.location === 'back'
    );
    // Sort by recent
    customBackImages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const allScreenshots = [...defaultScreenshots, ...customBackImages.map(d => d.url)];

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
                            <h2 className="text-xl font-heading font-extrabold text-white tracking-wide">{vendor.name}</h2>
                            <div className="text-xs text-slate-400">Vendor Detail & Analysis</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] uppercase font-bold font-heading text-slate-500">Match Score</div>
                            <div className="text-2xl font-bold font-heading text-accent-gold">{vendor.finalScore}<span className="text-sm font-sans text-slate-600">/10</span></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Screenshot Gallery */}
                        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs uppercase font-bold font-heading text-accent-gold">Screenshots & Visuals</h3>
                                <button
                                    onClick={() => setShowImageManager(!showImageManager)}
                                    className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition"
                                >
                                    <Settings size={14} />
                                    {showImageManager ? 'Hide Manager' : 'Manage Images'}
                                </button>
                            </div>

                            {/* Image Upload Manager */}
                            {showImageManager && (
                                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <h4 className="text-sm font-bold text-slate-300 mb-3">Add Additional Screenshots</h4>
                                    <ImageUploader
                                        vendorName={vendor.name}
                                        location="back"
                                        currentImages={customBackImages}
                                    />
                                </div>
                            )}

                            {/* Screenshot Grid */}
                            {allScreenshots.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allScreenshots.map((screenshot, index) => (
                                        <div
                                            key={`${index}-${refreshKey}`}
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
                            ) : (
                                <div className="text-center text-slate-600 py-8">
                                    <Settings className="mx-auto mb-2" size={32} />
                                    <div className="text-sm">No screenshots yet. Click "Manage Images" to add some.</div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Column: Stats & Narrative */}
                            <div className="space-y-6">

                                {/* Best For Card */}
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                                    <h3 className="text-xs uppercase font-bold font-heading text-accent-gold mb-2">Best For</h3>
                                    <EditableText
                                        value={vendorData.bestFor}
                                        onSave={handleBestForChange}
                                        className="text-base text-slate-200 italic"
                                        multiline
                                        placeholder="Click to add 'Best For' description"
                                    />
                                </div>

                                {/* Pros/Cons */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                        <h4 className="text-xs uppercase font-bold text-accent-green font-heading mb-3 flex items-center gap-2 justify-between">
                                            <span className="flex items-center gap-2">
                                                <Check size={14} /> Strengths
                                            </span>
                                            <button
                                                onClick={() => handleAddPro('New strength')}
                                                className="p-1 hover:bg-emerald-600/20 rounded transition"
                                                title="Add strength"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </h4>
                                        <div className="space-y-2">
                                            {vendorData.pros.map((p, i) => (
                                                <div key={i} className="flex items-start gap-2 group">
                                                    <span className="text-accent-green mt-1">•</span>
                                                    <div className="flex-1">
                                                        <EditableText
                                                            value={p}
                                                            onSave={(newValue) => handleUpdatePro(i, newValue)}
                                                            className="text-base text-slate-300 leading-snug"
                                                            placeholder="Click to edit"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePro(i)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition text-red-500"
                                                        title="Remove"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg">
                                        <h4 className="text-xs uppercase font-bold text-rose-500 font-heading mb-3 flex items-center gap-2 justify-between">
                                            <span className="flex items-center gap-2">
                                                <X size={14} /> Weaknesses
                                            </span>
                                            <button
                                                onClick={() => handleAddCon('New weakness')}
                                                className="p-1 hover:bg-rose-600/20 rounded transition"
                                                title="Add weakness"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </h4>
                                        <div className="space-y-2">
                                            {vendorData.cons.map((c, i) => (
                                                <div key={i} className="flex items-start gap-2 group">
                                                    <span className="text-rose-500 mt-1">•</span>
                                                    <div className="flex-1">
                                                        <EditableText
                                                            value={c}
                                                            onSave={(newValue) => handleUpdateCon(i, newValue)}
                                                            className="text-base text-slate-400 leading-snug"
                                                            placeholder="Click to edit"
                                                        />

                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveCon(i)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition text-red-500"
                                                        title="Remove"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI Insight Box */}
                                <div className="bg-gradient-to-br from-evergreen/20 to-slate-800 border border-evergreen/30 p-6 rounded-lg relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-accent-gold font-bold text-sm flex items-center gap-2">
                                            <Sparkles size={16} /> Gemini Assessment
                                        </h3>
                                        {!insight && !loadingInsight && (
                                            <button
                                                onClick={handleGetInsight}
                                                className="text-xs bg-evergreen hover:bg-evergreen-light text-white px-3 py-1 rounded transition shadow-lg shadow-evergreen/20"
                                            >
                                                Generate Insight
                                            </button>
                                        )}
                                    </div>

                                    {loadingInsight && (
                                        <div className="flex items-center gap-2 text-accent-green text-sm animate-pulse">
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
                                        <h3 className="text-xs uppercase font-bold font-heading text-accent-gold tracking-wider">My Notes & Questions</h3>
                                        <span className={`text-[10px] uppercase font-bold transition-colors duration-300 ${saveStatus === 'saved' ? 'text-accent-green' : 'text-slate-600'}`}>
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

                                {/* Documents Section */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-xs uppercase font-bold font-heading text-accent-gold mb-3">Support Documents</h3>
                                    <FileManager type="vendor" vendorId={vendor.name} />
                                </div>


                                {/* Detailed Category Scores */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-xs uppercase font-bold font-heading text-accent-gold mb-3">Category Breakdown</h3>
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
                                                                className={`h-full ${score >= 8 ? 'bg-evergreen' : score >= 5 ? 'bg-accent-gold' : 'bg-rose-500'}`}
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
