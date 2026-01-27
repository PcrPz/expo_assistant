// src/components/layout/DashboardSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEventStore } from '@/src/features/events/store/eventStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';


interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['manage', 'join']);

  // ⭐ ใช้ Event Store แทน Mock Data
  useLoadEvents(); // โหลดข้อมูล
  const { organizedEvents, participatedEvents } = useEventStore();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      id: 'home',
      label: 'หน้าแรก',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      href: '/home',
    },
    {
      id: 'browse',
      label: 'สำรวจงาน',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      ),
      href: '/browse',
    },
  ];

  return (
    <>
      {/* Backdrop - แสดงเมื่อเปิด Sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-64 bg-[#4A8BC2] text-white
          transition-transform duration-300 ease-in-out z-30
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Main Menu */}
          <div className="flex-1 py-4">
            {/* หน้าแรก & สำรวจงาน */}
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition
                  ${pathname === item.href ? 'bg-white/20 border-r-4 border-white' : ''}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            {/* จัดการงาน/คอนเซป Section */}
            <div className="mt-2">
              <button
                onClick={() => toggleSection('manage')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                    <polyline points="8 10 12 14 16 10"></polyline>
                  </svg>
                  <span className="font-medium">จัดการงาน/คอนเซป</span>
                </div>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`transition-transform ${expandedSections.includes('manage') ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Managed Events List */}
              {expandedSections.includes('manage') && (
                <div className="bg-white/5">
                  {organizedEvents.length > 0 ? (
                    <>
                      {organizedEvents.map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-white/10 transition text-sm"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="1"></circle>
                          </svg>
                          <span className="flex-1 truncate">{event.name}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </Link>
                      ))}

                      {/* สร้างงาน Expo */}
                      <button 
                        onClick={() => {
                          router.push('/events/create');
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 pl-12 hover:bg-white/10 transition text-sm border-t border-white/10 mt-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>สร้างงาน Expo</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-4 pl-12 text-sm text-white/60">
                      <p className="mb-2">ยังไม่มีงานที่จัด</p>
                      <button 
                        onClick={() => {
                          router.push('/events/create');
                          onClose();
                        }}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>สร้างงาน Expo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* จัดการบูธจอง Section */}
            <div>
              <button
                onClick={() => toggleSection('join')}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  <span className="font-medium">จัดการบูธจอง</span>
                </div>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className={`transition-transform ${expandedSections.includes('join') ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Joined Events List */}
              {expandedSections.includes('join') && (
                <div className="bg-white/5">
                  {participatedEvents.length > 0 ? (
                    participatedEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-white/10 transition text-sm"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1"></circle>
                        </svg>
                        <span className="flex-1 truncate">{event.name}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                          <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-4 pl-12 text-sm text-white/60">
                      <p className="mb-2">ยังไม่มีงานที่ร่วมบูธ</p>
                      <button 
                        onClick={() => {
                          router.push('/browse');
                          onClose();
                        }}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <span>ค้นหางาน</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Menu */}
          <div className="border-t border-white/20 py-2">
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m7.07-14.93l-4.24 4.24m-5.66 5.66L4.93 18.07m15.14 0l-4.24-4.24m-5.66-5.66L4.93 5.93"></path>
              </svg>
              <span className="font-medium">ตั้งค่า</span>
            </Link>

            <button
              onClick={() => {
                if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
                  window.location.href = '/login';
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}