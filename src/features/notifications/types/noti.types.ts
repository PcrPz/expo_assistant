// src/features/notifications/types/noti.types.ts

// ─── Noti Types ───────────────────────────────────────────────
export type NotiType =
  | 'new_follower'
  | 'following_request'
  | 'expo_invitation'
  | 'expo_payment_confirmed'
  | 'expo_close_payment'
  | 'ticket_payment_confirmed'
  | 'ticket_scanned'
  | 'expo_noti'
  | 'waiting_queue'
  | 'calling_queue'
  | 'booth_group_invitation'
  | 'booth_request_join'
  | 'booth_invite_join'
  | 'booth_response_join'
  | 'booth_payment_confirmed'
  | 'booth_noti'
  | 'event_reminder';

// ─── List Item (from GET /noti/get-notis) ────────────────────
export interface NotiItem {
  NotiID: string;
  Type: NotiType;
  Title: string;
  IsRead: boolean;
  IsAlert: boolean;
  IsAccept: boolean | null;
  CreatedAt: string;
}

export interface GetNotiResult {
  Notis: NotiItem[];
  Total: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}

// ─── Detail Payloads (from GET /noti/get/:notiID/:type) ───────
export interface UserFollowDetail {
  NotiID: string;
  FollowUserID: string;
}

export interface ExpoInviteDetail {
  NotiID: string;
  ExpoID: string;
}

export interface ExpoPaymentDetail {
  NotiID: string;
  ExpoID: string;
  Title: string;
}

export interface ExpoTicketDetail {
  NotiID: string;
  ExpoID: string;
  TicketID: string;
}

export interface ExpoNotiDetail {
  NotiID: string;
  ExpoID: string;
  ExpoNotiID: string;
}

export interface BoothQueueDetail {
  NotiID: string;
  ExpoID: string;
  BoothID: string;
  QueueID: string;
}

export interface BoothGroupInviteDetail {
  NotiID: string;
  BoothGroupID: string;
}

export interface BoothJoinDetail {
  NotiID: string;
  ExpoID: string;
  BoothID: string;
  BoothGroupID: string;
  RequestID: string;
}

export interface BoothPaymentDetail {
  NotiID: string;
  BoothGroupID: string;
  RequestID: string;
}

export interface BoothNotiDetail {
  NotiID: string;
  ExpoID: string;
  BoothID: string;
  BoothNotiID: string;
}

export interface EventReminderDetail {
  NotiID: string;
  ExpoID: string;
  BoothID: string;
  EventID: string;
}

export type NotiDetail =
  | UserFollowDetail
  | ExpoInviteDetail
  | ExpoPaymentDetail
  | ExpoTicketDetail
  | ExpoNotiDetail
  | BoothQueueDetail
  | BoothGroupInviteDetail
  | BoothJoinDetail
  | BoothPaymentDetail
  | BoothNotiDetail
  | EventReminderDetail;

// ─── Extra data fetched for display ───────────────────────────
export interface OtherUserInfo {
  Firstname: string;
  Lastname: string;
  Email: string;
  Tel: string | null;
  Career: string | null;
  Company: string | null;
  Detail: string | null;
  ProfilePic: string | null;
}

export interface ExpoInfo {
  Title: string;
  Thumbnail: string;
  Status: string;
}

export interface BoothInfo {
  BoothID: string;
  BoothNo: string;
  Title: string | null;
  Thumbnail: string | null;
}

export interface BoothGroupInfo {
  ID: string;
  Title: string;
  ProfilePic: string | null;
}

export interface JoinFormInfo {
  ExpoID: string;
  ExpoTitle: string;
  BoothID: string;
  BoothNo: string;
  BoothGroupID: string;
  BoothGroupTitle: string;
  RequestID: string;
  Type: string;
  Status: string;
}

export interface EventInfo {
  EventID: string;
  Title: string;
  StartDate: string;
  EndDate: string;
  Thumbnail: string | null;
}