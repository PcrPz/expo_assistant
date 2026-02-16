// src/app/(protected)/home/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';
import { JoinExpoModal } from '@/src/features/events/components/JoinExpoModal';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

// Helper: ได้สีตาม Role (ใช้โทนน้ำเงินเข้าธีม)
function getRoleColor(role?: string | null) {
  const r = (role || '').toLowerCase();
  
  // Owner - ฟ้าอ่อน #91C8E4
  if (r === 'owner') return {
    gradient: 'from-[#E8F4FD] to-[#D0E9FA]',
    border: 'border-[#498AC3]',
    badge: 'bg-[#498AC3] text-white',
    hover: 'hover:text-[#498AC3]',
  };
  
  // System Admin / Admin - น้ำเงินกลาง
  if (['system_admin', 'admin'].includes(r)) return {
    gradient: 'from-[#E8F4FD] to-[#D0E9FA]',
    border: 'border-[#498AC3]',
    badge: 'bg-[#498AC3] text-white',
    hover: 'hover:text-[#498AC3]',
  };
  
  // Staff - น้ำเงินอ่อน
  if (r === 'staff') return {
    gradient: 'from-[#F0F8FF] to-[#E8F4FD]',
    border: 'border-[#749BC2]',
    badge: 'bg-[#749BC2] text-white',
    hover: 'hover:text-[#749BC2]',
  };
  
  // Booth Staff - น้ำเงินธีม #749BC2
  if (r === 'booth_staff') return {
    gradient: 'from-[#F0F8FF] to-[#E8F4FD]',
    border: 'border-[#749BC2]',
    badge: 'bg-[#749BC2] text-white',
    hover: 'hover:text-[#749BC2]',
  };
  
  // Default
  return {
    gradient: 'from-gray-50 to-gray-100',
    border: 'border-gray-300',
    badge: 'bg-gray-500 text-white',
    hover: 'hover:text-gray-600',
  };
}

// Helper: Role Label ภาษาไทย
function getRoleLabel(role?: string | null): string {
  const r = (role || '').toLowerCase();
  const labels: Record<string, string> = {
    'owner': 'เจ้าของ',
    'system_admin': 'ผู้ดูแลระบบ',
    'admin': 'ผู้จัดการ',
    'staff': 'เจ้าหน้าที่',
    'booth_staff': 'ผู้ร่วมออกบูธ',
  };
  return labels[r] || 'ผู้เข้าร่วม';
}

// Helper: Status Label + Color
function getStatusBadge(status?: string) {
  const s = (status || 'pending').toLowerCase();
  
  const statusMap: Record<string, { label: string; className: string }> = {
    'pending': { label: 'รอดำเนินการ', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    'approved': { label: 'อนุมัติแล้ว', className: 'bg-green-50 text-green-700 border border-green-200' },
    'rejected': { label: 'ไม่อนุมัติ', className: 'bg-red-50 text-red-700 border border-red-200' },
    'active': { label: 'กำลังดำเนินการ', className: 'bg-[#E8F4FD] text-[#3674B5] border border-[#498AC3]' },
    'completed': { label: 'เสร็จสิ้น', className: 'bg-gray-50 text-gray-700 border border-gray-300' },
  };
  
  return statusMap[s] || statusMap['pending'];
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleEventClick = (eventId: string, role?: string | null) => {
    if (role && role.toLowerCase() === 'booth_staff') {
      console.log(`🏪 Booth Staff detected - Redirecting to booth tab`);
      router.push(`/events/${eventId}?tab=booth`);
    } else {
      router.push(`/events/${eventId}`);
    }
  };
  
  const { organizedEvents, participatedEvents, isLoading, error } = useLoadEvents();

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="text-center">
          <svg 
            className="animate-spin h-12 w-12 text-[#3674B5] mx-auto mb-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10"></circle>
            <path 
              className="opacity-75" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div className="flex-1">
              <p className="text-red-700 font-medium mb-1">เกิดข้อผิดพลาด</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const hasOrganized = organizedEvents.length > 0;
  const hasParticipated = participatedEvents.length > 0;
  const hasAnyEvents = hasOrganized || hasParticipated;

  // Empty State - ไม่มีงานเลย
  if (!hasAnyEvents) {
    const isOrganizer = user?.Role === 'organizer';

    return (
      <>
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
          <div className="max-w-3xl w-full text-center">
            {/* Header with Role */}
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              สวัสดี, {user?.Firstname || 'คุณ'}! <span className="text-[#3674B5]">({isOrganizer ? 'ผู้จัดงาน' : 'ผู้จัดการบูธ'})</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              {isOrganizer 
                ? 'เริ่มต้นสร้างงาน Expo ของคุณ หรือค้นหาบูธที่น่าสนใจ'
                : 'เริ่มต้นจัดการบูธของคุณ หรือค้นหางานที่เหมาะสม'
              }
            </p>
            <div className="mb-14 flex justify-center">
              <Image
                src="/images/Landing_Image.png"
                alt="No events yet"
                width={500}
                height={400}
                className="object-contain"
                priority
              />
            </div>
            
            {/* Buttons based on Role */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-2xl mx-auto">
              {isOrganizer ? (
                <>
                  {/* Organizer: สำรวจบูธ (ย้ายมาก่อน) */}
                  <button
                    onClick={() => router.push('/browse/booths')}
                    className="flex items-center justify-center gap-3 px-10 py-4 bg-white text-[#749BC2] font-bold text-lg rounded-full border-2 border-[#749BC2] hover:bg-blue-50 transition-all hover:scale-105"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span>สำรวจบูธ</span>
                  </button>
                  {/* Organizer: สร้างงาน Expo (ย้ายมาหลัง) */}
                  <button
                    onClick={() => router.push('/events/create')}
                    className="flex items-center justify-center gap-3 px-10 py-4 bg-[#3674B5] text-white font-bold text-lg rounded-full hover:bg-[#2d5a8f] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                    </svg>
                    <span>สร้างงาน Expo</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Booth Manager: สำรวจงาน */}
                  <button
                    onClick={() => router.push('/browse/expos')}
                    className="flex items-center justify-center gap-3 px-10 py-4 bg-white text-[#749BC2] font-bold text-lg rounded-full border-2 border-[#749BC2] hover:bg-blue-50 transition-all hover:scale-105"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span>สำรวจงาน</span>
                  </button>
                  {/* Booth Manager: เข้าร่วมงาน */}
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="flex items-center justify-center gap-3 px-10 py-4 bg-[#3674B5] text-white font-bold text-lg rounded-full hover:bg-[#2d5a8f] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    <span>เข้าร่วมงาน</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {showJoinModal && (
          <JoinExpoModal onClose={() => setShowJoinModal(false)} />
        )}
      </>
    );
  }

  // Has Events
  const isOrganizer = user?.Role === 'organizer';

  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            งานของฉัน
          </h1>
        </div>

        {/* Single Section Based on Role */}
        <section className="mb-12">
          {isOrganizer ? (
            <>
              {/* Organizer: งานที่คุณเป็นผู้จัด */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F4FD] rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">งานที่คุณเป็นผู้จัด</h2>
                </div>
                <button
                  onClick={() => router.push('/events/create')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  สร้างงาน Expo
                </button>
              </div>

              {hasOrganized ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizedEvents.map((event) => {
                    const thumbnailUrl = getMinioFileUrl(event.thumbnail);
                    const roleColors = getRoleColor(event.role);
                    const statusBadge = getStatusBadge(event.status);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event.id, event.role)}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border-2 ${roleColors.border} group`}
                      >
                        <div className={`relative h-48 bg-gradient-to-br ${roleColors.gradient} overflow-hidden`}>
                          {thumbnailUrl ? (
                            <Image
                              src={thumbnailUrl}
                              alt={event.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-6xl">🎪</div>
                            </div>
                          )}
                          
                          {/* Role Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${roleColors.badge} rounded-full text-xs font-semibold shadow-lg`}>
                              {getRoleLabel(event.role)}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          {/* Header: Title + Status */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className={`text-lg font-bold text-gray-900 line-clamp-2 ${roleColors.hover} transition flex-1`}>
                              {event.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                          </div>

                          {/* Category */}
                          {event.category && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
                                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                {event.category}
                              </span>
                            </div>
                          )}

                          {/* Details */}
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">วันที่</span>
                              <span>: {new Date(event.startDate).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">เวลา</span>
                              <span>: {event.time || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">สถานที่</span>
                              <span className="line-clamp-2">: {event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16">
                  <div className="text-center">
                    <div className="mb-6 flex justify-center">
                      <Image
                        src="/images/No_expo.png"
                        alt="ยังไม่มีงานที่จัด"
                        width={300}
                        height={200}
                        className="object-contain opacity-60"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ยังไม่มีงานที่คุณจัด
                    </h3>
                    <p className="text-gray-600">
                      สร้างงาน Expo ของคุณเพื่อเริ่มต้นจัดการงานอีเว้นท์
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Booth Manager: งานที่คุณร่วมออกบูธ */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E8F4FD] rounded-lg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">งานที่คุณร่วมออกบูธ</h2>
                </div>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  เข้าร่วมงาน
                </button>
              </div>

              {hasParticipated ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {participatedEvents.map((event) => {
                    const thumbnailUrl = getMinioFileUrl(event.thumbnail);
                    const roleColors = getRoleColor(event.role);
                    const statusBadge = getStatusBadge(event.status);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event.id, event.role)}
                        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border-2 ${roleColors.border} group`}
                      >
                        <div className={`relative h-48 bg-gradient-to-br ${roleColors.gradient} overflow-hidden`}>
                          {thumbnailUrl ? (
                            <Image
                              src={thumbnailUrl}
                              alt={event.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-6xl">🏪</div>
                            </div>
                          )}
                          
                          {/* Role Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${roleColors.badge} rounded-full text-xs font-semibold shadow-lg`}>
                              {getRoleLabel(event.role)}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          {/* Header: Title + Status */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h3 className={`text-lg font-bold text-gray-900 line-clamp-2 ${roleColors.hover} transition flex-1`}>
                              {event.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                          </div>

                          {/* Category */}
                          {event.category && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
                                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                {event.category}
                              </span>
                            </div>
                          )}

                          {/* Details */}
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">วันที่</span>
                              <span>: {new Date(event.startDate).toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">เวลา</span>
                              <span>: {event.time || '-'}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium min-w-[60px]">สถานที่</span>
                              <span className="line-clamp-2">: {event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16">
                  <div className="text-center">
                    <div className="mb-6 flex justify-center">
                      <Image
                        src="/images/No_expo.png"
                        alt="ยังไม่มีงานที่เข้าร่วม"
                        width={300}
                        height={200}
                        className="object-contain opacity-60"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      ยังไม่มีงานที่คุณร่วมออกบูธ
                    </h3>
                    <p className="text-gray-600">
                      เข้าร่วมงานเพื่อเริ่มออกบูธในอีเว้นท์ต่างๆ
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Join Expo Modal */}
      {showJoinModal && (
        <JoinExpoModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}