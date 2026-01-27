// src/features/events/components/detail/EventDetailHeader.tsx
'use client';

import React from 'react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Event, EventRole } from '../../types/event.types';

type TabType = 'detail' | 'staff' | 'booth' | 'dashboard';

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
      };
      return boothStaffLabels[tab];
    }
    
    const defaultLabels: Record<TabType, string> = {
      detail: 'Expo',
      staff: 'Staff',
      booth: 'Booth',
      dashboard: 'Dashboard',
    };
    return defaultLabels[tab];
  };

  // ✅ Icons สำหรับแต่ละ Tab
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                {event.name}
              </h1>
              {/* ✅ แสดงแบบเดิม: "บทบาทของคุณคือ ..." */}
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