import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Trash2, Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { DocMetadata, uploadDocument, deleteDocument } from '../services/storage';
import { subscribeToItems } from '../services/db';

interface FileManagerProps {
    type: 'vendor' | 'research';
    vendorId?: string; // Required if type === 'vendor'
    className?: string;
}

const FileManager: React.FC<FileManagerProps> = ({ type, vendorId, className = '' }) => {
    const [documents, setDocuments] = useState<DocMetadata[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to documents
    useEffect(() => {
        // We subscribe to ALL items and filter client-side for simplicity in this MVP.
        // In a real app with limited reads, we'd use a specific query in db.ts.
        const unsubscribe = subscribeToItems('documents', (items: any[]) => {
            const filtered = items.filter(doc => {
                if (doc.type !== type) return false;
                if (type === 'vendor' && doc.vendorId !== vendorId) return false;
                return true;
            });
            // Sort by createdAt desc
            filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setDocuments(filtered);
        });
        return () => unsubscribe();
    }, [type, vendorId]);

    const onDrop = async (acceptedFiles: File[]) => {
        setUploading(true);
        setError(null);
        try {
            for (const file of acceptedFiles) {
                await uploadDocument(file, type, vendorId);
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to upload. Ensure Storage is enabled and rules allow write.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (doc: DocMetadata) => {
        if (!doc.id) return;
        if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

        try {
            await deleteDocument(doc.id, doc.url);
        } catch (err) {
            console.error(err);
            setError("Failed to delete file.");
        }
    };

    const onDropRejected = (fileRejections: any[]) => {
        const errors = fileRejections.map(rejection => {
            return `${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`;
        }).join(' | ');
        console.error("Drop rejected:", errors);
        setError(`File rejected: ${errors}`);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive
                        ? 'border-evergreen bg-evergreen/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}
                `}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Upload size={24} className="mb-1" />
                        <span className="text-sm font-medium text-slate-300">
                            {isDragActive ? "Drop files here..." : "Drag & drop files, or click to select"}
                        </span>
                        <span className="text-xs text-slate-500">PDF, DOCX, TXT, Images (Max 10MB)</span>

                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-900/10 p-2 rounded border border-rose-900/30">
                    <AlertCircle size={14} /> {error}
                </div>
            )}

            {/* File List */}
            <div className="space-y-2">
                {documents.length === 0 && !uploading && (
                    <div className="text-center text-slate-600 text-xs py-4 italic">
                        No documents attached.
                    </div>
                )}
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 group hover:border-slate-600 transition"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-slate-700 p-2 rounded text-slate-300">
                                <FileText size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-slate-200 truncate hover:text-accent-gold hover:underline"
                                    title={doc.name}
                                >
                                    {doc.name}
                                </a>
                                <span className="text-[10px] text-slate-500">{formatSize(doc.size)} • {new Date(doc.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                title="Download"
                            >
                                <Download size={14} />
                            </a>
                            <button
                                onClick={() => handleDelete(doc)}
                                className="p-1.5 hover:bg-rose-900/30 rounded text-slate-400 hover:text-rose-400"
                                title="Delete"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileManager;
