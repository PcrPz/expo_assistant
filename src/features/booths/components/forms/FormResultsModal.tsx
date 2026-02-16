// src/features/booths/components/forms/FormResultsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Star, TrendingUp, Users, FileText, RefreshCw } from 'lucide-react';
import { getFormResults } from '../../api/formApi';
import type { FormResultsData, QuestionResultDetail } from '../../types/form.types';

interface FormResultsModalProps {
  expoId: string;
  boothId: string;
  onClose: () => void;
}

export function FormResultsModal({
  expoId,
  boothId,
  onClose,
}: FormResultsModalProps) {
  const [results, setResults] = useState<FormResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<number>(0);

  useEffect(() => {
    loadResults();
  }, [expoId, boothId]);

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const data = await getFormResults(expoId, boothId);
      setResults(data);
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถโหลดผลสรุปได้');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !results) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <RefreshCw className="h-8 w-8 text-[#3674B5] animate-spin mx-auto" />
          <p className="text-gray-600 mt-4">กำลังโหลดผลสรุป...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = results.questions[selectedQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">ผลสรุปแบบสอบถาม</h2>
            <p className="text-sm text-gray-500 mt-1">
              วิเคราะห์ความพึงพอใจและข้อเสนอแนะจากผู้เข้าชม
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#3674B5]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {results.total_questions}
                  </p>
                  <p className="text-xs text-gray-600">คำถามทั้งหมด</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {results.total_responses}
                  </p>
                  <p className="text-xs text-gray-600">ผู้ตอบทั้งหมด</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {results.form_status === 'publish' ? 'เผยแพร่' : 'ฉบับร่าง'}
                  </p>
                  <p className="text-xs text-gray-600">สถานะ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Question List */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                คำถาม ({results.questions.length})
              </h3>
              <div className="space-y-2">
                {results.questions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedQuestion(index)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedQuestion === index
                        ? 'bg-[#3674B5] text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          selectedQuestion === index
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {question.question_text}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            selectedQuestion === index
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}
                        >
                          {question.question_type === 'rating' ? '⭐ Rating' : '📝 Text'} • {question.total_responses} คำตอบ
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            <QuestionDetail question={currentQuestion} questionIndex={selectedQuestion} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Question Detail Component
// ============================================

interface QuestionDetailProps {
  question: QuestionResultDetail;
  questionIndex: number;
}

function QuestionDetail({ question, questionIndex }: QuestionDetailProps) {
  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        <div className="flex items-start gap-3 mb-2">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3674B5] text-white flex items-center justify-center text-sm font-bold">
            {questionIndex + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {question.question_text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {question.question_type === 'rating' ? 'คำถามแบบให้คะแนน' : 'คำถามแบบข้อความ'} • {question.total_responses} คำตอบ
            </p>
          </div>
        </div>
      </div>

      {/* Rating Question */}
      {question.question_type === 'rating' && question.rating_data && (
        <div className="space-y-6">
          {/* Average Score */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">คะแนนเฉลี่ย</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-bold text-yellow-600">
                  {question.rating_data.average.toFixed(1)}
                </span>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(question.rating_data!.average)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    จาก {question.rating_data.total_ratings} คะแนน
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">การกระจายคะแนน</h4>
            <div className="space-y-3">
              {question.rating_data.distribution
                .slice()
                .reverse()
                .map((dist) => (
                  <div key={dist.rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium text-gray-700">
                        {dist.rating}
                      </span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                          style={{ width: `${dist.percentage}%` }}
                        >
                          {dist.percentage > 10 && (
                            <span className="text-xs font-bold text-white">
                              {dist.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {dist.count} คน
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Question */}
      {question.question_type === 'text' && question.text_answers && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">
            คำตอบทั้งหมด ({question.text_answers.length})
          </h4>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {question.text_answers.map((answer, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <p className="text-gray-800 whitespace-pre-wrap">{answer.response}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(answer.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {question.total_responses === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">ยังไม่มีคำตอบสำหรับคำถามนี้</p>
        </div>
      )}
    </div>
  );
}