// src/features/booths/types/event.types.ts

// ─── List item (from GetEventList) ───────────────────────────────────────────
export interface BoothEvent {
  EventID: string;
  Title: string;
  StartDate: string;
  EndDate: string;
  Thumbnail: string;
}

// ─── Detail (from GetEventDetail) ────────────────────────────────────────────
export interface BoothEventDetail {
  EventID: string;
  Title: string;
  StartDate: string;
  EndDate: string;
  Detail: string;
  Company: string;
  Email: string;
  Tel: string;
  Website1: string;
  Website2: string;
  Thumbnail: string;
  EventPics: string[];
}

// ─── Requests ─────────────────────────────────────────────────────────────────
export interface CreateBoothEventRequest {
  booth_id: string;
  title: string;
  start_date: string;
  end_date: string;
  detail?: string;
  company?: string;
  email?: string;
  tel?: string;
  website1?: string;
  website2?: string;
  thumbnail_file?: File;
  files?: File[];
}

export interface UpdateBoothEventRequest {
  event_id: string;
  title: string;
  start_date: string;
  end_date: string;
  detail?: string;
  company?: string;
  email?: string;
  tel?: string;
  website1?: string;
  website2?: string;
  thumbnail?: string;        // pic_id ของ thumbnail เดิม (ถ้าไม่เปลี่ยน)
  deleted_pics?: string[];   // pic_id ที่ต้องการลบ
  thumbnail_file?: File;     // ไฟล์ thumbnail ใหม่
  files?: File[];            // รูปเพิ่มเติมใหม่
}

// ─── Responses ────────────────────────────────────────────────────────────────
export interface CreateBoothEventResponse {
  event_id: string;
}