// src/features/events/components/organizer/ExploreBoothGroupPage.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { searchBoothGroups } from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGroupSearchItem } from '@/src/features/booths/types/boothGlobal.types';
import { InviteBoothGroupModal } from './InviteBoothGroupMedal';

interface ExploreBoothGroupPageProps {
  expoId: string;
}

export function ExploreBoothGroupPage({ expoId }: ExploreBoothGroupPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const searchRef = useRef('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const [boothGroups, setBoothGroups] = useState<BoothGroupSearchItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothGroupSearchItem | null>(null);

  useEffect(() => {
    loadData(1, searchRef.current);
  }, []);

  const loadData = async (page: number, searchVal: string) => {
    setLoading(true);
    try {
      const res = await searchBoothGroups({ search: searchVal, page, pageSize: PAGE_SIZE });
      setBoothGroups(res.boothGroups);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error('❌ searchBoothGroups error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRef.current = search;
    loadData(1, search);
  };

  const handlePageChange = (page: number) => {
    loadData(page, searchRef.current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startItem = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-5">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Back Button */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 bg-white/50 hover:bg-white border border-gray-200 rounded-lg transition group shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="group-hover:-translate-x-0.5 transition-transform">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span className="text-sm font-medium">ย้อนกลับ</span>
        </button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ค้นหาบูธ</h1>
          <p className="text-sm text-gray-500 mt-1">เลือกบูธที่ต้องการเชิญเข้าร่วมงาน</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อบูธ, บริษัท..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] transition"
              />
            </div>
            <button type="submit"
              className="px-6 py-3 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition shadow-sm">
              ค้นหา
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle className="opacity-25" cx="12" cy="12" r="10"/>
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>

        ) : boothGroups.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-gray-500 font-medium">ไม่พบบูธที่ค้นหา</p>
            {search && (
              <button onClick={() => { setSearch(''); searchRef.current = ''; loadData(1, ''); }}
                className="mt-3 text-sm text-[#3674B5] hover:underline">
                ล้างการค้นหา
              </button>
            )}
          </div>

        ) : (
          <>
            {/* Info Bar */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>แสดง {startItem}–{endItem} จาก {total} รายการ</p>
              <p>หน้า {currentPage} / {totalPages}</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boothGroups.map((booth) => {
                const imageUrl = booth.profilePic ? getMinioFileUrl(booth.profilePic) : null;
                return (
                  <div key={booth.id}
                    className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:scale-[1.02] hover:border-[#3674B5] transition-all duration-300 group">

                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={booth.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`fallback-icon w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-[#3674B5] transition-colors">
                          {booth.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                          </svg>
                          <span className="text-sm truncate">{booth.company}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100"/>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/booths/booth-group/${booth.id}?fromExpo=${expoId}`)}
                          className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-sm">
                          รายละเอียด
                        </button>
                        <button
                          onClick={() => setSelectedBooth(booth)}
                          className="flex-1 px-4 py-2.5 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition text-sm shadow-sm">
                          เชิญ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  ← ก่อนหน้า
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button key={page} onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 font-semibold rounded-lg transition ${
                          page === currentPage
                            ? 'bg-[#3674B5] text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}>
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 text-gray-400">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
                  ถัดไป →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Modal */}
      {selectedBooth && (
        <InviteBoothGroupModal
          boothGroup={{ ID: selectedBooth.id, Title: selectedBooth.title, Company: selectedBooth.company }}
          expoId={expoId}
          onClose={() => setSelectedBooth(null)}
          onSuccess={() => {
            setSelectedBooth(null);
            loadData(currentPage, searchRef.current);
          }}
        />
      )}
    </div>
  );
}