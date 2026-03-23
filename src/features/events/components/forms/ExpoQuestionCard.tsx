// src/features/events/components/forms/ExpoQuestionCard.tsx
'use client';

import { useState } from 'react';
import { GripVertical, Trash2, Star, MessageSquare, ChevronDown } from 'lucide-react';
import { ExpoQuestion, ExpoQuestionType } from '../../types/expoForm.types';

interface ExpoQuestionCardProps {
  question: ExpoQuestion;
  index: number;
  onUpdate: (question: ExpoQuestion) => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function ExpoQuestionCard({
  question,
  index,
  onUpdate,
  onDelete,
  isDragging = false,
}: ExpoQuestionCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTypeChange = (type: ExpoQuestionType) => {
    onUpdate({ ...question, question_type: type });
    setIsDropdownOpen(false);
  };

  const handleTextChange = (text: string) => {
    onUpdate({ ...question, question_text: text });
  };

  const handleRequiredChange = (required: boolean) => {
    onUpdate({ ...question, required });
  };

  const questionTypes = [
    {
      value: 'text' as ExpoQuestionType,
      icon: MessageSquare,
      label: 'ข้อความ',
      description: 'คำตอบแบบอิสระ',
    },
    {
      value: 'rating' as ExpoQuestionType,
      icon: Star,
      label: 'ให้คะแนน',
      description: '1-5 ดาว',
    },
  ];

  const selectedType = questionTypes.find((t) => t.value === question.question_type);

  return (
    <div
      className={`bg-white rounded-xl border-2 border-gray-200 p-5 transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Left: Drag Handle + Number */}
        <div className="flex items-start gap-2 pt-1">
          <button className="text-gray-400 hover:text-gray-600 cursor-move">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#3674B5] text-white flex items-center justify-center font-bold">
            {index + 1}
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 space-y-4">
          {/* ExpoQuestion Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทคำถาม
            </label>
            <div className="relative">
              {/* Dropdown Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-[#3674B5] focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 transition group"
              >
                <div className="flex items-center gap-3">
                  {selectedType && (
                    <>
                      <selectedType.icon className="h-5 w-5 text-gray-500 group-hover:text-[#3674B5] transition" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {selectedType.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {selectedType.description}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    {questionTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = type.value === question.question_type;

                      return (
                        <button
                          key={type.value}
                          onClick={() => handleTypeChange(type.value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                            isSelected
                              ? 'bg-blue-50 text-[#3674B5] border-l-4 border-[#3674B5]'
                              : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 flex-shrink-0 ${
                              isSelected ? 'text-[#3674B5]' : 'text-gray-400'
                            }`}
                          />
                          <div className="text-left flex-1">
                            <div className="font-medium">
                              {type.label}
                            </div>
                            <div className={`text-xs mt-0.5 ${
                              isSelected ? 'text-[#3674B5]/75' : 'text-gray-500'
                            }`}>
                              {type.description}
                            </div>
                          </div>
                          {isSelected && (
                            <svg
                              className="h-5 w-5 text-[#3674B5] flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ExpoQuestion Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำถาม {question.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={question.question_text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="ระบุคำถาม"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] outline-none transition text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Preview */}
          {question.question_text && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-3">ตัวอย่างที่ผู้ใช้จะเห็น:</p>
              {question.question_type === 'rating' ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-7 w-7 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <span className="ml-3 text-sm text-gray-600 font-medium">(1-5 ดาว)</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="คำตอบของผู้ใช้..."
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-400"
                />
              )}
            </div>
          )}

          {/* Required Checkbox */}
          <label className="inline-flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => handleRequiredChange(e.target.checked)}
              className="w-4 h-4 text-[#3674B5] border-gray-300 rounded focus:ring-2 focus:ring-[#3674B5]/20 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
              บังคับตอบคำถามนี้
            </span>
          </label>
        </div>

        {/* Right: Delete Button */}
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition mt-1"
          title="ลบคำถาม"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}