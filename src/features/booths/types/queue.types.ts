// src/features/queues/types/queue.types.ts

export type QueueStatus = 'publish' | 'unpublish';
export type QueuedUserStatus = 'waiting' | 'calling' | 'completed' | 'skipped' | 'canceled';

// Response Types
export interface BoothQueue {
  QueueID: string;
  Title: string;
  Status: QueueStatus;
  PublishAt: string | null;
  CurrentQueue: number | null;
  NextQueue: number | null;
  // ✅ Current User Info
  CurrentUserID: string | null;
  CurrentFirstName: string | null;
  CurrentLastName: string | null;
  CurrentEmail: string | null;
  // ✅ Next User Info
  NextUserID: string | null;
  NextFirstName: string | null;
  NextLastName: string | null;
  NextEmail: string | null;
}

export interface QueueDetail extends BoothQueue {
  // เพิ่มข้อมูลเพิ่มเติมถ้ามี
}

export interface MyQueue {
  expo_id: string;
  booth_id: string;
  queue_id: string;
  title: string;
  position: number;
  status: QueuedUserStatus;
  queue_before: number;
}

// Request Types
export interface CreateQueueRequest {
  booth_id: string;
  title: string;
  status: QueueStatus;
}

export interface UpdateQueueRequest {
  queue_id: string;
  title: string;
  status: QueueStatus;
}

export interface JoinQueueRequest {
  queue_id: string;
}

export interface LeaveQueueRequest {
  queue_id: string;
}

export interface CallNextRequest {
  queue_id: string;
  status: 'completed' | 'skipped';
}

// Response Types
export interface JoinQueueResponse {
  position: number;
}

export interface CallNextResponse {
  current_queue: number;
}