// src/features/events/types/dashboard.types.ts

// ─── Ticket ───────────────────────────────────────────────────
export interface TicketCount {
  status: string;   // "used" | "paid"
  ticketCount: number;
}

// ─── Zone ─────────────────────────────────────────────────────
export interface ZoneRank {
  zoneId: string;
  zoneName: string;
  visitorCount: number;
}

export interface ZoneHour {
  zoneId: string;
  zoneName: string;
  hour: string;       // "2026-02-17 09:00:00"
  visitorCount: number;
}

// ─── Visit ────────────────────────────────────────────────────
export interface VisitHour {
  hour: string;       // "2026-02-17 09:00:00"
  visitorCount: number;
}

export interface VisitGender {
  visitDate: string;
  gender: 'male' | 'female' | 'other';
  visitorCount: number;
}

export interface VisitAge {
  visitDate: string;
  ageGroup: '<18' | '18-25' | '26-40' | '41-60' | '>60';
  visitorCount: number;
}

// ─── Booth ────────────────────────────────────────────────────
export interface TopBooth {
  expoId: string;
  boothId: string;
  boothNo: string;
  visitorCount: number;
}

export interface TopBoothDownload {
  expoId: string;
  boothId: string;
  boothNo: string;
  downloadCount: number;
  uniqueDownloaders: number;
}

// ─── Form ─────────────────────────────────────────────────────
export interface FormRating {
  questionNo: string;
  questionTitle: string;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
}

// form-avg: backend คำนวณ avg มาให้แล้ว
export interface FormAvg {
  responseId: string;     // response_id
  title: string;          // ชื่อคำถาม
  averageRating: number;  // avg 0.00-5.00
  responseCount: number;  // จำนวนคนตอบ
}

// real backend: ไม่มี user_id, key คือ q_1, q_2..., age_group snake_case
// { age_group: "18-25", gender: "female", q_1: "5", q_2: "งานดีมาก" }
export type FormResponse = Record<string, string>;

export interface FormResponseData {
  questions: Record<string, string>; // { "q_1": "ความพึงพอใจ", "q_2": "..." }
  responses: FormResponse[];
}

// ─── Transformed types for charts ────────────────────────────

// zone-hour pivot สำหรับ LineChart
// { hour: "09:00", "Technology Zone": 45, "Food Zone": 32, ... }
export type ZoneHourChartPoint = Record<string, string | number>;

// visit-hour format สำหรับ AreaChart
export interface VisitHourChartPoint {
  hour: string;       // "09:00"
  visitors: number;
}

// gender aggregate (รวมทุกวัน)
export interface GenderChartPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // required for Recharts ChartDataInput
}

// age aggregate (รวมทุกวัน)
export interface AgeChartPoint {
  ageGroup: string;
  visitors: number;
}

// ─── Dashboard State ──────────────────────────────────────────
export interface DashboardData {
  ticketCount: TicketCount[];
  zoneRank: ZoneRank[];
  zoneHour: ZoneHour[];
  visitHour: VisitHour[];
  visitGender: VisitGender[];
  visitAge: VisitAge[];
  topBooth: TopBooth[];
  topBoothDownload: TopBoothDownload[];
  formRating: FormRating[];
  formAvg: FormAvg[];           // จาก /form-avg
  formResponse: FormResponseData | null;
}