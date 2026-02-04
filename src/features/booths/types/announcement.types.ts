// src/features/booths/types/announcement.types.ts

export type AnnouncementStatus = 'publish' | 'unpublish';

export interface BoothAnnouncement {
  NotiID: string;
  BoothID: string;             // ✅ มี BoothID อยู่แล้ว (ถ้ายังไม่มีให้เพิ่ม)
  Title: string;
  Status: AnnouncementStatus;
  PublishAt: string | null;
  CreatedAt: string;           // ✅ เพิ่ม timestamp
  UpdatedAt: string;           // ✅ เพิ่ม timestamp
}

export interface BoothAnnouncementDetail {
  NotiID: string;
  BoothID: string;             // ✅ มี BoothID อยู่แล้ว
  Title: string;
  Detail: string | null;
  Status: AnnouncementStatus;
  PublishAt: string | null;
  Pics: string[];
  CreatedAt: string;           // ✅ เพิ่ม timestamp
  UpdatedAt: string;           // ✅ เพิ่ม timestamp
}

export interface CreateBoothAnnouncementRequest {
  booth_id: string;
  title: string;
  detail?: string;
  status: AnnouncementStatus;
  files?: File[];
}

export interface UpdateBoothAnnouncementRequest {
  noti_id: string;
  title: string;
  detail?: string;
  status: AnnouncementStatus;
  deleted_pics?: string[];
  files?: File[];
}

export interface DeleteAnnouncementRequest {
  notiID: string;
}

export interface CreateAnnouncementResponse {
  notiID: string;
}