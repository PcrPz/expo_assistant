// src/features/booths/components/BoothTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoothsByExpoId, getMyBooths } from '../api/boothApi';
import { CreateBoothModal } from './CreateBoothModal';
import type { Booth } from '../types/booth.types';
import type { EventRole } from '@/src/features/events/types/event.types';

interface BoothTabProps {
  expoId: string;
  role: EventRole;
}

export function BoothTab({ expoId, role }: BoothTabProps) {
  const router = useRouter();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [myBoothIds, setMyBoothIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Permission Check
  const canCreate = role === 'owner' || role === 'admin' || role === 'system_admin';

  useEffect(() => {
    loadBooths();
  }, [expoId]);

  const loadBooths = async () => {
    try {
      setIsLoading(true);
      
      const allBooths = await getBoothsByExpoId(expoId);
      setBooths(allBooths);

      if (role === 'booth_staff') {
        const myBooths = await getMyBooths();
        const myIds = new Set(
          myBooths
            .filter(b => b.expo_id === expoId)
            .map(b => b.booth_id)
        );
        setMyBoothIds(myIds);
      }
    } catch (error) {
      console.error('Failed to load booths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Booths
  const filteredBooths = booths.filter(booth => {
    const matchesSearch = 
      (booth.booth_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booth.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesType = selectedType === 'all' || booth.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Group by "My Booths" and "Other Booths" (เฉพาะ booth_staff)
  const myBooths = role === 'booth_staff' ? filteredBooths.filter(b => myBoothIds.has(b.booth_id)) : [];
  const otherBooths = role === 'booth_staff' ? filteredBooths.filter(b => !myBoothIds.has(b.booth_id)) : [];

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#3674B5] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดบูธ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเลขที่บูธ หรือชื่อบูธ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Type Filter + Create Button */}
        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
          >
            <option value="all">ทุกประเภท</option>
            <option value="small_booth">บูธเล็ก</option>
            <option value="big_booth">บูธใหญ่</option>
            <option value="stage">เวที</option>
          </select>

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              สร้างบูธ
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredBooths.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/No_data.png" 
              alt="ไม่พบบูธ"
              className="w-48 h-48 object-contain opacity-60"
            />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">ไม่พบบูธ</p>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedType !== 'all'
              ? 'ลองเปลี่ยนเงื่อนไขการค้นหา'
              : canCreate
              ? 'เริ่มต้นด้วยการสร้างบูธแรก'
              : 'ยังไม่มีบูธในงานนี้'
            }
          </p>
          {canCreate && !searchQuery && selectedType === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition shadow-md"
            >
              สร้างบูธ
            </button>
          )}
        </div>
      )}

      {/* เฉพาะ booth_staff: แสดง "บูธของฉัน" และ "บูธอื่นๆ" */}
      {role === 'booth_staff' && filteredBooths.length > 0 && (
        <>
          {/* My Booths Section */}
          {myBooths.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">บูธของฉัน</h3>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {myBooths.length} บูธ
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBooths.map((booth) => (
                  <BoothCard
                    key={booth.booth_id}
                    booth={booth}
                    isMyBooth={true}
                    onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Booths Section */}
          {otherBooths.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">บูธอื่นๆ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherBooths.map((booth) => (
                  <BoothCard
                    key={booth.booth_id}
                    booth={booth}
                    isMyBooth={false}
                    onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* สำหรับ owner/admin/system_admin: แสดง "บูธทั้งหมด" เพียงครั้งเดียว */}
      {role !== 'booth_staff' && filteredBooths.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">บูธทั้งหมด</h3>
            <span className="px-2 py-1 bg-[#E8F0FB] text-[#3674B5] text-xs font-semibold rounded-full">
              {filteredBooths.length} บูธ
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooths.map((booth) => (
              <BoothCard
                key={booth.booth_id}
                booth={booth}
                isMyBooth={false}
                onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create Booth Modal */}
      {showCreateModal && (
        <CreateBoothModal
          expoId={expoId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadBooths}
        />
      )}
    </div>
  );
}

// ============================================
// Booth Card Component
// ============================================

interface BoothCardProps {
  booth: Booth;
  isMyBooth: boolean;
  onClick: () => void;
}

function BoothCard({ booth, isMyBooth, onClick }: BoothCardProps) {
  const { getMinioFileUrl } = require('@/src/features/minio/api/minioApi');
  
  const TYPE_CONFIG: Record<string, { 
    icon: React.ReactElement; 
    color: string; 
    lightColor: string;
    label: string;
  }> = {
    small_booth: {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      color: '#3674B5',
      lightColor: '#E8F0FB',
      label: 'บูธเล็ก'
    },
    big_booth: {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      color: '#498AC3',
      lightColor: '#EBF4FC',
      label: 'บูธใหญ่'
    },
    stage: {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      ),
      color: '#749BC2',
      lightColor: '#EBF4FC',
      label: 'เวที'
    },
  };

  const config = TYPE_CONFIG[booth.type] || TYPE_CONFIG.small_booth;
  const thumbnailUrl = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-[#3674B5] hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* My Booth Badge */}
      {isMyBooth && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 bg-[#3674B5] text-white text-[10px] font-semibold rounded-md shadow-md">
            บูธของฉัน
          </span>
        </div>
      )}

      {/* Thumbnail Image */}
      {thumbnailUrl ? (
        <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
          <img 
            src={thumbnailUrl} 
            alt={booth.booth_no}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.parentElement) {
                const parent = target.parentElement;
                // ✅ สร้าง gradient สีอ่อนตาม type
                const bgGradient = booth.type === 'stage' 
                  ? 'linear-gradient(135deg, rgba(116, 155, 194, 0.15) 0%, rgba(116, 155, 194, 0.08) 100%)'
                  : `linear-gradient(135deg, ${config.lightColor} 0%, #F0F5FA 100%)`;
                
                const patternColor = booth.type === 'stage' ? '#749BC2' : config.color;
                
                parent.innerHTML = `
                  <div class="w-full h-32 flex items-center justify-center relative overflow-hidden" style="background: ${bgGradient};">
                    <div class="text-center z-10">
                      <div class="w-16 h-16 mx-auto mb-2 rounded-xl flex items-center justify-center" style="background-color: rgba(255, 255, 255, 0.6); color: ${patternColor};">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          ${booth.type === 'stage' 
                            ? '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>'
                            : booth.type === 'big_booth'
                            ? '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>'
                            : '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
                          }
                        </svg>
                      </div>
                    </div>
                    <svg class="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="pattern-${booth.booth_id}" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="${patternColor}" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#pattern-${booth.booth_id})" />
                    </svg>
                  </div>
                `;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      ) : (
        // ✅ Placeholder สำหรับบูธที่ไม่มีรูป - ปรับสีตาม type
        <div 
          className="relative w-full h-32 flex items-center justify-center overflow-hidden"
          style={{ 
            background: booth.type === 'stage'
              ? 'linear-gradient(135deg, rgba(116, 155, 194, 0.15) 0%, rgba(116, 155, 194, 0.08) 100%)'
              : `linear-gradient(135deg, ${config.lightColor} 0%, #F0F5FA 100%)`
          }}
        >
          {/* Main Content */}
          <div className="relative z-10 text-center">
            <div 
              className="w-16 h-16 mx-auto mb-2 rounded-xl flex items-center justify-center shadow-sm"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                color: booth.type === 'stage' ? '#749BC2' : config.color
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {booth.type === 'small_booth' && (
                  <>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </>
                )}
                {booth.type === 'big_booth' && (
                  <>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </>
                )}
                {booth.type === 'stage' && (
                  <>
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </>
                )}
              </svg>
            </div>
            {/* ✅ เอาข้อความออก - ไม่แสดงอะไรเลย */}
          </div>
          
          {/* Decorative Pattern Background */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern 
                id={`pattern-${booth.booth_id}`} 
                width="20" 
                height="20" 
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="1" fill={booth.type === 'stage' ? '#749BC2' : config.color} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${booth.booth_id})`} />
          </svg>

          {/* Corner Decoration */}
          <div 
            className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10"
            style={{ backgroundColor: booth.type === 'stage' ? '#749BC2' : config.color }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-16 h-16 rounded-tr-full opacity-10"
            style={{ backgroundColor: booth.type === 'stage' ? '#749BC2' : config.color }}
          ></div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: config.lightColor,
              color: booth.type === 'stage' ? '#749BC2' : config.color
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {booth.type === 'small_booth' && (
                <>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </>
              )}
              {booth.type === 'big_booth' && (
                <>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </>
              )}
              {booth.type === 'stage' && (
                <>
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </>
              )}
            </svg>
          </div>
          
          <span 
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
            style={{ 
              color: booth.type === 'stage' ? '#749BC2' : config.color,
              backgroundColor: config.lightColor
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Booth Number */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#3674B5] transition">
          {booth.booth_no}
        </h3>

        {/* Info */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          {booth.zone_name && (
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="font-medium">{booth.zone_name}</span>
            </div>
          )}

          {booth.hall && (
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              <span className="font-medium">{booth.hall}</span>
            </div>
          )}

          {!booth.zone_name && !booth.hall && (
            <span className="text-gray-400 italic">ไม่ระบุ</span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute bottom-3 right-3 text-gray-300 group-hover:text-[#3674B5] group-hover:translate-x-0.5 transition-all">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>
  );
}