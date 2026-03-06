// src/features/booths/components/booth-global/BoothGroupDetailPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { getBoothGroupDetail } from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGlobal } from '@/src/features/booths/types/boothGlobal.types';
import { InviteBoothGroupModal } from '@/src/features/events/components/organizer/InviteBoothGroupMedal';

interface BoothGroupDetailPageProps {
  boothGroupId: string;
  fromExpoId?: string; // ถ้ามาจากหน้า Explore Booths ของ Organizer
}

export function BoothGroupDetailPage({ boothGroupId, fromExpoId }: BoothGroupDetailPageProps) {
  const router = useRouter();
  const [booth, setBooth] = useState<BoothGlobal | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [boothGroupId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { booth: data, role: r } = await getBoothGroupDetail(boothGroupId);
      setBooth(data);
      setRole(r);
      console.log(`✅ BoothGroupDetail loaded: id=${boothGroupId} role=${r}`);
    } catch (err) {
      console.error('❌ Failed to load booth group detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg className="animate-spin w-8 h-8 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle className="opacity-25" cx="12" cy="12" r="10"/>
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  // ─── Not Found ─────────────────────────────────────────────
  if (!booth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบข้อมูลบูธ</p>
          <button onClick={() => router.back()}
            className="px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition">
            ย้อนกลับ
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = booth.profilePic ? getMinioFileUrl(booth.profilePic) : null;

  // แสดงปุ่มเชิญถ้า:
  // 1. มี fromExpoId (มาจากหน้า Explore Booths) — กรณีปกติ
  // 2. role === 'booth_group_visitor' — เมื่อ backend แก้ bug แล้ว
  // TODO: ลบ !!fromExpoId ออกได้เมื่อ backend ส่ง role ถูกต้อง
  const canInvite = !!fromExpoId || role === 'booth_group_visitor';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span className="text-sm font-medium">ย้อนกลับ</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          {/* Cover */}
          <div className="relative h-56 bg-gradient-to-br from-[#3674B5] to-[#498AC3] overflow-hidden">
            {imageUrl && (
              <img src={imageUrl} alt={booth.title}
                className="w-full h-full object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
          </div>

          {/* Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{booth.title}</h1>

                <div className="flex items-center gap-2 text-gray-500 mb-5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <span className="text-base font-medium">{booth.company}</span>
                </div>

                {booth.detail && (
                  <p className="text-gray-700 leading-relaxed">{booth.detail}</p>
                )}
              </div>

              {/* ปุ่มเชิญ — เฉพาะ Organizer ที่มาจาก Explore */}
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex-shrink-0 px-6 py-3 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition shadow-md flex items-center gap-2 whitespace-nowrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  เชิญเข้าร่วมงาน
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(booth.email || booth.tel || booth.website1 || booth.website2) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              ช่องทางการติดต่อ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {booth.email && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">อีเมล</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{booth.email}</p>
                  </div>
                </div>
              )}

              {booth.tel && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">เบอร์โทร</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{booth.tel}</p>
                  </div>
                </div>
              )}

              {booth.website1 && (
                <a href={booth.website1} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#3674B5] hover:bg-blue-50 transition group">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:border-[#3674B5]/30 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">เว็บไซต์</p>
                    <p className="text-sm font-medium text-[#3674B5] truncate">{booth.website1}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7 7 17 7 17 17"/>
                  </svg>
                </a>
              )}

              {booth.website2 && (
                <a href={booth.website2} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#3674B5] hover:bg-blue-50 transition group">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 group-hover:border-[#3674B5]/30 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">ลิงก์เพิ่มเติม</p>
                    <p className="text-sm font-medium text-[#3674B5] truncate">{booth.website2}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0">
                    <line x1="7" y1="17" x2="17" y2="7"/>
                    <polyline points="7 7 17 7 17 17"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Booths in Expos */}
        {booth.booth && booth.booth.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              บูธในงานอื่นๆ ({booth.booth.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {booth.booth.map((b, i) => (
                <div key={i}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#3674B5] hover:shadow-sm transition">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{b.expoTitle}</h3>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p><span className="font-medium text-gray-700">บูธ:</span> {b.boothNo}</p>
                    {b.zoneName && <p><span className="font-medium text-gray-700">โซน:</span> {b.zoneName}</p>}
                    {b.hall && <p><span className="font-medium text-gray-700">ห้อง:</span> {b.hall}</p>}
                    {b.type && <p><span className="font-medium text-gray-700">ประเภท:</span> {b.type}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* กรณี Booth = null (ยังไม่เคยเข้าร่วมงาน) */}
        {(!booth.booth || booth.booth.length === 0) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              บูธในงานอื่นๆ
            </h2>
            <p className="text-sm text-gray-400">ยังไม่เคยเข้าร่วมงานใดมาก่อน</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && fromExpoId && (
        <InviteBoothGroupModal
          boothGroup={{ ID: booth.id, Title: booth.title, Company: booth.company }}
          expoId={fromExpoId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}