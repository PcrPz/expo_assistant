// src/features/booths/api/boothDashboardApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  BoothTotalInteraction,
  BoothGenderInteraction,
  BoothAgeInteraction,
  BoothHourlyInteraction,
  BoothDailyInteraction,
  BoothFormRating,
  BoothFormAvg,
  BoothFormResponseData,
  BoothDashboardData,
} from '../types/boothDashboard.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ─── Toggle: false เมื่อ backend พร้อม ────────────────────────
const USE_MOCK = false;

// ══════════════════════════════════════════════════════════════
// MOCK DATA — ตรง structure จริงของ backend (PascalCase)
// ══════════════════════════════════════════════════════════════
const MOCK_RAW = {

  // GET /total-booth
  // { "TotalUsers": 754 }
  total: { TotalUsers: 754 },

  // GET /total-booth-gender
  // [{ "Gender": "female", "TotalUsers": 385 }, ...]
  gender: [
    { Gender: 'female', TotalUsers: 385 },
    { Gender: 'male',   TotalUsers: 350 },
    { Gender: 'other',  TotalUsers: 19  },
  ],

  // GET /total-booth-age
  // [{ "AgeRange": "13-19", "TotalUsers": 65 }, ...]
  age: [
    { AgeRange: '13-19', TotalUsers: 65  },
    { AgeRange: '20-39', TotalUsers: 310 },
    { AgeRange: '40-59', TotalUsers: 245 },
    { AgeRange: '>59',   TotalUsers: 29  },
  ],

  // GET /total-booth-hour
  // [{ "Date": "2026-02-15", "Hour": "2026-02-15 09:00:00", "TotalUsers": 18 }, ...]
  hourly: [
    { Date: '2026-02-15', Hour: '2026-02-15 09:00:00', TotalUsers: 18  },
    { Date: '2026-02-15', Hour: '2026-02-15 10:00:00', TotalUsers: 42  },
    { Date: '2026-02-15', Hour: '2026-02-15 11:00:00', TotalUsers: 67  },
    { Date: '2026-02-15', Hour: '2026-02-15 12:00:00', TotalUsers: 55  },
    { Date: '2026-02-15', Hour: '2026-02-15 13:00:00', TotalUsers: 80  },
    { Date: '2026-02-15', Hour: '2026-02-15 14:00:00', TotalUsers: 72  },
    { Date: '2026-02-15', Hour: '2026-02-15 15:00:00', TotalUsers: 48  },
    { Date: '2026-02-16', Hour: '2026-02-16 09:00:00', TotalUsers: 25  },
    { Date: '2026-02-16', Hour: '2026-02-16 10:00:00', TotalUsers: 61  },
    { Date: '2026-02-16', Hour: '2026-02-16 11:00:00', TotalUsers: 90  },
    { Date: '2026-02-16', Hour: '2026-02-16 12:00:00', TotalUsers: 78  },
    { Date: '2026-02-16', Hour: '2026-02-16 13:00:00', TotalUsers: 110 },
    { Date: '2026-02-16', Hour: '2026-02-16 14:00:00', TotalUsers: 88  },
    { Date: '2026-02-16', Hour: '2026-02-16 15:00:00', TotalUsers: 63  },
  ],

  // GET /attendance-booth
  // [{ "Date": "2026-02-15", "TotalUsers": 120 }, ...]
  attendance: [
    { Date: '2026-02-15', TotalUsers: 120 },
    { Date: '2026-02-16', TotalUsers: 185 },
    { Date: '2026-02-17', TotalUsers: 95  },
  ],

  // GET /queue-booth
  // [{ "Date": "2026-02-15", "TotalUsers": 45 }, ...]
  queue: [
    { Date: '2026-02-15', TotalUsers: 45 },
    { Date: '2026-02-16', TotalUsers: 72 },
    { Date: '2026-02-17', TotalUsers: 38 },
  ],

  // GET /download-booth
  // [{ "Date": "2026-02-15", "TotalUsers": 88 }, ...]
  download: [
    { Date: '2026-02-15', TotalUsers: 88  },
    { Date: '2026-02-16', TotalUsers: 134 },
    { Date: '2026-02-17', TotalUsers: 61  },
  ],

  // GET /locate-booth
  // [{ "Date": "2026-02-15", "TotalUsers": 105 }, ...]
  locate: [
    { Date: '2026-02-15', TotalUsers: 105 },
    { Date: '2026-02-16', TotalUsers: 162 },
    { Date: '2026-02-17', TotalUsers: 83  },
  ],

  // GET /form-avg
  // [{ "response_id": "1", "title": "...", "average_rating": 3.93, "response_count": 150 }, ...]
  formAvg: [
    { response_id: '1', title: 'ความพึงพอใจโดยรวม',           average_rating: 3.93, response_count: 150 },
    { response_id: '2', title: 'คุณภาพสินค้าและบริการ',        average_rating: 4.12, response_count: 148 },
    { response_id: '3', title: 'ความเป็นมิตรของเจ้าหน้าที่',   average_rating: 4.35, response_count: 150 },
    { response_id: '4', title: 'ความคุ้มค่าของราคา',            average_rating: 3.61, response_count: 145 },
  ],

  // GET /form-rating-count
  // [{ "question_no": "1", "question_title": "...", "1": 5, "2": 12, "3": 28, "4": 55, "5": 50 }, ...]
  formRating: [
    { question_no: '1', question_title: 'ความพึงพอใจโดยรวม',         '1': 5,  '2': 12, '3': 28, '4': 55, '5': 50 },
    { question_no: '2', question_title: 'คุณภาพสินค้าและบริการ',      '1': 3,  '2': 8,  '3': 22, '4': 62, '5': 53 },
    { question_no: '3', question_title: 'ความเป็นมิตรของเจ้าหน้าที่', '1': 2,  '2': 5,  '3': 15, '4': 55, '5': 73 },
    { question_no: '4', question_title: 'ความคุ้มค่าของราคา',          '1': 8,  '2': 18, '3': 38, '4': 48, '5': 33 },
  ],

  // GET /form-response
  // { "questions": { "1": "ชื่อ" }, "responses": [{ "user_id": "...", "1": "5", ... }] }
  formResponse: {
    questions: {
      '1': 'ความพึงพอใจโดยรวม',
      '2': 'ข้อเสนอแนะเพิ่มเติม',
      '3': 'สิ่งที่ประทับใจที่สุด',
    },
    responses: [
      { user_id: 'u001', age_group: '18-25', gender: 'female', '1': '5', '2': 'บูธสวยมากค่ะ ชอบมากเลย',            '3': 'สินค้าหลากหลายมาก' },
      { user_id: 'u002', age_group: '26-40', gender: 'male',   '1': '4', '2': 'พนักงานบริการดีครับ',                '3': 'เจ้าหน้าที่ใจดี' },
      { user_id: 'u003', age_group: '18-25', gender: 'female', '1': '5', '2': 'อยากให้มีสินค้าใหม่ๆ เพิ่มขึ้นอีก', '3': 'ราคาถูกมาก' },
      { user_id: 'u004', age_group: '41-60', gender: 'male',   '1': '3', '2': 'คิวยาวเกินไปนิดหน่อยครับ',           '3': 'ได้ลองสินค้าก่อนซื้อ' },
      { user_id: 'u005', age_group: '26-40', gender: 'other',  '1': '4', '2': 'บรรยากาศดีมากเลย',                  '3': 'การตกแต่งบูธสวย' },
      { user_id: 'u006', age_group: '18-25', gender: 'female', '1': '5', '2': 'ชอบมากค่ะ จะกลับมาอีก',             '3': 'ได้ลองสินค้าใหม่' },
      { user_id: 'u007', age_group: '26-40', gender: 'male',   '1': '4', '2': 'ควรมีที่นั่งพักมากกว่านี้ครับ',       '3': 'ข้อมูลสินค้าละเอียดดี' },
      { user_id: 'u008', age_group: '>60',   gender: 'male',   '1': '4', '2': 'ป้ายบอกทางน้อยไปหน่อย',             '3': 'สินค้าคุณภาพดีมาก' },
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// TRANSFORM HELPERS — PascalCase backend → camelCase frontend
// ══════════════════════════════════════════════════════════════

function transformTotal(d: any): BoothTotalInteraction {
  return { totalUsers: d.TotalUsers ?? d.total_users ?? 0 };
}

function transformGender(d: any): BoothGenderInteraction {
  return {
    gender:     d.Gender     || d.gender,
    totalUsers: d.TotalUsers ?? d.total_users ?? 0,
  };
}

function transformAge(d: any): BoothAgeInteraction {
  return {
    ageRange:   d.AgeRange   || d.age_range,
    totalUsers: d.TotalUsers ?? d.total_users ?? 0,
  };
}

function transformHourly(d: any): BoothHourlyInteraction {
  return {
    date:       d.Date       || d.date,
    hour:       d.Hour       || d.hour,
    totalUsers: d.TotalUsers ?? d.total_users ?? 0,
  };
}

function transformDaily(d: any): BoothDailyInteraction {
  return {
    date:       d.Date       || d.date,
    totalUsers: d.TotalUsers ?? d.total_users ?? 0,
  };
}

// form-avg: backend ใช้ snake_case (response_id, average_rating, response_count)
function transformFormAvg(d: any): BoothFormAvg {
  return {
    responseId:    d.response_id    || d.ResponseId    || '',
    title:         d.title          || d.Title          || '',
    averageRating: parseFloat(d.average_rating ?? d.AverageRating ?? 0),
    responseCount: d.response_count ?? d.ResponseCount ?? 0,
  };
}

// form-rating-count: key เป็น "1","2","3","4","5" ตัวเลข string
function transformFormRating(d: any): BoothFormRating {
  return {
    questionNo:    d.question_no    || d.QuestionNo    || '',
    questionTitle: d.question_title || d.QuestionTitle || '',
    rating1: d['1'] ?? d.rating_1 ?? 0,
    rating2: d['2'] ?? d.rating_2 ?? 0,
    rating3: d['3'] ?? d.rating_3 ?? 0,
    rating4: d['4'] ?? d.rating_4 ?? 0,
    rating5: d['5'] ?? d.rating_5 ?? 0,
  };
}

// form-response: key คำถามเป็นตัวเลข "1","2"... ไม่ใช่ q_1
function transformFormResponse(d: any): BoothFormResponseData {
  return {
    questions: d.questions || {},
    responses: (d.responses || []).map((r: any) => r as Record<string, string>),
  };
}

// ══════════════════════════════════════════════════════════════
// SAFE FETCH HELPER
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

// ══════════════════════════════════════════════════════════════
// MAIN API FUNCTION
// ══════════════════════════════════════════════════════════════

export async function getBoothDashboardData(
  expoId: string,
  boothId: string,
): Promise<BoothDashboardData> {

  // ── MOCK MODE ─────────────────────────────────────────────
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    return {
      total:      transformTotal(MOCK_RAW.total),
      gender:     MOCK_RAW.gender.map(transformGender),
      age:        MOCK_RAW.age.map(transformAge),
      hourly:     MOCK_RAW.hourly.map(transformHourly),
      attendance: MOCK_RAW.attendance.map(transformDaily),
      queue:      MOCK_RAW.queue.map(transformDaily),
      download:   MOCK_RAW.download.map(transformDaily),
      locate:     MOCK_RAW.locate.map(transformDaily),
      formAvg:    MOCK_RAW.formAvg.map(transformFormAvg),
      formRating: MOCK_RAW.formRating.map(transformFormRating),
      formResponse: transformFormResponse(MOCK_RAW.formResponse),
    };
  }

  // ── REAL API MODE ──────────────────────────────────────────
  // เปลี่ยน USE_MOCK = false เมื่อ backend พร้อม
  const BASE = `${API_URL}/booth-dashboard/${expoId}/${boothId}`;

  const [
    totalRaw,
    gender,
    age,
    hourly,
    attendance,
    queue,
    download,
    locate,
    formAvgRaw,
    formRatingRaw,
    formResponseRaw,
  ] = await Promise.all([
    fetchWithAuth(`${BASE}/total-booth`).then(r => r.ok ? r.json() : null).catch(() => null),
    safeFetch(`${BASE}/total-booth-gender`,  transformGender,  []),
    safeFetch(`${BASE}/total-booth-age`,     transformAge,     []),
    safeFetch(`${BASE}/total-booth-hour`,    transformHourly,  []),
    safeFetch(`${BASE}/attendance-booth`,    transformDaily,   []),
    safeFetch(`${BASE}/queue-booth`,         transformDaily,   []),
    safeFetch(`${BASE}/download-booth`,      transformDaily,   []),
    safeFetch(`${BASE}/locate-booth`,        transformDaily,   []),
    safeFetch(`${BASE}/form-avg`,            transformFormAvg, []),
    safeFetch(`${BASE}/form-rating-count`,   transformFormRating, []),
    fetchWithAuth(`${BASE}/form-response`).then(r => r.ok ? r.json() : null).catch(() => null),
  ]);

  return {
    total:       totalRaw ? transformTotal(totalRaw) : { totalUsers: 0 },
    gender,
    age,
    hourly,
    attendance,
    queue,
    download,
    locate,
    formAvg:     formAvgRaw,
    formRating:  formRatingRaw,
    formResponse: formResponseRaw ? transformFormResponse(formResponseRaw) : null,
  };
}