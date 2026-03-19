// src/features/notifications/config/notiConfig.ts
import {
  UserPlus, UserCheck, Building2, CreditCard, AlertCircle,
  Ticket, ScanLine, Megaphone, Clock, BellRing,
  Users, ClipboardList, MailOpen, MessageSquare,
  CalendarClock, Store,
  type LucideIcon,
} from 'lucide-react';
import type { NotiType } from '../types/noti.types';

export type NotiGroup = 'A' | 'B' | 'C';

export interface NotiConfig {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  group: NotiGroup;
  label: string;
}

export const NOTI_CONFIG: Record<NotiType, NotiConfig> = {
  // ── User ──────────────────────────────────────────────────
  new_follower: {
    icon: UserPlus,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'A',
    label: 'มีผู้ติดตามใหม่',
  },
  following_request: {
    icon: UserCheck,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'A',
    label: 'มีคนขอติดตาม',
  },

  // ── Expo ──────────────────────────────────────────────────
  expo_invitation: {
    icon: Building2,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'A',
    label: 'ได้รับเชิญเป็น Staff',
  },

  // ── ExpoPayment ───────────────────────────────────────────
  expo_payment_confirmed: {
    icon: CreditCard,
    iconColor: '#4CAF82',
    iconBg: '#ECFDF5',
    group: 'B',
    label: 'ชำระค่า Expo สำเร็จ',
  },
  expo_close_payment: {
    icon: AlertCircle,
    iconColor: '#F08050',
    iconBg: '#FFF7ED',
    group: 'B',
    label: 'Expo จบแล้ว กรุณาชำระเงิน',
  },

  // ── ExpoTicket ────────────────────────────────────────────
  ticket_payment_confirmed: {
    icon: Ticket,
    iconColor: '#9B72D8',
    iconBg: '#F5F3FF',
    group: 'C',
    label: 'ชำระค่า Ticket สำเร็จ',
  },
  ticket_scanned: {
    icon: ScanLine,
    iconColor: '#9B72D8',
    iconBg: '#F5F3FF',
    group: 'C',
    label: 'Ticket ถูก Scan แล้ว',
  },

  // ── ExpoNoti ──────────────────────────────────────────────
  expo_noti: {
    icon: Megaphone,
    iconColor: '#9CA3AF',
    iconBg: '#F9FAFB',
    group: 'B',
    label: 'ประกาศจาก Expo',
  },

  // ── BoothQueue ────────────────────────────────────────────
  waiting_queue: {
    icon: Clock,
    iconColor: '#D4A840',
    iconBg: '#FEFCE8',
    group: 'C',
    label: 'ใกล้ถึงคิวของคุณ',
  },
  calling_queue: {
    icon: BellRing,
    iconColor: '#F08050',
    iconBg: '#FFF7ED',
    group: 'C',
    label: 'ถึงคิวของคุณแล้ว!',
  },

  // ── BoothGroup ────────────────────────────────────────────
  booth_group_invitation: {
    icon: Users,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'A',
    label: 'ได้รับเชิญเข้า Booth Group',
  },

  // ── BoothJoinForm ─────────────────────────────────────────
  booth_request_join: {
    icon: ClipboardList,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'B',
    label: 'มีคำขอร่วมออกบูธใหม่',
  },
  booth_invite_join: {
    icon: MailOpen,
    iconColor: '#5B8FC9',
    iconBg: '#EEF4FB',
    group: 'B',
    label: 'ได้รับคำเชิญร่วมออกบูธ',
  },
  booth_response_join: {
    icon: MessageSquare,
    iconColor: '#4CAF82',
    iconBg: '#ECFDF5',
    group: 'C',
    label: 'มีการตอบรับคำขอ',
  },

  // ── BoothPayment ──────────────────────────────────────────
  booth_payment_confirmed: {
    icon: CreditCard,
    iconColor: '#4CAF82',
    iconBg: '#ECFDF5',
    group: 'C',
    label: 'ชำระค่าบูธสำเร็จ',
  },

  // ── BoothNoti ─────────────────────────────────────────────
  booth_noti: {
    icon: Store,
    iconColor: '#9CA3AF',
    iconBg: '#F9FAFB',
    group: 'C',
    label: 'ประกาศจาก Booth',
  },

  // ── Event ─────────────────────────────────────────────────
  event_reminder: {
    icon: CalendarClock,
    iconColor: '#9B72D8',
    iconBg: '#F5F3FF',
    group: 'C',
    label: 'กิจกรรมใกล้จะเริ่ม',
  },
};