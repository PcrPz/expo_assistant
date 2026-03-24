// src/features/events/components/forms/ExpoEditFormModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';
import { updateExpoForm } from '../../api/expoFormApi';
import type { ExpoQuestion } from '../../types/expoForm.types';
import { ExpoQuestionCard } from './ExpoQuestionCard';

interface ExpoEditFormModalProps {
  expoId: string;
  existingQuestions: ExpoQuestion[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpoEditFormModal({ expoId, existingQuestions, onClose, onSuccess }: ExpoEditFormModalProps) {
  const [questions, setQuestions] = useState<ExpoQuestion[]>(existingQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      question_no: questions.length + 1,
      question_type: 'text',
      question_text: '',
      choices: [],
      required: false,
    }]);
  };

  const updateQuestion = (index: number, updated: ExpoQuestion) => {
    const newQ = [...questions];
    newQ[index] = { ...updated, question_no: index + 1 };
    setQuestions(newQ);
  };

  const deleteQuestion = (index: number) => {
    const newQ = questions.filter((_, i) => i !== index);
    setQuestions(newQ.map((q, i) => ({ ...q, question_no: i + 1 })));
  };

  const handleSubmit = async () => {
    if (questions.some(q => !q.question_text.trim())) {
      toast.warning('กรุณากรอกคำถามให้ครบทุกข้อ');
      return;
    }
    try {
      setIsSubmitting(true);
      await updateExpoForm(expoId, { expo_id: expoId, questions });
      toast.success('แก้ไขแบบสอบถามสำเร็จ (กลับเป็นฉบับร่าง)');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถแก้ไขแบบสอบถามได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขแบบสอบถาม</h2>
                <p className="text-xs text-gray-400">แก้ไขคำถามในแบบสอบถามของงาน</p>
              </div>
            </div>
            <button onClick={onClose} disabled={isSubmitting}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-4">
            {questions.map((q, i) => (
              <ExpoQuestionCard
                key={i}
                question={q}
                index={i}
                onUpdate={(updated) => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)}
              />
            ))}
            <button onClick={addQuestion}
              className="w-full py-3 border-2 border-dashed border-[#BFDBFE] rounded-xl text-[#3674B5] text-sm font-semibold hover:border-[#3674B5] hover:bg-[#EBF3FC] transition flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />เพิ่มคำถาม
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting || questions.length === 0}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังบันทึก...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>บันทึกการแก้ไข</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}