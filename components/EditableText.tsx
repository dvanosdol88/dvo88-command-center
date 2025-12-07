import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
    label?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
    value,
    onSave,
    className = '',
    multiline = false,
    placeholder = 'Click to edit',
    label
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLTextAreaElement) {
                inputRef.current.setSelectionRange(
                    inputRef.current.value.length,
                    inputRef.current.value.length
                );
            }
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editValue.trim() !== value) {
            onSave(editValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
            handleSave();
        }
    };

    if (isEditing) {
        return (
            <div className="relative group">
                {label && <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</div>}
                <div className="flex items-start gap-2">
                    {multiline ? (
                        <textarea
                            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`flex-1 bg-slate-900 border-2 border-blue-500 rounded px-2 py-1 text-slate-200 focus:outline-none ${className}`}
                            placeholder={placeholder}
                            rows={3}
                        />
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`flex-1 bg-slate-900 border-2 border-blue-500 rounded px-2 py-1 text-slate-200 focus:outline-none ${className}`}
                            placeholder={placeholder}
                        />
                    )}
                    <div className="flex gap-1">
                        <button
                            onClick={handleSave}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition"
                            title="Save (Enter)"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="p-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition"
                            title="Cancel (Esc)"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                {multiline && (
                    <div className="text-[10px] text-slate-600 mt-1">Ctrl+Enter to save, Esc to cancel</div>
                )}
            </div>
        );
    }

    return (
        <div className="relative group">
            {label && <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">{label}</div>}
            <div
                onClick={() => setIsEditing(true)}
                className={`cursor-pointer hover:bg-slate-800/50 rounded px-2 py-1 transition flex items-center gap-2 ${className}`}
            >
                <span className={value ? 'text-slate-200' : 'text-slate-600 italic'}>
                    {value || placeholder}
                </span>
                <Edit2
                    size={12}
                    className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
            </div>
        </div>
    );
};

export default EditableText;
