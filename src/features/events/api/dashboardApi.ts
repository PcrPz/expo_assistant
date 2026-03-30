// src/features/events/api/dashboardApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  TicketCount, ZoneRank, ZoneHour, VisitHour,
  VisitGender, VisitAge, TopBooth, TopBoothDownload,
  FormRating, FormAvg, FormResponseData, DashboardData,
} from '../types/dashboard.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ─── Toggle นี้เพื่อสลับ mock ↔ real API ──────────────────────
const USE_MOCK = false;

// ══════════════════════════════════════════════════════════════
// MOCK DATA  (ตรง structure จริงของ backend)
// ══════════════════════════════════════════════════════════════

const MOCK: DashboardData = {
  ticketCount: [
    { status: 'paid', ticketCount: 1975 },
    { status: 'used', ticketCount: 1800 },
  ],

  zoneRank: [
    { zoneId: 'z1', zoneName: 'Technology Zone', visitorCount: 520 },
    { zoneId: 'z2', zoneName: 'Food Zone',        visitorCount: 410 },
    { zoneId: 'z3', zoneName: 'Fashion Zone',     visitorCount: 290 },
    { zoneId: 'z4', zoneName: 'Health Zone',      visitorCount: 175 },
  ],

  zoneHour: [
    { zoneId: 'z1', zoneName: 'Technology Zone', hour: '2026-02-17 09:00:00', visitorCount: 45 },
    { zoneId: 'z1', zoneName: 'Technology Zone', hour: '2026-02-17 10:00:00', visitorCount: 78 },
    { zoneId: 'z1', zoneName: 'Technology Zone', hour: '2026-02-17 11:00:00', visitorCount: 112 },
    { zoneId: 'z1', zoneName: 'Technology Zone', hour: '2026-02-17 12:00:00', visitorCount: 95 },
    { zoneId: 'z1', zoneName: 'Technology Zone', hour: '2026-02-17 13:00:00', visitorCount: 130 },
    { zoneId: 'z2', zoneName: 'Food Zone',        hour: '2026-02-17 09:00:00', visitorCount: 30 },
    { zoneId: 'z2', zoneName: 'Food Zone',        hour: '2026-02-17 10:00:00', visitorCount: 55 },
    { zoneId: 'z2', zoneName: 'Food Zone',        hour: '2026-02-17 11:00:00', visitorCount: 90 },
    { zoneId: 'z2', zoneName: 'Food Zone',        hour: '2026-02-17 12:00:00', visitorCount: 120 },
    { zoneId: 'z2', zoneName: 'Food Zone',        hour: '2026-02-17 13:00:00', visitorCount: 85 },
    { zoneId: 'z3', zoneName: 'Fashion Zone',     hour: '2026-02-17 10:00:00', visitorCount: 40 },
    { zoneId: 'z3', zoneName: 'Fashion Zone',     hour: '2026-02-17 11:00:00', visitorCount: 65 },
    { zoneId: 'z3', zoneName: 'Fashion Zone',     hour: '2026-02-17 12:00:00', visitorCount: 70 },
  ],

  visitHour: [
    { hour: '2026-02-17 09:00:00', visitorCount: 120 },
    { hour: '2026-02-17 10:00:00', visitorCount: 200 },
    { hour: '2026-02-17 11:00:00', visitorCount: 330 },
    { hour: '2026-02-17 12:00:00', visitorCount: 280 },
    { hour: '2026-02-17 13:00:00', visitorCount: 370 },
    { hour: '2026-02-17 14:00:00', visitorCount: 290 },
    { hour: '2026-02-17 15:00:00', visitorCount: 210 },
  ],

  visitGender: [
    { visitDate: '2026-02-17', gender: 'female', visitorCount: 320 },
    { visitDate: '2026-02-17', gender: 'male',   visitorCount: 285 },
    { visitDate: '2026-02-17', gender: 'other',  visitorCount: 45  },
  ],

  visitAge: [
    { visitDate: '2026-02-17', ageGroup: '<18',   visitorCount: 85  },
    { visitDate: '2026-02-17', ageGroup: '18-25', visitorCount: 320 },
    { visitDate: '2026-02-17', ageGroup: '26-40', visitorCount: 190 },
    { visitDate: '2026-02-17', ageGroup: '41-60', visitorCount: 45  },
    { visitDate: '2026-02-17', ageGroup: '>60',   visitorCount: 10  },
  ],

  topBooth: [
    { expoId: 'e1', boothId: 'b1', boothNo: 'A-01', visitorCount: 420 },
    { expoId: 'e1', boothId: 'b2', boothNo: 'B-03', visitorCount: 385 },
    { expoId: 'e1', boothId: 'b3', boothNo: 'A-05', visitorCount: 310 },
    { expoId: 'e1', boothId: 'b4', boothNo: 'C-02', visitorCount: 275 },
    { expoId: 'e1', boothId: 'b5', boothNo: 'B-07', visitorCount: 230 },
  ],

  topBoothDownload: [
    { expoId: 'e1', boothId: 'b1', boothNo: 'A-01', downloadCount: 850, uniqueDownloaders: 320 },
    { expoId: 'e1', boothId: 'b3', boothNo: 'A-05', downloadCount: 620, uniqueDownloaders: 245 },
    { expoId: 'e1', boothId: 'b2', boothNo: 'B-03', downloadCount: 490, uniqueDownloaders: 198 },
    { expoId: 'e1', boothId: 'b5', boothNo: 'B-07', downloadCount: 340, uniqueDownloaders: 150 },
    { expoId: 'e1', boothId: 'b4', boothNo: 'C-02', downloadCount: 210, uniqueDownloaders: 95  },
  ],

  // form-avg: backend คำนวณมาให้แล้ว
  formAvg: [
    { responseId: '1', title: 'ความพึงพอใจโดยรวม',            averageRating: 3.93, responseCount: 150 },
    { responseId: '2', title: 'ความสะดวกในการเดินทาง',         averageRating: 3.61, responseCount: 148 },
    { responseId: '3', title: 'ความหลากหลายของบูธ',            averageRating: 4.11, responseCount: 150 },
    { responseId: '4', title: 'ความสะอาดและความเป็นระเบียบ',   averageRating: 4.33, responseCount: 150 },
  ],

  // Mock ตรงกับ real API — rating_1..5 (ไม่ใช่ "1".."5")
  formRating: [
    { questionNo: '1', questionTitle: 'ความพึงพอใจโดยรวม',            rating1: 5,  rating2: 12, rating3: 28, rating4: 55, rating5: 50 },
    { questionNo: '2', questionTitle: 'ความสะดวกในการเดินทาง',         rating1: 8,  rating2: 18, rating3: 35, rating4: 50, rating5: 37 },
    { questionNo: '3', questionTitle: 'ความหลากหลายของบูธ',            rating1: 3,  rating2: 8,  rating3: 20, rating4: 60, rating5: 59 },
    { questionNo: '4', questionTitle: 'ความสะอาดและความเป็นระเบียบ',   rating1: 2,  rating2: 5,  rating3: 15, rating4: 48, rating5: 80 },
  ],

  // Mock ตรงกับ real API — key เป็น q_1, q_2... ไม่มี user_id, ไม่มี answers nested
  formResponse: {
    questions: {
      'q_1': 'ความพึงพอใจโดยรวม',
      'q_2': 'ข้อเสนอแนะเพิ่มเติม',
      'q_3': 'สิ่งที่ประทับใจที่สุด',
    },
    responses: [
      { age_group: '18-25', gender: 'female', q_1: '5', q_2: 'งานดีมากค่ะ ชอบมากเลย',          q_3: 'บูธเทคโนโลยีสุดเจ๋งมาก' },
      { age_group: '26-40', gender: 'male',   q_1: '4', q_2: 'ที่จอดรถน้อยเกินไปครับ',          q_3: 'การจัดงานเป็นระเบียบดี' },
      { age_group: '18-25', gender: 'female', q_1: '5', q_2: 'อยากให้จัดอีกนะคะ',               q_3: 'มีของแจกเยอะมาก' },
      { age_group: '41-60', gender: 'male',   q_1: '3', q_2: 'แอร์เย็นเกินไปหน่อยครับ',         q_3: 'ได้เจอคนรู้จักใหม่เยอะ' },
      { age_group: '26-40', gender: 'other',  q_1: '4', q_2: 'ที่นั่งน้อยมากเลย',               q_3: 'บรรยากาศดีมาก' },
      { age_group: '18-25', gender: 'female', q_1: '5', q_2: 'บูธสวยมากเลยค่ะ',                 q_3: 'การแสดงบนเวทีสนุกมาก' },
      { age_group: '26-40', gender: 'male',   q_1: '4', q_2: 'ควรมีน้ำดื่มฟรีบริการด้วยครับ',   q_3: 'ได้ความรู้ใหม่เยอะมาก' },
      { age_group: '>60',   gender: 'male',   q_1: '4', q_2: 'ป้ายบอกทางน้อยไปหน่อย',           q_3: 'สินค้าหลากหลายดีครับ' },
      { age_group: '18-25', gender: 'female', q_1: '5', q_2: 'ชอบมากค่ะ จะมาอีกแน่นอน',         q_3: 'ได้ลองสินค้าใหม่หลายอย่าง' },
      { age_group: '26-40', gender: 'female', q_1: '3', q_2: 'คิวยาวมากบางบูธรอนานมาก',         q_3: 'ฟูดโซนอร่อยมากเลยค่ะ' },
      { age_group: '18-25', gender: 'male',   q_1: '4', q_2: '',                                 q_3: 'บูธ VR สนุกที่สุด' },
      { age_group: '41-60', gender: 'female', q_1: '5', q_2: 'จัดงานได้ดีมากค่ะ ประทับใจ',     q_3: 'ได้พบปะผู้ประกอบการหลายราย' },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// TRANSFORM HELPERS (PascalCase / snake_case → camelCase)
// backend ส่ง PascalCase มาจาก Go struct
// ══════════════════════════════════════════════════════════════

function transformTicket(d: any): TicketCount {
  return {
    status:      d.Status      || d.status,
    ticketCount: d.TicketCount ?? d.ticket_count ?? 0,
  };
}

function transformZoneRank(d: any): ZoneRank {
  return {
    zoneId:       d.ZoneID   || d.zone_id,
    // backend ส่ง Title ไม่ใช่ ZoneName
    zoneName:     d.Title    || d.ZoneName || d.zone_name || d.title,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformZoneHour(d: any): ZoneHour {
  return {
    zoneId:       d.ZoneID   || d.zone_id,
    // backend ส่ง Title ไม่ใช่ ZoneName
    zoneName:     d.Title    || d.ZoneName || d.zone_name || d.title,
    hour:         d.Hour     || d.hour,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformVisitHour(d: any): VisitHour {
  return {
    hour:         d.Hour     || d.hour,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformVisitGender(d: any): VisitGender {
  return {
    visitDate:    d.VisitDate  || d.visit_date,
    gender:       d.Gender     || d.gender,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformVisitAge(d: any): VisitAge {
  return {
    visitDate:    d.VisitDate  || d.visit_date,
    ageGroup:     d.AgeGroup   || d.age_group,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformTopBooth(d: any): TopBooth {
  return {
    expoId:       d.ExpoID   || d.expo_id,
    boothId:      d.BoothID  || d.booth_id,
    boothNo:      d.BoothNo  || d.booth_no,
    visitorCount: d.VisitorCount ?? d.visitor_count ?? 0,
  };
}

function transformTopBoothDownload(d: any): TopBoothDownload {
  return {
    expoId:            d.ExpoID            || d.expo_id,
    boothId:           d.BoothID           || d.booth_id,
    boothNo:           d.BoothNo           || d.booth_no,
    downloadCount:     d.DownloadCount     ?? d.download_count     ?? 0,
    uniqueDownloaders: d.UniqueDownloaders ?? d.unique_downloaders ?? 0,
  };
}

// backend ส่ง rating_1..rating_5 (ไม่ใช่ "1".."5")
function transformFormRating(d: any): FormRating {
  return {
    questionNo:    d.question_no    || d.QuestionNo,
    questionTitle: d.question_title || d.QuestionTitle,
    rating1: d.rating_1 ?? d['1'] ?? 0,
    rating2: d.rating_2 ?? d['2'] ?? 0,
    rating3: d.rating_3 ?? d['3'] ?? 0,
    rating4: d.rating_4 ?? d['4'] ?? 0,
    rating5: d.rating_5 ?? d['5'] ?? 0,
  };
}

// form-avg: backend ส่ง snake_case
function transformFormAvg(d: any): FormAvg {
  return {
    responseId:    d.response_id    || d.ResponseId    || '',
    title:         d.title          || d.Title          || '',
    averageRating: parseFloat(d.average_rating ?? d.AverageRating ?? 0),
    responseCount: d.response_count ?? d.ResponseCount ?? 0,
  };
}

// form-response: key เป็น q_1, q_2... ไม่มี user_id, ไม่มี answers nested
// responses แต่ละ row: { age_group, gender, q_1: "...", q_2: "..." }
function transformFormResponse(d: any): FormResponseData {
  return {
    questions: d.questions || {},       // { "q_1": "ชื่อคำถาม", ... }
    responses: (d.responses || []).map((r: any) => {
      // normalize key snake_case → เก็บ as-is เพราะ DashboardTab ใช้ r[key] ตรงๆ
      return r as Record<string, string>;
    }),
  };
}

// ══════════════════════════════════════════════════════════════
// API FUNCTIONS
// ══════════════════════════════════════════════════════════════

async function safeFetch<T>(url: string, transform: (d: any) => T, fallback: T[]): Promise<T[]> {
  try {
    const res = await fetchWithAuth(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    return Array.isArray(data) ? data.map(transform) : fallback;
  } catch {
    return fallback;
  }
}

export async function getDashboardData(expoId: string): Promise<DashboardData> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return MOCK;
  }

  const BASE = `${API_URL}/expo-dashboard/${expoId}`;

  const [
    ticketCount,
    zoneRank,
    zoneHour,
    visitHour,
    visitGender,
    visitAge,
    topBooth,
    topBoothDownload,
    formRatingRaw,
    formAvgRaw,
    formResponseRaw,
  ] = await Promise.all([
    safeFetch(`${BASE}/ticket-count`,       transformTicket,           []),
    safeFetch(`${BASE}/zone-rank`,          transformZoneRank,         []),
    safeFetch(`${BASE}/zone-hour`,          transformZoneHour,         []),
    safeFetch(`${BASE}/visit-hour`,         transformVisitHour,        []),
    safeFetch(`${BASE}/visit-gender`,       transformVisitGender,      []),
    safeFetch(`${BASE}/visit-age`,          transformVisitAge,         []),
    safeFetch(`${BASE}/top-booth`,          transformTopBooth,         []),
    safeFetch(`${BASE}/top-booth-download`, transformTopBoothDownload, []),
    safeFetch(`${BASE}/form-rating-count`,  transformFormRating,       []),
    safeFetch(`${BASE}/form-avg`,           transformFormAvg,          []),
    fetchWithAuth(`${BASE}/form-response`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null),
  ]);

  return {
    ticketCount,
    zoneRank,
    zoneHour,
    visitHour,
    visitGender,
    visitAge,
    topBooth,
    topBoothDownload,
    formRating: formRatingRaw,
    formAvg: formAvgRaw,
    formResponse: formResponseRaw ? transformFormResponse(formResponseRaw) : null,
  };
}