// src/features/notifications/hooks/useNotification.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { checkNotiRead, getNotiList } from '../api/notiApi';
import type { NotiItem } from '../types/noti.types';

export type NotiTab = 'all' | 'unread' | 'action';

// group A — type ที่มีปุ่มต้องตอบ ✓/✗
const GROUP_A_TYPES: NotiItem['Type'][] = [
  'new_follower',
  'following_request',
  'expo_invitation',
  'booth_group_invitation',
  'booth_request_join',
  'booth_invite_join',
];

export function useNotification() {
  const [hasUnread, setHasUnread] = useState(false);
  const [notis, setNotis] = useState<NotiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotiTab>('all');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Check dot ───────────────────────────────────────────
  const checkDot = useCallback(async () => {
    const result = await checkNotiRead();
    setHasUnread(result);
  }, []);

  // ─── Load list ───────────────────────────────────────────
  const loadNotis = useCallback(async () => {
    setLoading(true);
    const result = await getNotiList(1, 50);
    if (result) setNotis(result.Notis);
    setLoading(false);
  }, []);

  // ─── Open panel ──────────────────────────────────────────
  const openPanel = useCallback(async () => {
    setIsOpen(true);
    await loadNotis();
  }, [loadNotis]);

  // ─── Close panel ─────────────────────────────────────────
  const closePanel = useCallback(() => {
    setIsOpen(false);
    setActiveTab('all');
  }, []);

  // ─── Mark local as read ──────────────────────────────────
  const markLocalRead = useCallback((notiId: string) => {
    setNotis(prev =>
      prev.map(n => (n.NotiID === notiId ? { ...n, IsRead: true } : n))
    );
    checkDot();
  }, [checkDot]);

  // ─── Mark local is_accept as responded ───────────────────
  // เมื่อตอบรับ → IsAccept เปลี่ยนเป็น true/false ไม่ใช่ null อีกต่อไป
  // ทำให้หายออกจาก tab "ต้องตอบ" ทันที
  const markLocalAccepted = useCallback((notiId: string, accepted: boolean) => {
    setNotis(prev =>
      prev.map(n => (n.NotiID === notiId ? { ...n, IsAccept: accepted } : n))
    );
  }, []);

  // ─── Filtered lists ──────────────────────────────────────
  const filteredNotis = notis.filter(n => {
    if (activeTab === 'unread') return !n.IsRead;
    // ต้องตอบ = group A + IsAccept = null (ยังไม่ได้ตอบ)
    if (activeTab === 'action') return GROUP_A_TYPES.includes(n.Type) && n.IsAccept === null;
    return true;
  });

  const unreadCount = notis.filter(n => !n.IsRead).length;
  const actionCount = notis.filter(n =>
    GROUP_A_TYPES.includes(n.Type) && n.IsAccept === null
  ).length;

  // ─── Polling every 60s ───────────────────────────────────
  useEffect(() => {
    checkDot();
    pollingRef.current = setInterval(checkDot, 60000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [checkDot]);

  return {
    hasUnread,
    notis,
    filteredNotis,
    loading,
    isOpen,
    activeTab,
    unreadCount,
    actionCount,
    openPanel,
    closePanel,
    setActiveTab,
    markLocalRead,
    markLocalAccepted,
    refreshDot: checkDot,
  };
}