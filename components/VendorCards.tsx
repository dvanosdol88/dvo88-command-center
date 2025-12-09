import React, { useState, useEffect } from 'react';
import { VendorResult, WeightState } from '../types';
import { NARRATIVES } from '../constants';
import { ArrowRight, Settings, ZoomIn, Check, X, Shield, Users, Zap, ChevronRight, Loader2, Trash2, Plus } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { vendorAPI } from '../services/apiService';
import { subscribeToItems } from '../services/db';
import { DocMetadata } from '../services/storage';

interface VendorCardsProps {
  results: VendorResult[];
  weights: WeightState;
  onSelectVendor: (vendor: VendorResult) => void;
  onAddVendor: () => void;
  onDeleteVendor: (name: string) => void;
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

// Image Management Modal
const ImageManagementModal: React.FC<{
  vendorName: string;
  onClose: () => void;
  currentImages: DocMetadata[];
  onUpdate: (images: string[]) => void;
}> = ({ vendorName, onClose, currentImages, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-heading font-bold text-white mb-1">Manage Dashboard Image</h3>
        <p className="text-sm text-slate-400 mb-6">Upload a representative screenshot for {vendorName} to display on the card.</p>

        <ImageUploader
          vendorName={vendorName}
          location="front"
          currentImages={currentImages}
          onImagesUpdate={onUpdate}
        />
      </div>
    </div>
  );
};

// Vendor screenshot mapping (default screenshots)
const VENDOR_SCREENSHOTS: Record<string, string[]> = {
  "RightCapital": ["/uploaded_image_1765143260406.png"]
};

const VendorCards: React.FC<VendorCardsProps> = ({ results, weights, onSelectVendor, onAddVendor, onDeleteVendor }) => {
  const [vendorDataMap, setVendorDataMap] = useState<Record<string, any>>({});
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);
  const [managingVendor, setManagingVendor] = useState<string | null>(null);

  // Refresh trigger for images - though with Firestore subscription we might not need this explicitly for updates if we react to allDocuments
  const [refreshKey, setRefreshKey] = useState(0);

  const [allDocuments, setAllDocuments] = useState<DocMetadata[]>([]);

  // Subscribe to documents
  useEffect(() => {
    const unsubscribe = subscribeToItems('documents', (items: any[]) => {
      setAllDocuments(items);
    });
    return () => unsubscribe();
  }, []);

  // Load vendor data
  useEffect(() => {
    const loadAllVendorData = async () => {
      const dataMap: Record<string, any> = {};
      for (const vendor of results) {
        try {
          const data = await vendorAPI.get(vendor.name);
          if (data.data) {
            dataMap[vendor.name] = data.data;
          }
        } catch (error) {
          console.log(`Using default data for ${vendor.name}`);
        }
      }
      setVendorDataMap(dataMap);
    };
    loadAllVendorData();
  }, [results]);


  const handleManageImages = (e: React.MouseEvent, vendorName: string) => {
    e.stopPropagation();
    setManagingVendor(vendorName);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, vendorName: string) => {
      e.stopPropagation();
      onDeleteVendor(vendorName);
  };

  const handleImageClick = (e: React.MouseEvent, src: string, alt: string) => {
    e.stopPropagation();
    setEnlargedImage({ src, alt });
  };

  const handleUpdateComplete = (images: string[]) => {
    // Trigger re-render to show new image
    setRefreshKey(prev => prev + 1);
    // We don't close modal here, let user close it when done
  };

  return (
    <>
      <div className="h-full overflow-y-auto p-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.map((vendor, index) => {
            const narrative = vendorDataMap[vendor.name] || NARRATIVES[vendor.name] || { bestFor: "Custom vendor" };
            const isTopPick = index === 0;

            // Determine image source
            // 1. Check for custom "front" images from Firestore
            const customFrontImages = allDocuments.filter(doc =>
              doc.type === 'vendor_image' &&
              doc.vendorId === vendor.name &&
              doc.location === 'front'
            );
            // Sort by most recent
            customFrontImages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

            // 2. Fallback to default
            const defaultImages = VENDOR_SCREENSHOTS[vendor.name] || [];

            // Use the most recent custom front image, or the first default image
            const screenshot = customFrontImages.length > 0 ? customFrontImages[0].url : (defaultImages.length > 0 ? defaultImages[0] : null);


            return (
              <div
                key={vendor.name}
                onClick={() => onSelectVendor(vendor)}
                className={`
                  group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                  hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:scale-[1.02] hover:-translate-y-1
                  border ${isTopPick ? 'border-evergreen/50' : 'border-slate-700 hover:border-evergreen/30'}
                `}
              >
                {/* Delete Button */}
                <button
                    onClick={(e) => handleDeleteClick(e, vendor.name)}
                    className="absolute top-2 left-2 z-20 text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Vendor"
                >
                    <Trash2 size={16} />
                </button>

                {/* Rank Badge */}
                <div className={`absolute top-0 left-0 px-4 py-1.5 rounded-br-xl font-bold font-heading text-sm z-10 flex items-center gap-2
                  ${isTopPick ? 'bg-evergreen text-white shadow-lg shadow-evergreen/20' : 'bg-slate-700 text-slate-300'}
                `} style={{ marginLeft: '40px' }}>
                  <span className="opacity-70 text-[10px] uppercase tracking-wider">Rank</span>
                  <span>#{index + 1}</span>
                </div>

                {/* Score Badge */}
                <div className="absolute top-4 right-4 flex flex-col items-end z-10">
                  <div className="text-[10px] uppercase font-bold text-slate-400 font-heading tracking-widest bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">Score</div>
                  <div className="text-3xl font-bold font-heading text-accent-gold drop-shadow-md">
                    {vendor.finalScore}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 pt-12 flex flex-col h-full">
                  <h3 className="text-xl font-heading font-extrabold text-white mb-4 tracking-wide group-hover:text-accent-gold transition-colors">{vendor.name}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4 flex-1">
                    {/* Left Column: Best For */}
                    <div className="flex flex-col">
                      <div className="mt-6 pt-4 border-t border-slate-700">
                        <div className="text-[10px] uppercase text-accent-gold font-bold mb-1">Best For</div>
                        <div className="text-base text-slate-300 italic leading-relaxed">
                          {narrative.bestFor}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Screenshot Space */}
                    <div className="flex flex-col justify-center items-center relative">
                      {/* Manage Images Button */}
                      <button
                        onClick={(e) => handleManageImages(e, vendor.name)}
                        className="absolute top-2 right-2 z-20 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Manage Images"
                      >
                        <Settings size={16} />
                      </button>

                      {screenshot ? (
                        <div
                          className="relative w-full h-full min-h-[120px] bg-slate-900/50 rounded-lg border-2 border-slate-700 overflow-hidden group/img cursor-zoom-in"
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
                        <div
                          className="w-full h-full min-h-[120px] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-slate-600 transition"
                          onClick={(e) => handleManageImages(e, vendor.name)}
                        >
                          <div className="text-center text-slate-600">
                            <Settings className="mx-auto mb-2" size={24} />
                            <div className="text-sm font-medium mb-1">Add Image</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-4 flex justify-end">
                    <div className="bg-slate-900 p-2 rounded-full text-slate-500 group-hover:text-white group-hover:bg-evergreen transition">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add New Vendor Card */}
          <button
            onClick={onAddVendor}
            className="group min-h-[300px] bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800/50 hover:border-slate-500 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:bg-evergreen transition-colors shadow-lg">
                <Plus size={32} />
            </div>
            <span className="font-heading font-bold text-slate-400 group-hover:text-white text-lg">Add New Vendor</span>
          </button>

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

      {/* Image Management Modal */}
      {managingVendor && (
        <ImageManagementModal
          vendorName={managingVendor}
          onClose={() => setManagingVendor(null)}
          onUpdate={handleUpdateComplete}
          currentImages={allDocuments.filter(doc =>
            doc.type === 'vendor_image' &&
            doc.vendorId === managingVendor &&
            doc.location === 'front'
          ).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))}
        />
      )}
    </>
  );
};

export default VendorCards;
