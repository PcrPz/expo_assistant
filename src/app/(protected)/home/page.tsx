// src/app/(protected)/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';
import { JoinExpoModal } from '@/src/features/events/components/JoinExpoModal';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

// ─── Helpers ───────────────────────────────────────────────────
function getRoleColor(role?: string | null) {
  const r = (role || '').toLowerCase();
  if (r === 'owner') return {
    gradient: 'from-[#E8F4FD] to-[#D0E9FA]', border: 'border-[#498AC3]',
    badge: 'bg-[#498AC3] text-white', hover: 'hover:text-[#498AC3]',
  };
  if (['system_admin', 'admin'].includes(r)) return {
    gradient: 'from-[#E8F4FD] to-[#D0E9FA]', border: 'border-[#498AC3]',
    badge: 'bg-[#498AC3] text-white', hover: 'hover:text-[#498AC3]',
  };
  if (r === 'staff') return {
    gradient: 'from-[#F0F8FF] to-[#E8F4FD]', border: 'border-[#749BC2]',
    badge: 'bg-[#749BC2] text-white', hover: 'hover:text-[#749BC2]',
  };
  return {
    gradient: 'from-gray-50 to-gray-100', border: 'border-gray-300',
    badge: 'bg-gray-500 text-white', hover: 'hover:text-gray-600',
  };
}

function getRoleLabel(role?: string | null): string {
  const labels: Record<string, string> = {
    'owner': 'เจ้าของ', 'system_admin': 'ผู้ดูแลระบบ',
    'admin': 'ผู้จัดการ', 'staff': 'เจ้าหน้าที่',
  };
  return labels[(role || '').toLowerCase()] || 'ผู้เข้าร่วม';
}

function getStatusBadge(status?: string) {
  const s = (status || 'pending').toLowerCase();
  const map: Record<string, { label: string; className: string }> = {
    'pending':   { label: 'รอดำเนินการ',     className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
    'approved':  { label: 'อนุมัติแล้ว',      className: 'bg-green-50 text-green-700 border border-green-200' },
    'rejected':  { label: 'ไม่อนุมัติ',       className: 'bg-red-50 text-red-700 border border-red-200' },
    'active':    { label: 'กำลังดำเนินการ',   className: 'bg-[#E8F4FD] text-[#3674B5] border border-[#498AC3]' },
    'completed': { label: 'เสร็จสิ้น',        className: 'bg-gray-50 text-gray-700 border border-gray-300' },
  };
  return map[s] || map['pending'];
}

// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showJoinModal, setShowJoinModal] = useState(false);

  // ✅ Redirect booth_manager ออกไป My Booth
  useEffect(() => {
    if (user?.Role === 'booth_manager') {
      router.push('/booths/my-booth');
    }
  }, [user, router]);

  const handleEventClick = (eventId: string, role?: string | null) => {
    if (role && role.toLowerCase() === 'booth_staff') {
      router.push(`/events/${eventId}?tab=booth`);
    } else {
      router.push(`/events/${eventId}`);
    }
  };

  const { organizedEvents, isLoading, error } = useLoadEvents();

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#3674B5] mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle className="opacity-25" cx="12" cy="12" r="10" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md w-full">
          <p className="text-red-700 font-medium mb-1">เกิดข้อผิดพลาด</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition">
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // ── Empty State ──────────────────────────────────────────────
  if (organizedEvents.length === 0) {
    return (
      <>
        <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            {/* รูป */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/Landing_Image.png"
                alt="ยังไม่มีงาน"
                width={320}
                height={260}
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ยังไม่มีงานที่คุณเข้าร่วม
            </h1>
            <p className="text-gray-500 mb-8">
              สร้างงาน Expo ของคุณเอง หรือใส่โค้ดเพื่อเข้าร่วมงานที่มีอยู่
            </p>

            {/* ปุ่ม */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/events/create')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                สร้างงาน Expo
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#3674B5] font-semibold rounded-xl border-2 border-[#3674B5] hover:bg-blue-50 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                ใส่โค้ดเข้าร่วมงาน
              </button>
            </div>
          </div>
        </div>
        {showJoinModal && <JoinExpoModal onClose={() => setShowJoinModal(false)} />}
      </>
    );
  }

  // ── Has Events ───────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-3.5rem)] p-6 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">งานของฉัน</h1>
            <p className="text-gray-500 text-sm mt-1">
              งานทั้งหมดที่คุณเข้าร่วมเป็นผู้จัด ({organizedEvents.length} งาน)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#3674B5] font-semibold rounded-lg border-2 border-[#3674B5] hover:bg-blue-50 transition text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              ใส่โค้ดเข้าร่วมงาน
            </button>
            <button
              onClick={() => router.push('/events/create')}
              className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              สร้างงาน Expo
            </button>
          </div>
        </div>

        {/* Event Grid */}
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
                {/* Thumbnail */}
                <div className={`relative h-44 bg-gradient-to-br ${roleColors.gradient} overflow-hidden`}>
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl} alt={event.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl">🎪</div>
                    </div>
                  )}
                  {/* Role Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 ${roleColors.badge} rounded-full text-xs font-semibold shadow`}>
                      {getRoleLabel(event.role)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className={`text-base font-bold text-gray-900 line-clamp-2 ${roleColors.hover} transition flex-1`}>
                      {event.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {event.category && (
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        {event.category}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <span className="font-medium min-w-[48px]">วันที่</span>
                    <span>: {
                      event.startDate && event.endDate && event.startDate !== event.endDate
                        ? `${new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(event.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : new Date(event.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                    }</span>
                  </div>

                    <div className="flex gap-2">
                      <span className="font-medium min-w-[48px]">สถานที่</span>
                      <span className="line-clamp-1">: {event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showJoinModal && <JoinExpoModal onClose={() => setShowJoinModal(false)} />}
    </div>
  );
}