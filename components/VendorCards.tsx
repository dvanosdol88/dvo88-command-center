import React, { useState } from 'react';
import { VendorResult, WeightState } from '../types';
import { NARRATIVES } from '../constants';
import { Check, X, Award, ChevronRight, ZoomIn, XIcon } from 'lucide-react';

interface VendorCardsProps {
  results: VendorResult[];
  weights?: WeightState;
  onSelectVendor: (vendor: VendorResult) => void;
}

// Image Modal Component
const ImageModal: React.FC<{ src: string; alt: string; onClose: () => void }> = ({ src, alt, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-blue-400 transition"
      >
        <XIcon size={32} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Vendor screenshot mapping
const VENDOR_SCREENSHOTS: Record<string, string> = {
  "RightCapital": "/uploaded_image_1765143260406.png"
};

const VendorCards: React.FC<VendorCardsProps> = ({ results, weights, onSelectVendor }) => {
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);

  const handleImageClick = (e: React.MouseEvent, src: string, alt: string) => {
    e.stopPropagation();
    setEnlargedImage({ src, alt });
  };

  return (
    <>
      <div className="p-6 overflow-y-auto h-full pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {results.map((vendor, index) => {
            const narrative = NARRATIVES[vendor.name];
            const isWinner = index === 0;
            const screenshot = VENDOR_SCREENSHOTS[vendor.name];

            return (
              <div
                key={vendor.name}
                onClick={() => onSelectVendor(vendor)}
                className={`bg-slate-800 border rounded-lg p-6 relative group transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer ${isWinner
                    ? 'border-emerald-500 shadow-lg shadow-emerald-900/20'
                    : 'border-slate-700 hover:border-blue-500'
                  }`}
              >
                {isWinner ? (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 z-10">
                    <Award size={12} /> #1 CHOICE
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-slate-700 text-slate-400 text-[10px] font-bold px-2 py-1 rounded z-10">
                    #{index + 1}
                  </div>
                )}

                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-2 gap-6">

                  {/* Left Column: Content */}
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{vendor.name}</h3>
                    <div className="text-2xl font-bold text-blue-400 mb-4">
                      {vendor.finalScore} <span className="text-xs text-slate-500 font-normal">/ 10</span>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="text-[10px] uppercase text-emerald-500 font-bold mb-2">Strengths</div>
                        <ul className="space-y-1">
                          {narrative.pros.slice(0, 3).map((p, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-rose-500 font-bold mb-2">Weaknesses</div>
                        <ul className="space-y-1">
                          {narrative.cons.slice(0, 2).map((c, i) => (
                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <X size={12} className="text-rose-500 mt-0.5 shrink-0" /> {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <div className="text-[10px] uppercase text-blue-500 font-bold mb-1">Best For</div>
                      <div className="text-xs text-slate-300 italic leading-relaxed">
                        {narrative.bestFor}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Screenshot Space */}
                  <div className="flex flex-col justify-center items-center">
                    {screenshot ? (
                      <div
                        className="relative w-full h-full min-h-[300px] bg-slate-900/50 rounded-lg border-2 border-slate-700 overflow-hidden group/img cursor-zoom-in"
                        onClick={(e) => handleImageClick(e, screenshot, `${vendor.name} Screenshot`)}
                      >
                        <img
                          src={screenshot}
                          alt={`${vendor.name} Screenshot`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                          <ZoomIn className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full min-h-[300px] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                        <div className="text-center text-slate-600">
                          <div className="text-sm font-medium mb-1">Screenshot</div>
                          <div className="text-xs">Coming Soon</div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Action */}
                <div className="mt-4 flex justify-end">
                  <div className="bg-slate-900 p-2 rounded-full text-slate-500 group-hover:text-white group-hover:bg-blue-600 transition">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
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

export default VendorCards;
