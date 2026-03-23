// src/features/events/types/expoForm.types.ts

export type ExpoFormStatus = 'publish' | 'unpublish';
export type ExpoQuestionType = 'text' | 'rating';

export interface ExpoQuestion {
  question_no: number;
  question_type: ExpoQuestionType;
  question_text: string;
  choices: string[];
  required: boolean;
}

export interface GetExpoFormResponse {
  expo_id: string;
  status: ExpoFormStatus;
  questions: ExpoQuestion[];
}

export interface CreateExpoFormRequest {
  expo_id: string;
  questions: ExpoQuestion[];
}

export interface UpdateExpoFormRequest {
  expo_id: string;
  questions: ExpoQuestion[];
}