// src/features/events/types/expoAnnouncement.types.ts

export type ExpoAnnouncementStatus = 'publish' | 'unpublish';

export interface ExpoAnnouncement {
  NotiID: string;
  Title: string;
  Status: ExpoAnnouncementStatus;
  PublishAt: string | null;
}

export interface ExpoAnnouncementDetail {
  NotiID: string;
  Title: string;
  Detail: string | null;
  Status: ExpoAnnouncementStatus;
  PublishAt: string | null;
  Pics: string[];
}

export interface CreateExpoAnnouncementRequest {
  title: string;
  detail?: string;
  status: ExpoAnnouncementStatus;
  files?: File[];
}

export interface UpdateExpoAnnouncementRequest {
  noti_id: string;
  title: string;
  detail?: string;
  status: ExpoAnnouncementStatus;
  deleted_pics?: string[];
  files?: File[];
}