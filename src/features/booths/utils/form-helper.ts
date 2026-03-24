import { toast } from '@/src/lib/toast';
// src/features/booths/utils/form-helpers.ts

import type { Question, QuestionType } from '../types/form.types';

/**
 * สร้างคำถามใหม่
 */
export function createNewQuestion(questionNo: number, type: QuestionType = 'text'): Question {
  return {
    question_no: questionNo,
    question_type: type,
    question_text: '',
    required: false,
  };
}

/**
 * Validate คำถาม
 */
export function validateQuestion(question: Question): { isValid: boolean; error?: string } {
  if (!question.question_text.trim()) {
    return { isValid: false, error: 'กรุณากรอกคำถาม' };
  }

  if (question.question_text.length > 500) {
    return { isValid: false, error: 'คำถามยาวเกิน 500 ตัวอักษร' };
  }

  return { isValid: true };
}

/**
 * Validate แบบสอบถามทั้งหมด
 */
export function validateForm(questions: Question[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (questions.length === 0) {
    errors.push('ต้องมีอย่างน้อย 1 คำถาม');
    return { isValid: false, errors };
  }

  questions.forEach((question, index) => {
    const validation = validateQuestion(question);
    if (!validation.isValid) {
      errors.push(`คำถามที่ ${index + 1}: ${validation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Reorder คำถาม (สำหรับ drag-and-drop)
 */
export function reorderQuestions(
  questions: Question[],
  startIndex: number,
  endIndex: number
): Question[] {
  const result = Array.from(questions);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  // Update question_no
  return result.map((q, index) => ({
    ...q,
    question_no: index + 1,
  }));
}

/**
 * คำนวณเปอร์เซ็นต์
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 10) / 10; // 1 ทศนิยม
}

/**
 * Format คะแนนเฉลี่ย
 */
export function formatAverage(average: number): string {
  return average.toFixed(1);
}

/**
 * Get สีตามคะแนน
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-blue-600';
  if (rating >= 2.5) return 'text-yellow-600';
  if (rating >= 1.5) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get สีตามคะแนน (Background)
 */
export function getRatingBgColor(rating: number): string {
  if (rating >= 4.5) return 'bg-green-100';
  if (rating >= 3.5) return 'bg-blue-100';
  if (rating >= 2.5) return 'bg-yellow-100';
  if (rating >= 1.5) return 'bg-orange-100';
  return 'bg-red-100';
}

/**
 * Export ข้อมูลเป็น CSV (สำหรับอนาคต)
 */
export function exportToCSV(data: any[], filename: string): void {
  // TODO: Implement CSV export
  console.log('Export to CSV:', filename, data);
  toast.info('ฟีเจอร์ Export CSV กำลังพัฒนา');
}

/**
 * Count คำตอบทั้งหมด
 */
export function getTotalResponses(questions: any[]): number {
  if (questions.length === 0) return 0;
  
  const sum = questions.reduce((total, q) => total + (q.total_responses || 0), 0);
  return Math.floor(sum / questions.length);
}