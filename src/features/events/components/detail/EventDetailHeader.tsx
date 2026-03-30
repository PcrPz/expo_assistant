// src/features/events/components/detail/EventDetailHeader.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Event, EventRole } from '../../types/event.types';

type TabType = 'detail' | 'staff' | 'booth' | 'form' | 'dashboard' | 'applications' | 'tickets' | 'announcements' | 'checkout';

interface EventDetailHeaderProps {
  event: Event;
  role: EventRole;
  activeTab: TabType;
  availableTabs: TabType[];
  onTabChange: (tab: TabType) => void;
  backUrl?: string; // ถ้ามี → แสดงปุ่มกลับ
}

export function EventDetailHeader({
  event,
  role,
  activeTab,
  availableTabs,
  onTabChange,
  backUrl,
}: EventDetailHeaderProps) {
  const router = useRouter();
  const logoUrl = getMinioFileUrl(event.thumbnail || event.logo);
  const defaultLogo = 'https://via.placeholder.com/80x80/5B9BD5/FFFFFF?text=Logo';

  const roleNames: Record<string, string> = {
    system_admin: 'ผู้ดูแลระบบ',
    owner: 'เจ้าของงาน',
    admin: 'ผู้จัดการ',
    staff: 'เจ้าหน้าที่',
    booth_staff: 'ผู้ร่วมออกบูธ',
  };

  const roleName = roleNames[role || ''] || 'ผู้เข้าชม';

  console.log('🎪 EventDetailHeader — event:', event);
  console.log('🎪 event.status:', event.status);

  const getTabLabel = (tab: TabType): string => {
    if (role === 'booth_staff') {
      const labels: Record<TabType, string> = {
      detail: 'ภาพรวม', staff: 'ทีมงาน', booth: 'บูธทั้งหมด',
      dashboard: 'บูธของฉัน', applications: 'คำขอ',
      form: 'แบบสอบถาม', tickets: 'ตั๋ว', announcements: 'ประกาศ', checkout: 'ชำระเงิน',
      };
      return labels[tab];
    }
    const labels: Record<TabType, string> = {
    detail: 'ภาพรวม', staff: 'ทีมงาน', booth: 'บูธ',
    dashboard: 'Dashboard', form: 'แบบสอบถาม', applications: 'คำขอ',
    tickets: 'ตั๋ว', announcements: 'ประกาศ', checkout: 'ชำระเงิน',
    };
    return labels[tab];
  };

  const getTabIcon = (tab: TabType): React.ReactElement => {
    const icons: Record<TabType, React.ReactElement> = {
      detail: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
      staff: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      booth: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      ),
      dashboard: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      applications: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
      ),
      tickets: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 1 1 0 6V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 1 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
        </svg>
      ),
      announcements: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      ),
      form: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
      checkout: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    };
    return icons[tab];
  };

  const LOGO = 88;
  const COVER = 100;
  const LOGO_PULL = LOGO * 0.4;

  return (
    <>
    <div className="sticky top-14 z-20 shadow-sm">

      {/* Cover Banner */}
      <div
        style={{
          height: `${COVER}px`,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 40%, #3674B5 70%, #498AC3 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.07,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* ── ปุ่มกลับ — บน banner ชิดซ้าย ── */}
        {backUrl && (
          <div className="absolute top-3 left-0 right-0">
            <div className="max-w-screen-xl mx-auto px-8">

              <button
                onClick={() => router.push(backUrl)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                กลับค้นหางาน Expo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* White zone */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-8">

          {/* Identity row */}
          <div
            className="flex items-center gap-5"
            style={{ paddingTop: '8px', paddingBottom: '16px' }}
          >
            {/* Logo */}
            <div
              style={{
                width: `${LOGO}px`,
                height: `${LOGO}px`,
                marginTop: `-${LOGO_PULL}px`,
                flexShrink: 0,
                borderRadius: '14px',
                overflow: 'hidden',
                border: '3px solid white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                background: '#e2e8f0',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <img
                src={logoUrl || defaultLogo}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = defaultLogo; }}
              />
            </div>

            {/* name + status + role */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">
                  {event.name}
                </h1>
                {event.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#FFF8E1', color: '#B45309', border: '1px solid #FFBD0D' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FFBD0D' }} />
                    รอชำระเงิน
                  </span>
                )}
                {event.status === 'unpublish' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: '#EEF4FB', color: '#3674B5', borderColor: '#B8D0EA' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#3674B5' }} />
                    พร้อมเผยแพร่
                  </span>
                )}
                {event.status === 'publish' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{ background: '#E8F4FD', color: '#2563a8', borderColor: '#93C5E8' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#498AC3' }} />
                    เผยแพร่แล้ว
                  </span>
                )}
                {event.status === 'close' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#DC2626' }} />
                    งานจบลงเเล้ว
                  </span>
                )}
                {event.status === 'complete' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#16A34A' }} />
                    เคลียเงินเสร็จสิ้น
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                บทบาทของคุณคือ <span className="font-semibold text-gray-700">{roleName}</span>
              </p>
            </div>
          </div>

          {/* Tabs — desktop */}
          <div className="hidden md:flex items-center -mb-px">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`
                  flex items-center justify-center gap-2 min-w-[100px] px-4 py-3.5 text-[15px] font-medium transition-all border-b-2 whitespace-nowrap
                  ${activeTab === tab
                    ? 'text-[#3674B5] border-[#3674B5] bg-blue-50'
                    : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
                  }
                `}
              >
                {getTabIcon(tab)}
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>

          {/* Tabs — mobile */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-2 pt-1 scrollbar-hide">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap flex-shrink-0 border-b-2
                  ${activeTab === tab
                    ? 'text-[#3674B5] border-[#3674B5] bg-blue-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {getTabIcon(tab)}
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
    </>
  );
}