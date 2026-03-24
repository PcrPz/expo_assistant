'use client';
// src/components/ui/ConfirmModal.tsx

import { useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  notes?: string[];          // bullet points ⚠️
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;     // hex — default #3674B5
  isLoading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  notes,
  confirmLabel = 'ยืนยัน',
  cancelLabel  = 'ยกเลิก',
  confirmColor = '#3674B5',
  isLoading    = false,
}: ConfirmModalProps) {
  // ปิดด้วย Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${confirmColor}, ${confirmColor}cc)` }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              {description && (
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        {notes && notes.length > 0 && (
          <div className="px-6 py-5">
            <div className="bg-[#EBF3FC] border border-[#B8D0EA] rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-[#1e3a5f] flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                หมายเหตุ
              </p>
              {notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#1e3a5f]">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#3674B5] flex-shrink-0" />
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={`flex gap-3 px-6 pb-6 ${notes && notes.length > 0 ? 'pt-0' : 'pt-5'}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-[2] py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${confirmColor}, ${confirmColor}cc)` }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังดำเนินการ...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}