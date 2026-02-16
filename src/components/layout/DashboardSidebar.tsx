// src/components/layout/DashboardSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { useEventStore } from '@/src/features/events/store/eventStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';
import { JoinExpoModal } from '@/src/features/events/components/JoinExpoModal';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Get user role
  const { user } = useAuthStore();
  const userRole = user?.Role; // 'organizer' | 'booth_manager'
  
  // States
  const [expandedSections, setExpandedSections] = useState<string[]>(['events']);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Load Events
  useLoadEvents();
  const { organizedEvents, participatedEvents } = useEventStore();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      window.location.href = '/login';
    }
  };

  // Determine which events to show based on role
  const isOrganizer = userRole === 'organizer';
  const events = isOrganizer ? organizedEvents : participatedEvents;
  const eventLabel = isOrganizer ? 'งานของฉัน' : 'บูธของฉัน';
  const browseLabel = isOrganizer ? 'สำรวจบูธ' : 'สำรวจงาน';
  const browsePath = isOrganizer ? '/browse/booths' : '/browse/expos';
  const createLabel = isOrganizer ? 'สร้างงาน Expo' : 'เข้าร่วมงาน';

  return (
    <>
      {/* Backdrop */}
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
          <div className="flex-1 pt-2">
            {/* หน้าแรก */}
            <Link
              href="/home"
              onClick={onClose}
              className={`
                flex items-center gap-3 px-5 py-3.5 hover:bg-white/10 transition
                ${pathname === '/home' ? 'bg-white/20' : ''}
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span className="font-medium">หน้าแรก</span>
            </Link>

            {/* สำรวจบูธ / สำรวจงาน */}
            <Link
              href={browsePath}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-5 py-3.5 hover:bg-white/10 transition
                ${pathname === browsePath ? 'bg-white/20' : ''}
              `}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span className="font-medium">{browseLabel}</span>
            </Link>

            {/* งานของฉัน / บูธของฉัน Section */}
            <div>
              <button
                onClick={() => toggleSection('events')}
                className={`
                  w-full flex items-center justify-between px-5 py-3.5 transition
                  hover:bg-white/10
                  ${expandedSections.includes('events') ? 'bg-white/5' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isOrganizer ? (
                      // Calendar icon for Organizer
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                      </>
                    ) : (
                      // Store icon for Booth Manager
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                      </>
                    )}
                  </svg>
                  <span className="font-medium">{eventLabel}</span>
                </div>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                  className={`transition-transform duration-200 ${expandedSections.includes('events') ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Events List */}
              {expandedSections.includes('events') && (
                <div className="bg-white/5 py-2">
                  {events.length > 0 ? (
                    <>
                      {/* Event List */}
                      <div className="space-y-0.5 mb-3">
                        {events.map((event) => (
                          <Link
                            key={event.id}
                            href={isOrganizer ? `/events/${event.id}` : `/events/${event.id}?tab=booth`}
                            onClick={onClose}
                            className={`
                              flex items-center gap-3 px-5 py-2.5 pl-14 transition text-sm group
                              hover:bg-white/10
                              ${pathname.includes(`/events/${event.id}`) ? 'bg-white/15' : ''}
                            `}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0"></div>
                            <span className="flex-1 truncate">{event.name}</span>
                            <svg 
                              width="14" 
                              height="14" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              className="flex-shrink-0 opacity-0 group-hover:opacity-70 transition-opacity"
                            >
                              <path d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </Link>
                        ))}
                      </div>

                      {/* Create/Join Button */}
                      <div className="px-5 pt-1">
                        <button 
                          onClick={() => {
                            if (isOrganizer) {
                              router.push('/events/create');
                              onClose();
                            } else {
                              setShowJoinModal(true);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-white/30 rounded-lg hover:bg-white/10 hover:border-white/50 transition-all text-sm font-medium"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span>{createLabel}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-5 py-2">
                      <p className="text-xs text-white/50 text-center mb-2.5">
                        {isOrganizer ? 'ยังไม่มีงานที่จัด' : 'ยังไม่มีงานที่ร่วมบูธ'}
                      </p>
                      <div className="pt-1">
                        <button 
                          onClick={() => {
                            if (isOrganizer) {
                              router.push('/events/create');
                              onClose();
                            } else {
                              setShowJoinModal(true);
                            }
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-white/30 rounded-lg hover:bg-white/10 hover:border-white/50 transition-all text-sm font-medium"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          <span>{createLabel}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Menu - ออกจากระบบ */}
          <div className="border-t border-white/20 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/10 transition"
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

      {/* Join Expo Modal */}
      {showJoinModal && (
        <JoinExpoModal onClose={() => setShowJoinModal(false)} />
      )}
    </>
  );
}