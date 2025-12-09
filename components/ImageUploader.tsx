import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { DocMetadata, uploadDocument, deleteDocument } from '../services/storage';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface ImageUploaderProps {
    vendorName: string;
    location: 'front' | 'back';
    currentImages: DocMetadata[]; // Changed from string[] to DocMetadata[]
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    vendorName,
    location,
    currentImages
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                if (file.type.startsWith('image/')) {
                    await uploadDocument(file, 'vendor_image', vendorName, location);
                }
            });
            await Promise.all(uploadPromises);
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = async (image: DocMetadata) => {
        if (!image.id) return;
        if (!confirm('Area you sure you want to delete this image?')) return;

        try {
            await deleteDocument(image.id, image.url);
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    };

    return (
        <div className="space-y-3">
            {/* Upload Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${isDragging
                    ? 'border-evergreen bg-evergreen/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
                    }`}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id={`upload-${vendorName}-${location}`}
                    disabled={uploading}
                />
                <label
                    htmlFor={`upload-${vendorName}-${location}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-slate-400" size={24} />
                    ) : (
                        <Upload className="text-slate-400" size={24} />
                    )}
                    <div className="text-xs text-slate-400">
                        {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
                    </div>
                    <div className="text-[10px] text-slate-600">
                        {location === 'front' ? 'Card Screenshot' : 'Additional Screenshots'}
                    </div>
                </label>
            </div>

            {/* Image Preview Grid */}
            {currentImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {currentImages.map((img, index) => (
                        <div
                            key={img.id || index}
                            className="relative group aspect-video bg-slate-900 rounded border border-slate-700 overflow-hidden"
                        >
                            <img
                                src={img.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => removeImage(img)}
                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
