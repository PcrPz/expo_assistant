// src/app/(protected)/home/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';
import { JoinExpoModal } from '@/src/features/events/components/JoinExpoModal';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };
  
  // ⭐ ใช้ Custom Hook แทน Mock Data
  const { organizedEvents, participatedEvents, isLoading, error } = useLoadEvents();

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="text-center">
          <svg 
            className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" 
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

  const hasEvents = organizedEvents.length > 0 || participatedEvents.length > 0;

  // Empty State
  if (!hasEvents) {
    return (
      <>
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              เลือกงานที่ต้องการจัดการ
            </h1>
            <div className="mb-12 flex justify-center">
              <Image
                src="/images/Landing_Image.png"
                alt="No events yet"
                width={500}
                height={400}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-xl text-gray-600 mb-10">
              คุณไม่มีงาน Expo หรือ Booth ที่ต้องจัดการ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/events/create')}
                className="px-8 py-4 bg-[#4A8BC2] text-white font-bold text-lg rounded-full hover:bg-[#3A7AB2] transition-all shadow-lg"
              >
                สร้างงาน Expo
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-8 py-4 bg-white text-[#4A8BC2] font-bold text-lg rounded-full border-2 border-[#4A8BC2] hover:bg-blue-50 transition-all"
              >
                เข้าร่วมงาน
              </button>
            </div>
          </div>
        </div>

        {/* Join Expo Modal */}
        {showJoinModal && (
          <JoinExpoModal onClose={() => setShowJoinModal(false)} />
        )}
      </>
    );
  }

  // Has Events
  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            เลือกงานที่ต้องการจัดการ
          </h1>
        </div>

        {/* งานที่คุณเป็นผู้จัด */}
        {organizedEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A8BC2" strokeWidth="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">งานที่คุณเป็นผู้จัด</h2>
              </div>
              <button
                onClick={() => router.push('/events/create')}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A8BC2] text-white font-semibold rounded-lg hover:bg-[#3A7AB2] transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                สร้างงาน Expo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-6xl mb-2">🎪</div>
                        <p className="text-sm text-gray-600">Event Image</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">วันที่</span>
                        <span className="flex-1">
                          : {new Date(event.startDate).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">เวลา</span>
                        <span className="flex-1">: {event.time}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">สถานที่</span>
                        <span className="flex-1">: {event.location}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]"></span>
                        <span className="flex-1 text-xs">{event.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* งานที่คุณร่วมออกบูธ */}
        {participatedEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">งานที่คุณร่วมออกบูธ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-6xl mb-2">🏪</div>
                        <p className="text-sm text-gray-600">Booth Image</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">วันที่</span>
                        <span className="flex-1">
                          : {new Date(event.startDate).toLocaleDateString('th-TH', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">เวลา</span>
                        <span className="flex-1">: {event.time}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]">สถานที่</span>
                        <span className="flex-1">: {event.location}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium min-w-[50px]"></span>
                        <span className="flex-1 text-xs">{event.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}