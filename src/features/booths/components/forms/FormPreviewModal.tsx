// src/features/booths/components/forms/FormPreviewModal.tsx
'use client';

import { X, Star } from 'lucide-react';
import { Question } from '../../types/form.types';


interface FormPreviewModalProps {
  questions: Question[];
  onClose: () => void;
}

export function FormPreviewModal({ questions, onClose }: FormPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">ตัวอย่างแบบสอบถาม</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {index + 1}. {question.question_text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </p>

              {question.question_type === 'rating' ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-8 w-8 text-yellow-400 fill-yellow-400 cursor-pointer hover:scale-110 transition"
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">(1-5 ดาว)</span>
                </div>
              ) : (
                <textarea
                  placeholder="พิมพ์คำตอบของคุณ..."
                  disabled
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-400 resize-none"
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}