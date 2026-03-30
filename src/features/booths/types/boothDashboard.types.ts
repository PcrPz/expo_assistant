// src/features/booths/types/boothDashboard.types.ts

// ─── Total Interactions ───────────────────────────────────────
export interface BoothTotalInteraction {
  totalUsers: number;
}

// ─── Gender ───────────────────────────────────────────────────
// Backend: { "Gender": "female", "TotalUsers": 385 }
export interface BoothGenderInteraction {
  gender: 'female' | 'male' | 'other';
  totalUsers: number;
}

// ─── Age Range ────────────────────────────────────────────────
// Backend: { "AgeRange": "13-19", "TotalUsers": 310 }
export interface BoothAgeInteraction {
  ageRange: '13-19' | '20-39' | '40-59' | '>59' | string;
  totalUsers: number;
}

// ─── Hourly Interactions ──────────────────────────────────────
// Backend: { "Date": "2026-02-15", "Hour": "2026-02-15 09:00:00", "TotalUsers": 18 }
export interface BoothHourlyInteraction {
  date: string;   // "2026-02-15"
  hour: string;   // "2026-02-15 09:00:00"
  totalUsers: number;
}

// ─── Daily Interactions (shared shape) ────────────────────────
// Backend: { "Date": "2026-02-15", "TotalUsers": 120 }
export interface BoothDailyInteraction {
  date: string;   // "2026-02-15"
  totalUsers: number;
}

// ─── Form Rating ──────────────────────────────────────────────
// Backend: { "question_no": "1", "question_title": "...", "1": 5, "2": 12, ... }
export interface BoothFormRating {
  questionNo: string;
  questionTitle: string;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

// ─── Form Avg ─────────────────────────────────────────────────
// Backend: { "response_id": "1", "title": "...", "average_rating": 3.93, "response_count": 150 }
export interface BoothFormAvg {
  responseId: string;
  title: string;
  averageRating: number;
  responseCount: number;
}

// ─── Form Response ────────────────────────────────────────────
// Backend: { "questions": { "1": "ชื่อ" }, "responses": [{ "1": "5", ... }] }
export type BoothFormResponseRow = Record<string, string>;

export interface BoothFormResponseData {
  questions: Record<string, string>; // { "1": "ชื่อคำถาม", "2": "..." }
  responses: BoothFormResponseRow[];
}

// ─── Dashboard State ──────────────────────────────────────────
export interface BoothDashboardData {
  total: BoothTotalInteraction;
  gender: BoothGenderInteraction[];
  age: BoothAgeInteraction[];
  hourly: BoothHourlyInteraction[];
  attendance: BoothDailyInteraction[];
  queue: BoothDailyInteraction[];
  download: BoothDailyInteraction[];
  locate: BoothDailyInteraction[];
  formAvg: BoothFormAvg[];
  formRating: BoothFormRating[];
  formResponse: BoothFormResponseData | null;
}

// ─── Chart Transform Types ────────────────────────────────────

// Hourly → AreaChart
export interface BoothHourlyChartPoint {
  hour: string;   // "09:00"
  visitors: number;
}

// Daily multi-line → { date, attendance, queue, download, locate }
export interface BoothDailyChartPoint {
  date: string;
  attendance: number;
  queue: number;
  download: number;
  locate: number;
}

// Gender → PieChart
export interface BoothGenderChartPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // required for Recharts ChartDataInput
}

// Age → HBar
export interface BoothAgeChartPoint {
  ageRange: string;
  visitors: number;
}