// src/features/events/components/forms/ExpoFormPreviewModal.tsx
'use client';

import { X, Star, Eye } from 'lucide-react';
import type { ExpoQuestion } from '../../types/expoForm.types';

interface ExpoFormPreviewModalProps {
  questions: ExpoQuestion[];
  onClose: () => void;
}

export function ExpoFormPreviewModal({ questions, onClose }: ExpoFormPreviewModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ตัวอย่างแบบสอบถาม</h2>
                <p className="text-xs text-gray-400">แสดงผลที่ผู้เข้าร่วมงานจะเห็น</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  {i + 1}. {q.question_text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {q.question_type === 'rating' ? (
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="h-7 w-7 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition" />
                    ))}
                    <span className="ml-2 text-xs text-gray-400">(1-5 ดาว)</span>
                  </div>
                ) : (
                  <textarea placeholder="พิมพ์คำตอบของคุณ..." disabled rows={3}
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl bg-white text-gray-400 resize-none text-sm" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </>
  );
}