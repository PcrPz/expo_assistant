// src/features/booths/components/BoothDetailClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoothById } from '@/src/features/booths/api/boothApi';
import { getMyBoothGlobal } from '@/src/features/booths/api/boothGlobalApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import type { Booth } from '@/src/features/booths/types/booth.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { EditBoothModal } from '@/src/features/booths/components/EditBoothModal';
import { DeleteBoothModal } from '@/src/features/booths/components/DeleteBoothModal';
import { BoothStaffTab } from '@/src/features/booths/components/staff/BoothStaffTab';
import { DocumentsTab } from './documents/DocumentTab';
import { ProductsTab } from './products/ProductsTab';
import { AnnouncementsTab } from './announcements/AnnouncementTab';
import { QueueTab } from '@/src/features/booths/components/queue/QueueTab';
import { FormsTab } from './forms/FormsTab';
import { BoothDashboardTab } from './dashboard/BoothDashboardTab';
import { EventsTab } from './events/EventsTab';
import { FileText } from 'lucide-react';
import {
  canEditBooth,
  canDeleteBooth,
  canViewStaffTab,
  canCreateAnnouncement,
  canEditAnnouncement,
  canDeleteAnnouncement,
  canPublishAnnouncement,
  canCreateEvent,
  canEditEvent,
  canDeleteEvent,
  isOrganizer,
} from '@/src/features/booths/utils/permissions';

// ─── Types ────────────────────────────────────────────────────
interface BoothDetailClientProps {
  eventId: string;
  boothId: string;
  userRole: EventRole;
}

type TabType =
  | 'detail'
  | 'staff'
  | 'documents'
  | 'products'
  | 'announcements'
  | 'queue'
  | 'forms'
  | 'events'
  | 'dashboard';

// ─── Constants ────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  small_booth: 'บูธขนาดเล็ก',
  big_booth:   'บูธขนาดใหญ่',
  stage:       'เวที',
};

const TYPE_ICONS: Record<string, React.ReactElement> = {
  small_booth: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  big_booth: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  stage: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
};

const TYPE_BADGE_ICONS: Record<string, React.ReactElement> = {
  small_booth: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  big_booth: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  stage: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
  ),
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  available:   { label: 'ว่าง',         dot: '#16A34A', bg: '#DCFCE7', text: '#15803D' },
  unavailable: { label: 'เชิญเท่านั้น', dot: '#6B7280', bg: '#F3F4F6', text: '#374151' },
  pending:     { label: 'รอชำระเงิน',   dot: '#D97706', bg: '#FEF3C7', text: '#B45309' },
  reserved:    { label: 'จองแล้ว',      dot: '#16A34A', bg: '#DCFCE7', text: '#15803D' },
};

// ─── Main Component ───────────────────────────────────────────
export function BoothDetailClient({ eventId, boothId, userRole }: BoothDetailClientProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [booth, setBooth] = useState<Booth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAssignedStaff, setIsAssignedStaff] = useState(false);

  // ── Logic unchanged ──────────────────────────────────────────
  useEffect(() => {
    loadBooth();
  }, [eventId, boothId]);

  const loadBooth = async () => {
    try {
      setIsLoading(true);
      const boothData = await getBoothById(eventId, boothId);
      if (!boothData) {
        console.error('❌ Booth not found');
        router.push(`/events/${eventId}?tab=booth`);
        return;
      }
      if (userRole === 'booth_staff_visitor') {
        console.log('🚫 booth_staff_visitor cannot access booth detail, redirecting...');
        router.push(`/events/${eventId}`);
        return;
      }
      setBooth(boothData);
      if (userRole === 'booth_staff') {
        const { booth: myBoothGroup } = await getMyBoothGlobal();
        const assigned = !!(
          myBoothGroup?.id &&
          boothData.booth_group_id &&
          myBoothGroup.id === boothData.booth_group_id
        );
        setIsAssignedStaff(assigned);
        console.log('✅ Is assigned (booth_group_id match):', assigned,
          '| my group:', myBoothGroup?.id,
          '| booth group:', boothData.booth_group_id
        );
      } else {
        setIsAssignedStaff(false);
      }
    } catch (error) {
      console.error('Failed to load booth:', error);
      router.push(`/events/${eventId}?tab=booth`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    loadBooth();
  };

  const handleDeleteSuccess = () => {
    router.push(`/events/${eventId}?tab=booth`);
  };

  const canEdit    = canEditBooth(userRole, isAssignedStaff);
  const canDelete  = canDeleteBooth(userRole);
  const showStaffTab = canViewStaffTab(userRole, isAssignedStaff);

  // ── Loading State ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-[#3674B5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-medium">กำลังโหลดข้อมูลบูธ...</p>
        </div>
      </div>
    );
  }

  // ── Not Found State ──────────────────────────────────────────
  if (!booth) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">ไม่พบบูธ</h2>
          <p className="text-sm text-gray-400 mb-5">บูธที่คุณต้องการดูไม่มีอยู่ในระบบ</p>
          <button
            onClick={() => router.push(`/events/${eventId}?tab=booth`)}
            className="px-5 py-2.5 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
          >
            กลับไปหน้ารายการบูธ
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────
  const thumbnailUrl  = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;
  const typeLabel     = TYPE_LABELS[booth.type] ?? booth.type;
  const typeIcon      = TYPE_ICONS[booth.type] ?? TYPE_ICONS.small_booth;
  const typeBadgeIcon = TYPE_BADGE_ICONS[booth.type] ?? TYPE_BADGE_ICONS.small_booth;
  const statusCfg     = STATUS_CONFIG[booth.status] ?? STATUS_CONFIG.available;


  // ── Tabs config ──────────────────────────────────────────────
  type TabConfig = { id: TabType; label: string; icon: React.ReactElement };
  const allTabs: TabConfig[] = [
    {
      id: 'detail', label: 'รายละเอียด',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3h10a2 2 0 0 1 2 2v4"/><path d="M3 9h18"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/></svg>,
    },
    ...(showStaffTab ? [{
      id: 'staff' as TabType, label: 'ทีมงาน',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    }] : []),
    {
      id: 'documents', label: 'เอกสาร',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    },
    {
      id: 'products', label: 'สินค้า',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    },
    {
      id: 'announcements', label: 'ประกาศ',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    },
    {
      id: 'queue', label: 'คิว',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    },
    {
      id: 'forms', label: 'แบบสอบถาม',
      icon: <FileText size={14} />,
    },
    {
      id: 'events', label: 'กิจกรรม',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    ...(isOrganizer(userRole) || isAssignedStaff ? [{
      id: 'dashboard' as TabType, label: 'Dashboard',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>,
    }] : []),
  ];

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <div className="max-w-7xl mx-auto px-6 pb-10">

        {/* ── Action Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between py-4">
          <button
            onClick={() => router.push(`/events/${eventId}?tab=booth`)}
            className="flex items-center gap-2 text-[#3674B5] text-sm font-semibold hover:opacity-75 transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            กลับ
          </button>
          <div className="flex items-center gap-2.5">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition shadow-sm"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                แก้ไข
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-500 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-50 transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                ลบบูธ
              </button>
            )}
          </div>
        </div>

        {/* ── Main Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">

          {/* ── Booth Header ─────────────────────────────────── */}
          <div
            className="px-7 py-6 flex items-center gap-5"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
          >
            {/* Icon */}
            <div className="w-[56px] h-[56px] flex-shrink-0 rounded-[14px] flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.32)' }}>
              {typeIcon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              {/* Title row: บูธ A1 — ชื่อบูธ */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[18px] font-normal text-white/65">บูธ</span>
                <span className="text-[22px] font-extrabold text-white leading-tight">{booth.booth_no}</span>
                {booth.title && (
                  <>
                    <span className="text-[17px] font-light text-white/35">—</span>
                    <span className="text-[17px] font-semibold text-white/92 leading-tight truncate max-w-xs">{booth.title}</span>
                  </>
                )}
              </div>

              {/* Company sub-line */}
              {booth.company && (
                <p className="text-[13px] text-white/60 mt-1 truncate">{booth.company}</p>
              )}

              {/* Type badge */}
              <span
                className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold text-white/92"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                {typeBadgeIcon}
                {typeLabel}
              </span>
            </div>
          </div>

          {/* ── Tab Bar ──────────────────────────────────────── */}
          <div className="flex border-b border-[#E8EEF5] overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}>
            {allTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 px-6 py-[13px] text-[14px] font-medium whitespace-nowrap flex-shrink-0 border-b-[2.5px] transition-colors',
                  activeTab === tab.id
                    ? 'text-[#3674B5] border-[#3674B5] font-bold'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50/60',
                ].join(' ')}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab Content ──────────────────────────────────── */}
          <div className="p-7">

            {/* ════ Detail Tab ════════════════════════════════ */}
            {activeTab === 'detail' && (
              <div className="space-y-0">

                {/* Tab header — เหมือน tab อื่น */}
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">รายละเอียดบูธ</h2>
                  <p className="text-sm text-gray-400 mt-0.5">ข้อมูลทั่วไปและการติดต่อ</p>
                </div>

                {/* รูปภาพ */}
                <div className="rounded-[14px] border-[1.5px] border-dashed border-[#D1D9E6] bg-[#F8FAFC] mb-5 flex flex-col items-center justify-center gap-2"
                  style={{ height: '200px' }}>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={booth.booth_no}
                      className="w-full h-full object-cover rounded-[14px]"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C8D0DC" strokeWidth="1.2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p className="text-[13px] text-gray-400">ยังไม่มีรูปภาพบูธ</p>
                    </>
                  )}
                </div>

                {/* Layout 2 คอลัมน์ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_252px] gap-5">

                  {/* ── Left ── */}
                  <div className="space-y-5">

                    {/* ข้อมูลพื้นฐาน */}
                    <DetailSection
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>}
                      title="ข้อมูลพื้นฐาน"
                    >
                      <div className="grid grid-cols-3 gap-2.5">
                        <FieldCard label="เลขที่บูธ" value={booth.booth_no} />
                        <FieldCard label="ประเภท" value={typeLabel} />
                        <FieldCard label="ราคา" value={booth.price && Number(booth.price) > 0 ? `฿${Number(booth.price).toLocaleString()}` : 'ฟรี'} />
                        <FieldCard label="สถานะ">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] text-[14px] font-semibold"
                            style={{ background: statusCfg.bg, color: statusCfg.text }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusCfg.dot }} />
                            {statusCfg.label}
                          </span>
                        </FieldCard>
                        <div className="col-span-2">
                          <FieldCard label="ชื่อบูธ" value={booth.title ?? undefined} empty="ไม่ได้ระบุ" />
                        </div>
                      </div>
                    </DetailSection>

                    {/* บริษัท / รายละเอียด */}
                    <DetailSection
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                      title="บริษัท / รายละเอียด"
                    >
                      <div className="space-y-2.5">
                        <FieldCard label="ชื่อบริษัท / องค์กร" value={booth.company ?? undefined} empty="ไม่ได้ระบุ" />
                        <FieldCard label="รายละเอียด">
                          {booth.detail ? (
                            <p className="text-[15px] font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">{booth.detail}</p>
                          ) : (
                            <p className="text-[14px] text-gray-300 italic">ไม่มีรายละเอียด</p>
                          )}
                        </FieldCard>
                      </div>
                    </DetailSection>

                  </div>

                  {/* ── Right Sidebar ── */}
                  <div className="space-y-5">

                    {/* สถานที่ */}
                    <DetailSection
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                      title="สถานที่"
                    >
                      <div className="space-y-2.5">
                        <FieldCard label="โซน" value={booth.zone_name ?? undefined} empty="ไม่ได้ระบุ" />
                        <FieldCard label="ฮอลล์" value={booth.hall ?? undefined} empty="ไม่ได้ระบุ" />
                      </div>
                    </DetailSection>

                    {/* ติดต่อ */}
                    <DetailSection
                      icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>}
                      title="ติดต่อ"
                    >
                      <div className="space-y-2.5">
                        <FieldCard label="อีเมล">
                          {booth.email ? (
                            <a href={`mailto:${booth.email}`} className="text-[15px] font-semibold text-[#3674B5] hover:underline truncate block">{booth.email}</a>
                          ) : (
                            <p className="text-[14px] text-gray-300 italic">ไม่ได้ระบุ</p>
                          )}
                        </FieldCard>
                        <FieldCard label="โทรศัพท์">
                          {booth.tel ? (
                            <a href={`tel:${booth.tel}`} className="text-[15px] font-semibold text-[#3674B5] hover:underline">{booth.tel}</a>
                          ) : (
                            <p className="text-[14px] text-gray-300 italic">ไม่ได้ระบุ</p>
                          )}
                        </FieldCard>
                        <FieldCard label="เว็บไซต์ 1">
                          {booth.website1 ? (
                            <a href={booth.website1} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold text-[#3674B5] hover:underline truncate block">{booth.website1}</a>
                          ) : (
                            <p className="text-[14px] text-gray-300 italic">ไม่ได้ระบุ</p>
                          )}
                        </FieldCard>
                        <FieldCard label="เว็บไซต์ 2">
                          {booth.website2 ? (
                            <a href={booth.website2} target="_blank" rel="noopener noreferrer" className="text-[15px] font-semibold text-[#3674B5] hover:underline truncate block">{booth.website2}</a>
                          ) : (
                            <p className="text-[14px] text-gray-300 italic">ไม่ได้ระบุ</p>
                          )}
                        </FieldCard>
                      </div>
                    </DetailSection>

                  </div>
                </div>
              </div>
            )}

            {/* ════ Other Tabs (logic unchanged) ════════════════ */}
            {activeTab === 'staff' && showStaffTab && (
              <BoothStaffTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
                boothGroupId={booth.booth_group_id}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
              />
            )}
            {activeTab === 'products' && (
              <ProductsTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
              />
            )}
            {activeTab === 'announcements' && (
              <AnnouncementsTab
                expoID={eventId}
                boothID={boothId}
                canCreate={canCreateAnnouncement(userRole, isAssignedStaff)}
                canEdit={canEditAnnouncement(userRole, isAssignedStaff)}
                canDelete={canDeleteAnnouncement(userRole, isAssignedStaff)}
                canPublish={canPublishAnnouncement(userRole, isAssignedStaff)}
              />
            )}
            {activeTab === 'queue' && (
              <QueueTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
              />
            )}
            {activeTab === 'forms' && (
              <FormsTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
              />
            )}
            {activeTab === 'events' && (
              <EventsTab
                expoID={eventId}
                boothID={boothId}
                canCreate={canCreateEvent(userRole, isAssignedStaff)}
                canEdit={canEditEvent(userRole, isAssignedStaff)}
                canDelete={canDeleteEvent(userRole, isAssignedStaff)}
              />
            )}
            {activeTab === 'dashboard' && (isOrganizer(userRole) || isAssignedStaff) && (
            <BoothDashboardTab
              expoId={eventId}
              boothId={boothId}
              boothTitle={booth?.booth_no ?? undefined}
            />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals (unchanged) ─────────────────────────────── */}
      {showEditModal && (
        <EditBoothModal
          expoId={eventId}
          booth={booth}
          userRole={userRole}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
      {showDeleteModal && (
        <DeleteBoothModal
          expoId={eventId}
          boothId={boothId}
          boothNo={booth.booth_no}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

interface DetailSectionProps {
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode;
}

function DetailSection({ icon, title, children }: DetailSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#EDF1F7]">
        <span className="text-[#3674B5] flex-shrink-0" style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <span className="text-[14px] font-bold text-gray-600">{title}</span>
      </div>
      {children}
    </div>
  );
}

interface FieldCardProps {
  label: string;
  value?: string;
  empty?: string;
  children?: React.ReactNode;
}

function FieldCard({ label, value, empty = 'ไม่ได้ระบุ', children }: FieldCardProps) {
  return (
    <div className="bg-[#F8FAFC] border border-[#EDF1F7] rounded-[10px] px-4 py-3.5">
      <p className="text-[12px] font-semibold text-gray-500 mb-1.5">{label}</p>
      {children ?? (
        value
          ? <p className="text-[15px] font-semibold text-gray-900">{value}</p>
          : <p className="text-[14px] text-gray-300 italic">{empty}</p>
      )}
    </div>
  );
}