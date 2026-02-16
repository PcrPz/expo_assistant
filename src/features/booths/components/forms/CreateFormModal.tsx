// src/features/booths/components/forms/CreateFormModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createBoothForm } from '../../api/formApi';
import type { Question } from '../../types/form.types';
import { QuestionCard } from './QuestionCard';

interface CreateFormModalProps {
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFormModal({
  expoId,
  boothId,
  onClose,
  onSuccess,
}: CreateFormModalProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_no: 1,
      question_type: 'text',
      question_text: '',
      required: false,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_no: questions.length + 1,
        question_type: 'text',
        question_text: '',
        required: false,
      },
    ]);
  };

  const updateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...updated, question_no: index + 1 };
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(
      newQuestions.map((q, i) => ({ ...q, question_no: i + 1 }))
    );
  };

  const handleSubmit = async () => {
    const hasEmptyQuestion = questions.some((q) => !q.question_text.trim());
    if (hasEmptyQuestion) {
      alert('กรุณากรอกคำถามให้ครบทุกข้อ');
      return;
    }

    try {
      setIsSubmitting(true);
      await createBoothForm(expoId, boothId, {
        expo_id: expoId,
        booth_id: boothId,
        questions,
      });
      alert('สร้างแบบสอบถามสำเร็จ (สถานะ: ฉบับร่าง)\nคุณสามารถเผยแพร่แบบสอบถามได้ภายหลัง');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถสร้างแบบสอบถามได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">สร้างแบบสอบถาม</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              index={index}
              onUpdate={(updated) => updateQuestion(index, updated)}
              onDelete={() => deleteQuestion(index)}
            />
          ))}

          <button
            onClick={addQuestion}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#3674B5] hover:text-[#3674B5] transition flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            เพิ่มคำถาม
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || questions.length === 0}
            className="flex-1 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] disabled:opacity-50"
          >
            {isSubmitting ? 'กำลังสร้าง...' : 'บันทึกฉบับร่าง'}
          </button>
        </div>
      </div>
    </div>
  );
}