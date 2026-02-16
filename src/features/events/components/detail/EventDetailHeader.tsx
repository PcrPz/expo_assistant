// src/features/events/components/detail/EventDetailHeader.tsx
'use client';

import React from 'react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Event, EventRole } from '../../types/event.types';

// ✅ Tab Type - ลบ invitations
type TabType = 'detail' | 'staff' | 'booth' | 'dashboard' | 'applications';

interface EventDetailHeaderProps {
  event: Event;
  role: EventRole;
  activeTab: TabType;
  availableTabs: TabType[];
  onTabChange: (tab: TabType) => void;
}

export function EventDetailHeader({ 
  event, 
  role, 
  activeTab, 
  availableTabs, 
  onTabChange 
}: EventDetailHeaderProps) {
  const logoUrl = getMinioFileUrl(event.thumbnail || event.logo);
  const defaultLogo = 'https://via.placeholder.com/80x80/5B9BD5/FFFFFF?text=Logo';

  const roleNames: Record<string, string> = {
    system_admin: 'ผู้ดูแลระบบ',
    owner: 'เจ้าของงาน',
    admin: 'ผู้จัดการ',
    staff: 'เจ้าหน้าที่',
    event_staff: 'เจ้าหน้าที่งาน',
    booth_staff: 'ผู้ร่วมออกบูธ',
  };

  const roleName = roleNames[role || ''] || 'ผู้เข้าชม';

  // ✅ Tab Labels แยกตาม Role
  const getTabLabel = (tab: TabType): string => {
    if (role === 'booth_staff') {
      const boothStaffLabels: Record<TabType, string> = {
        detail: 'รายละเอียด',
        staff: 'Staff',
        booth: 'บูธทั้งหมด',
        dashboard: 'บูธของฉัน',
        applications: 'คำขอเข้าบูธ',
      };
      return boothStaffLabels[tab];
    }
    
    const defaultLabels: Record<TabType, string> = {
      detail: 'Expo',
      staff: 'Staff',
      booth: 'Booth',
      dashboard: 'Dashboard',
      applications: 'คำขอเข้าบูธ',
    };
    return defaultLabels[tab];
  };

  // ✅ Icons สำหรับแต่ละ Tab (เพิ่ม 2 icons ใหม่)
  const getTabIcon = (tab: TabType): React.ReactElement => {
    const icons: Record<TabType, React.ReactElement> = {
      detail: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        </svg>
      ),
      staff: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      booth: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
      ),
      dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      // ✅ Icon ใหม่: คำขอเข้าบูธ
      applications: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <polyline points="17 11 19 13 23 9"></polyline>
        </svg>
      ),
    };
    return icons[tab];
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left: Logo + Event Name */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img
                  src={logoUrl || defaultLogo}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = defaultLogo;
                  }}
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {event.name}
                </h1>
                {/* ✅ Status Badge */}
                {event.status === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#FFFBDE] to-[#FFF8E1] border-2 border-[#FFDC82] text-gray-900 text-xs font-bold rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    รอชำระเงิน
                  </span>
                )}
                {event.status === 'unpublished' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 border-2 border-blue-300 text-blue-700 text-xs font-bold rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    พร้อมเผยแพร่
                  </span>
                )}
                {event.status === 'published' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-green-700 text-xs font-bold rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    เผยแพร่แล้ว
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                บทบาทของคุณคือ <span className="font-medium text-gray-900">{roleName}</span>
              </p>
            </div>
          </div>

          {/* Right: Tabs (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-all relative
                  ${activeTab === tab
                    ? 'text-white bg-[#5B9BD5] shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {getTabIcon(tab)}
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs (Mobile) */}
        <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition whitespace-nowrap flex-shrink-0
                ${activeTab === tab
                  ? 'text-white bg-[#5B9BD5] shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {getTabIcon(tab)}
              <span className="text-sm">{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}