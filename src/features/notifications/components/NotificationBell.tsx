// src/features/notifications/components/NotificationBell.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCheck, ClipboardCheck } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import { NotificationCard } from './NotificationCard';
import type { NotiTab } from '../hooks/useNotification';

export function NotificationBell() {
  const {
    hasUnread, filteredNotis, loading, isOpen, activeTab,
    unreadCount, actionCount,
    openPanel, closePanel, setActiveTab,
    markLocalRead, markLocalAccepted,
  } = useNotification();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click — ไม่ปิดถ้า click มาจาก modal portal
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // ถ้า click อยู่ใน modal portal (มี data-modal attribute) ไม่ปิด panel
      if (target.closest('[data-modal="user-profile"]')) return;
      if (panelRef.current && !panelRef.current.contains(target)) {
        closePanel();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closePanel]);

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell Button ── */}
      <button
        onClick={isOpen ? closePanel : openPanel}
        className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
        aria-label="การแจ้งเตือน"
      >
        <Bell size={22} color="white" strokeWidth={2} />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#5B9BD5]" />
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <>
          {/* Arrow */}
          <div className="absolute right-3 top-[calc(100%+2px)] z-40">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-sm" />
          </div>

          <div
            className="absolute right-0 top-[calc(100%+10px)] w-96 z-40 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">การแจ้งเตือน</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#3674B5] text-white text-[11px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-gray-100">
              {([
                { key: 'all' as const, label: 'ทั้งหมด', count: null as number | null },
                { key: 'unread' as const, label: 'ยังไม่อ่าน', count: unreadCount as number | null },
                { key: 'action' as const, label: 'ต้องตอบ', count: actionCount as number | null },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${activeTab === tab.key
                      ? 'bg-[#3674B5] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {tab.label}
                  {tab.count != null && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                      ${activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── List ── */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-[#3674B5]/20 border-t-[#3674B5] rounded-full animate-spin" />
                  <p className="text-xs text-gray-400">กำลังโหลด...</p>
                </div>
              ) : filteredNotis.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                filteredNotis.map(n => (
                  <NotificationCard
                    key={n.NotiID}
                    noti={n}
                    onMarkRead={markLocalRead}
                    onMarkAccepted={(id, accepted) => markLocalAccepted(id, accepted)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ tab }: { tab: NotiTab }) {
  const config: Record<NotiTab, {
    iconBg: string;
    icon: React.ReactNode;
    text: string;
    sub: string;
  }> = {
    all: {
      iconBg: 'bg-gray-100',
      icon: <BellOff size={26} className="text-gray-400" strokeWidth={1.5} />,
      text: 'ไม่มีการแจ้งเตือน',
      sub: 'การแจ้งเตือนใหม่จะปรากฏที่นี่',
    },
    unread: {
      iconBg: 'bg-[#ECFDF5]',
      icon: <CheckCheck size={26} className="text-[#4CAF82]" strokeWidth={1.5} />,
      text: 'อ่านหมดแล้ว',
      sub: 'ไม่มีการแจ้งเตือนที่ยังไม่ได้อ่าน',
    },
    action: {
      iconBg: 'bg-[#EEF4FB]',
      icon: <ClipboardCheck size={26} className="text-[#5B8FC9]" strokeWidth={1.5} />,
      text: 'ไม่มีรายการรอตอบ',
      sub: 'คำเชิญและคำขอทั้งหมดได้รับการตอบรับแล้ว',
    },
  };

  const c = config[tab];

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-3">
      <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
        {c.icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-gray-700">{c.text}</p>
        <p className="text-xs text-gray-400">{c.sub}</p>
      </div>
    </div>
  );
}