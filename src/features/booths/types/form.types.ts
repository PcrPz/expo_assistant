/**
 * Booth Form Types
 * ระบบแบบสอบถามของบูธ
 */

/**
 * QuestionType - ประเภทคำถาม
 */
export type QuestionType = 'text' | 'rating';

/**
 * FormStatus - สถานะแบบสอบถาม
 */
export type FormStatus = 'publish' | 'unpublish';

/**
 * Question - คำถามในแบบสอบถาม
 */
export interface Question {
  question_no: number;
  question_type: QuestionType;
  question_text: string;
  choices?: string[];      // ไม่ได้ใช้ แต่เก็บไว้สำหรับอนาคต
  required: boolean;
}

/**
 * Answer - คำตอบของผู้ใช้
 */
export interface Answer {
  question_no: number;
  question_text: string;
  question_type: string;
  response: string;
}

/**
 * BoothForm - แบบสอบถามในระบบ
 * Backend Response
 */
export interface BoothForm {
  expo_id: string;
  booth_id: string;
  form: string;           // encrypted path ใน MinIO
  status: FormStatus;     // "publish" | "unpublish"
  publish_at?: string;    // ISO date string
  created_at: string;
  updated_at: string;
}

/**
 * BoothFormData - ข้อมูลแบบสอบถาม (จาก MinIO)
 */
export interface BoothFormData {
  expo_id: string;
  booth_id: string;
  questions: Question[];
}

/**
 * FormResponse - คำตอบแบบสอบถามที่บันทึกแล้ว
 */
export interface FormResponse {
  expo_id: string;
  booth_id: string;
  response_id: string;     // = question_no as string
  user_id: string;
  title: string;           // question_text
  q_type: string;          // question_type
  response: string;        // คำตอบ
  created_at: string;
}

/**
 * CreateFormRequest - สร้างแบบสอบถาม
 */
export interface CreateFormRequest {
  expo_id: string;
  booth_id: string;
  questions: Question[];
}

/**
 * UpdateFormRequest - แก้ไขแบบสอบถาม
 */
export interface UpdateFormRequest {
  expo_id: string;
  booth_id: string;
  questions: Question[];
}

/**
 * SubmitAnswerRequest - ส่งคำตอบแบบสอบถาม
 */
export interface SubmitAnswerRequest {
  expo_id: string;
  booth_id: string;
  questions: Answer[];     // Backend ใช้ชื่อ "questions" แทน "answers"
}

/**
 * FormSummary - สรุปแบบสอบถาม
 */
export interface FormSummary {
  status: FormStatus;
  total_questions: number;
  total_responses: number;
  created_at: string;
  updated_at: string;
  publish_at?: string;
}

/**
 * QuestionResult - ผลลัพธ์คำถามแต่ละข้อ
 */
export interface QuestionResult {
  question_no: number;
  question_text: string;
  question_type: QuestionType;
  total_responses: number;
  
  // สำหรับ text questions
  text_answers?: string[];
  
  // สำหรับ rating questions
  rating_summary?: {
    average: number;
    distribution: {
      rating: number;
      count: number;
    }[];
  };
}

/**
 * GetFormResponse - Response จาก GET form API
 */
export interface GetFormResponse {
  status: FormStatus;
  expo_id: string;
  booth_id: string;
  questions: Question[];
}

/**
 * RatingDistribution - การกระจายของคะแนน rating
 */
export interface RatingDistribution {
  rating: number;          // 1-5
  count: number;           // จำนวนคนให้คะแนนนี้
  percentage: number;      // เปอร์เซ็นต์
}

/**
 * TextAnswerItem - คำตอบข้อความแต่ละคำตอบ
 */
export interface TextAnswerItem {
  user_id: string;
  response: string;
  created_at: string;
}

/**
 * QuestionResultDetail - ผลลัพธ์คำถามแบบละเอียด
 */
export interface QuestionResultDetail {
  question_no: number;
  question_text: string;
  question_type: QuestionType;
  required: boolean;
  total_responses: number;
  
  // สำหรับ text questions
  text_answers?: TextAnswerItem[];
  
  // สำหรับ rating questions
  rating_data?: {
    average: number;
    total_ratings: number;
    distribution: RatingDistribution[];
  };
}

/**
 * FormResultsData - ข้อมูลผลลัพธ์แบบสอบถามทั้งหมด
 */
export interface FormResultsData {
  form_status: FormStatus;
  total_questions: number;
  total_responses: number;
  questions: QuestionResultDetail[];
  created_at: string;
  updated_at: string;
}