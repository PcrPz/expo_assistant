// src/app/events/[eventId]/booths/[boothId]/BoothDetailClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoothById, getBoothStaff } from '@/src/features/booths/api/boothApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import type { Booth } from '@/src/features/booths/types/booth.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { EditBoothModal } from '@/src/features/booths/components/EditBoothModal';
import { DeleteBoothModal } from '@/src/features/booths/components/DeleteBoothModal';
import { BoothStaffTab } from '@/src/features/booths/components/staff/BoothStaffTab';
import { 
  canEditBooth,
  canDeleteBooth,
  canViewStaffTab,
  isUserAssignedToBooth 
} from '@/src/features/booths/utils/permissions';
import { DocumentsTab } from './documents/DocumentTab';
import { ProductsTab } from './products/ProductsTab';

interface BoothDetailClientProps {
  eventId: string;
  boothId: string;
  userRole: EventRole;
}

type TabType = 'detail' | 'staff' | 'documents' | 'products' | 'announcements';

export function BoothDetailClient({ eventId, boothId, userRole }: BoothDetailClientProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [booth, setBooth] = useState<Booth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('detail');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAssignedStaff, setIsAssignedStaff] = useState(false);

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
      
      setBooth(boothData);

      // ✅ ใช้ Email แทน UserID
      if (user?.Email && userRole === 'booth_staff') {
        const staffList = await getBoothStaff(eventId, boothId);
        const assigned = isUserAssignedToBooth(user.Email, staffList);
        setIsAssignedStaff(assigned);
        console.log('✅ Is assigned staff:', assigned, 'Email:', user.Email);
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

  const canEdit = canEditBooth(userRole, isAssignedStaff);
  const canDelete = canDeleteBooth(userRole);
  const showStaffTab = canViewStaffTab(userRole, isAssignedStaff);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3674B5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลบูธ...</p>
        </div>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบบูธ</h2>
          <p className="text-gray-600 mb-6">บูธที่คุณต้องการดูไม่มีอยู่ในระบบ</p>
          <button
            onClick={() => router.push(`/events/${eventId}?tab=booth`)}
            className="px-6 py-2.5 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
          >
            กลับไปหน้ารายการบูธ
          </button>
        </div>
      </div>
    );
  }

  const thumbnailUrl = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;

  const TYPE_LABELS: Record<string, string> = {
    small_booth: 'บูธเล็ก',
    big_booth: 'บูธใหญ่',
    stage: 'เวที',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/events/${eventId}?tab=booth`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span className="font-medium">กลับ</span>
            </button>

            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>แก้ไข</span>
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>ลบบูธ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <TabButton
              active={activeTab === 'detail'}
              onClick={() => setActiveTab('detail')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
            >
              รายละเอียด
            </TabButton>

            {showStaffTab && (
              <TabButton
                active={activeTab === 'staff'}
                onClick={() => setActiveTab('staff')}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                }
              >
                ทีมงาน
              </TabButton>
            )}

            <TabButton
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              }
            >
              เอกสาร
            </TabButton>

            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              }
            >
              สินค้า
            </TabButton>

            <TabButton
              active={activeTab === 'announcements'}
              onClick={() => setActiveTab('announcements')}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              }
            >
              ประกาศ
            </TabButton>
          </div>

          <div className="p-6">
            {activeTab === 'detail' && (
              <DetailTab booth={booth} thumbnailUrl={thumbnailUrl} typeLabel={TYPE_LABELS[booth.type]} />
            )}

            {activeTab === 'staff' && showStaffTab && (
              <BoothStaffTab
                boothId={boothId}
                expoId={eventId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
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
            {activeTab === 'announcements' && <ComingSoonTab feature="ประกาศ" />}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditBoothModal
          expoId={eventId}
          booth={booth}
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

// Components (same as before)
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 font-medium transition whitespace-nowrap
        ${active
          ? 'text-[#3674B5] border-b-2 border-[#3674B5]'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
// ============================================
// Detail Tab Component
// ============================================

interface DetailTabProps {
  booth: Booth;
  thumbnailUrl: string | null;
  typeLabel: string;
}

function DetailTab({ booth, thumbnailUrl, typeLabel }: DetailTabProps) {
  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* Hero Image Section - ด้านบนสุด */}
      {/* ============================================ */}
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={booth.booth_no}
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = `
                  <div class="w-full h-80 bg-gray-100 flex items-center justify-center">
                    <div class="text-center text-gray-400">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mx-auto mb-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p class="text-sm">ไม่สามารถโหลดรูปภาพได้</p>
                    </div>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p className="text-sm">ยังไม่มีรูปภาพบูธ</p>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* Main Content Grid */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              ข้อมูลพื้นฐาน
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                }
                label="เลขที่บูธ"
                value={booth.booth_no}
              />

              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                }
                label="ประเภท"
                value={typeLabel}
              />

              {booth.title && (
                <InfoRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  }
                  label="ชื่อบูธ"
                  value={booth.title}
                />
              )}

              {booth.company && (
                <InfoRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  }
                  label="บริษัท"
                  value={booth.company}
                />
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              รายละเอียด
            </h3>
            {booth.detail ? (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{booth.detail}</p>
            ) : (
              <p className="text-gray-400 italic">ไม่มีรายละเอียด</p>
            )}
          </div>
        </div>

        {/* Right Column - Location & Contact */}
        <div className="space-y-6">
          {/* Location */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              สถานที่
            </h3>

            {booth.zone_name && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                }
                label="โซน"
                value={booth.zone_name}
              />
            )}

            {booth.hall && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                }
                label="ฮอลล์"
                value={booth.hall}
              />
            )}

            {!booth.zone_name && !booth.hall && (
              <p className="text-gray-400 italic text-sm">ไม่มีข้อมูลสถานที่</p>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              ติดต่อ
            </h3>

            {booth.email && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
                label="อีเมล"
                value={booth.email}
                link={`mailto:${booth.email}`}
              />
            )}

            {booth.tel && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                }
                label="โทรศัพท์"
                value={booth.tel}
                link={`tel:${booth.tel}`}
              />
            )}

            {booth.website1 && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                }
                label="เว็บไซต์"
                value={booth.website1}
                link={booth.website1}
              />
            )}

            {booth.website2 && (
              <InfoRow
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                }
                label="เว็บไซต์ 2"
                value={booth.website2}
                link={booth.website2}
              />
            )}

            {!booth.email && !booth.tel && !booth.website1 && !booth.website2 && (
              <p className="text-gray-400 italic text-sm">ไม่มีข้อมูลติดต่อ</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="font-medium">สร้างเมื่อ:</span>
              <span>{new Date(booth.created_at).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="font-medium">แก้ไขล่าสุด:</span>
              <span>{new Date(booth.updated_at).toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Info Row Component
// ============================================

interface InfoRowProps {
  icon: React.ReactElement;
  label: string;
  value: string;
  link?: string;
}

function InfoRow({ icon, label, value, link }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#3674B5] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

interface ComingSoonTabProps {
  feature: string;
}

function ComingSoonTab({ feature }: ComingSoonTabProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">กำลังพัฒนา</h3>
      <p className="text-gray-600">
        ฟีเจอร์ <span className="font-semibold">{feature}</span> จะเปิดให้ใช้งานเร็วๆ นี้
      </p>
    </div>
  );
}