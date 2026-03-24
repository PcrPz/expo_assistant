// src/features/events/components/organizer/ExploreBoothGroupPage.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { searchBoothGroups } from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGroupSearchItem } from '@/src/features/booths/types/boothGlobal.types';
import { InviteBoothGroupModal } from './InviteBoothGroupMedal';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

interface ExploreBoothGroupPageProps {
  expoId: string;
}

// ─── BoothGroup Card ──────────────────────────────────────────
function BoothGroupCard({
  booth,
  onInvite,
  onDetail,
}: {
  booth: BoothGroupSearchItem;
  onInvite: (b: BoothGroupSearchItem) => void;
  onDetail: (b: BoothGroupSearchItem) => void;
}) {
  const imageUrl = booth.profilePic ? getMinioFileUrl(booth.profilePic) : null;
  const initials = booth.title
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">

      {/* Thumbnail */}
      <div
        className="relative h-[130px] overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={booth.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}

      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-[14px] font-black text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#3674B5] transition-colors">
          {booth.title}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="flex-shrink-0">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <span className="text-[12px] text-gray-500 line-clamp-1">{booth.company}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onDetail(booth)}
            className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl text-[12px] hover:border-gray-300 hover:bg-gray-50 transition"
          >
            รายละเอียด
          </button>
          <button
            onClick={() => onInvite(booth)}
            className="flex-1 py-2 text-white font-bold rounded-xl text-[12px] hover:opacity-90 transition shadow-sm"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            เชิญ
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════

export function ExploreBoothGroupPage({ expoId }: ExploreBoothGroupPageProps) {
  const router = useRouter();
  const [search,       setSearch]       = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [boothGroups,  setBoothGroups]  = useState<BoothGroupSearchItem[]>([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<BoothGroupSearchItem | null>(null);

  const PAGE_SIZE = 9;
  const searchRef = useRef('');

  useEffect(() => {
    loadData(1, '');
  }, []);

  const loadData = async (page: number, searchVal: string) => {
    setLoading(true);
    try {
      const res = await searchBoothGroups({
        expoId,
        search: searchVal,
        page,
        pageSize: PAGE_SIZE,
      });
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
  const endItem   = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div className="min-h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-screen-xl mx-auto px-8 py-6 space-y-5">

        {/* ── Back ────────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-bold transition hover:bg-[#EEF4FB]"
          style={{ borderColor: '#D1D9E6', color: BLUE }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = BLUE)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#D1D9E6')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          ย้อนกลับ
        </button>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div
            className="w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[20px] font-black text-gray-900">ค้นหาบูธ</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">เลือกบูธที่ต้องการเชิญเข้าร่วมงาน</p>
          </div>
        </div>

        {/* ── Search ──────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อบูธ, บริษัท..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] focus:bg-white transition placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-white font-bold rounded-xl text-sm hover:opacity-90 transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              ค้นหา
            </button>
          </form>
        </div>

        {/* ── Results ─────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
            <p className="text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        ) : boothGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-semibold text-sm">ไม่พบบูธที่ค้นหา</p>
              <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนคำค้นหา</p>
            </div>
            {search && (
              <button
                onClick={() => { setSearch(''); searchRef.current = ''; loadData(1, ''); }}
                className="text-xs font-semibold hover:underline"
                style={{ color: BLUE }}
              >
                ล้างการค้นหา
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Info bar */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-gray-400">
                แสดง {startItem}–{endItem} จาก {total} รายการ
              </p>
              <p className="text-[13px] text-gray-400">หน้า {currentPage} / {totalPages}</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {boothGroups.map(booth => (
                <BoothGroupCard
                  key={booth.id}
                  booth={booth}
                  onInvite={b => setSelectedBooth(b)}
                  onDetail={b => router.push(`/booths/booth-group/${b.id}?fromExpo=${expoId}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                          page === currentPage
                            ? 'text-white shadow-sm'
                            : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                        style={page === currentPage ? { background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` } : undefined}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-gray-400 text-sm px-1">…</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Invite Modal ──────────────────────────────────── */}
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