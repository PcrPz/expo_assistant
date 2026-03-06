'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCategoriesForFilter, getCategoryLabel } from '@/src/features/events/constants/categories';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import {
  searchExpos,
  getAvailableBooths,
  applyToJoinBooth,
  getMyBoothGlobal,
} from '@/src/features/booths/api/boothGlobalApi';
import type {
  ExpoSearchResult,
  AvailableBooth,
} from '@/src/features/booths/types/boothGlobal.types';

const CATEGORIES = getCategoriesForFilter();

const BOOTH_TYPE_LABELS: Record<string, string> = {
  small_booth: 'บูธขนาดเล็ก',
  big_booth: 'บูธขนาดใหญ่',
  stage: 'เวที',
};

// ─── Join Request Modal ──────────────────────────────────────

interface JoinModalProps {
  expo: ExpoSearchResult;
  boothGroupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function JoinRequestModal({ expo, boothGroupId, onClose, onSuccess }: JoinModalProps) {
  const [booths, setBooths] = useState<AvailableBooth[]>([]);
  const [loadingBooths, setLoadingBooths] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<AvailableBooth | null>(null);
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAvailableBooths(expo.id)
      .then(data => setBooths(data))
      .catch(() => setError('โหลดข้อมูลบูธไม่สำเร็จ'))
      .finally(() => setLoadingBooths(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedBooth) { setError('กรุณาเลือกบูธก่อน'); return; }
    setSubmitting(true);
    setError('');
    try {
      await applyToJoinBooth(expo.id, selectedBooth.boothId, boothGroupId, detail);
      onSuccess();
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const availableBooths = booths.filter(b => b.status === 'available');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">ขอเข้าร่วมงาน</h2>
              </div>
              <p className="text-sm text-gray-400 line-clamp-1 pl-9">{expo.title}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Booth Select */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">เลือกบูธ</p>
              {!loadingBooths && availableBooths.length > 0 && (
                <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium">
                  ว่าง {availableBooths.length} บูธ
                </span>
              )}
            </div>

            {loadingBooths ? (
              <div className="flex items-center justify-center py-10 bg-gray-50 rounded-xl">
                <svg className="animate-spin w-6 h-6 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            ) : availableBooths.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mx-auto mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                <p className="text-sm text-gray-400">ไม่มีบูธว่างในขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableBooths.map(booth => (
                  <button key={booth.boothId} onClick={() => setSelectedBooth(booth)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left
                      ${selectedBooth?.boothId === booth.boothId
                        ? 'border-[#3674B5] bg-blue-50/80'
                        : 'border-gray-100 hover:border-blue-200 bg-gray-50 hover:bg-blue-50/40'
                      }`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
                      ${selectedBooth?.boothId === booth.boothId ? 'border-[#3674B5] bg-[#3674B5]' : 'border-gray-300'}`}>
                      {selectedBooth?.boothId === booth.boothId && (
                        <div className="w-2 h-2 rounded-full bg-white"/>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">บูธ {booth.boothNo}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {BOOTH_TYPE_LABELS[booth.type] || booth.type}
                        {booth.hall && ` · ฮอลล์ ${booth.hall}`}
                        {booth.zoneName && ` · โซน ${booth.zoneName}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#3674B5]">{booth.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">บาท</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Summary */}
          {selectedBooth && (
            <div className="flex items-center justify-between bg-[#3674B5]/5 border border-[#3674B5]/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-500">บูธที่เลือก</p>
                  <p className="text-sm font-bold text-gray-900">บูธ {selectedBooth.boothNo}</p>
                </div>
              </div>
              <p className="text-base font-bold text-[#3674B5]">{selectedBooth.price.toLocaleString()} ฿</p>
            </div>
          )}

          {/* Detail */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              ข้อความถึงผู้จัดงาน
              <span className="ml-1.5 text-gray-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="แนะนำสินค้า/บริการ หรือเหตุผลที่ต้องการเข้าร่วมงาน..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] transition bg-gray-50 focus:bg-white"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.5" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
            ยกเลิก
          </button>
          <button onClick={handleSubmit}
            disabled={submitting || !selectedBooth || availableBooths.length === 0}
            className="flex-1 py-3 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังส่ง...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                ส่งคำขอเข้าร่วม
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Success Modal ─────────────────────────────────────────────

function SuccessModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งคำขอสำเร็จ!</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          คำขอของคุณถูกส่งไปยังผู้จัดงานแล้ว<br/>รอการพิจารณาและตอบรับจากผู้จัดงาน
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition">
            ดูงานต่อ
          </button>
          <button onClick={() => router.push('/booths/my-applications')}
            className="flex-1 py-2.5 bg-[#3674B5] text-white font-semibold rounded-xl text-sm hover:bg-[#2d5a8f] transition shadow-sm">
            ดูคำขอของฉัน
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Expo Card ────────────────────────────────────────────────

function ExpoCard({ expo, onApply }: { expo: ExpoSearchResult; onApply: (expo: ExpoSearchResult) => void }) {
  const router = useRouter();
  const thumbnailUrl = expo.thumbnail ? getMinioFileUrl(expo.thumbnail) : null;
  const catLabel = getCategoryLabel(expo.category, false);

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative w-full h-44 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={expo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#bfdbfe" strokeWidth="1.2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
        )}
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#3674B5] text-xs font-semibold rounded-lg shadow-sm">
            {catLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-[#3674B5] transition-colors">
          {expo.title}
        </h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-400">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="line-clamp-1">{expo.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>{formatDate(expo.startDate)} – {formatDate(expo.endDate)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => router.push(`/events/${expo.id}`)}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition">
            ดูรายละเอียด
          </button>
          <button onClick={() => onApply(expo)}
            className="flex-1 py-2.5 bg-[#3674B5] text-white font-semibold rounded-xl text-sm hover:bg-[#2d5a8f] transition shadow-sm">
            ขอเข้าร่วม
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function ExploreEventsPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expos, setExpos] = useState<ExpoSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [applyTarget, setApplyTarget] = useState<ExpoSearchResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [boothGroupId, setBoothGroupId] = useState('');

  // ── ใช้ ref เก็บค่าล่าสุดเพื่อกัน stale closure ──
  const searchRef = useRef(search);
  const categoryRef = useRef(category);
  searchRef.current = search;
  categoryRef.current = category;

  useEffect(() => {
    getMyBoothGlobal()
      .then(({ booth }) => { if (booth?.id) setBoothGroupId(booth.id); })
      .catch(() => {});
  }, []);

  const loadExpos = useCallback(async (p: number, s: string, cat: string) => {
    setLoading(true);
    try {
      const result = await searchExpos({ search: s, category: cat, page: p, pageSize: 9 });
      setExpos(result.expos);
      setTotalPages(result.totalPages);
      setPage(p);
    } catch {
      setExpos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดครั้งแรก
  useEffect(() => {
    loadExpos(1, '', '');
  }, []);

  // กด category — ส่งค่าตรงๆ แก้ bug filter หาย
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadExpos(1, searchRef.current, newCat);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadExpos(1, searchRef.current, categoryRef.current);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="max-w-5xl mx-auto px-5 py-6 space-y-6">

        {/* Header */}
        <div>
          <button onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-4 text-sm text-gray-500 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition group">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="group-hover:-translate-x-0.5 transition-transform">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            ย้อนกลับ
          </button>
          <h1 className="text-2xl font-bold text-gray-900">ค้นหางาน Expo</h1>
          <p className="text-sm text-gray-400 mt-1">เลือกงานที่ต้องการขอเข้าร่วม</p>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="flex-1 relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ค้นหาชื่องาน, สถานที่..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] focus:bg-white transition"
              />
            </div>
            <button type="submit"
              className="px-5 py-2.5 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition text-sm shadow-sm whitespace-nowrap">
              ค้นหา
            </button>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition
                  ${category === cat.value
                    ? 'bg-[#3674B5] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="animate-spin w-7 h-7 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle className="opacity-25" cx="12" cy="12" r="10"/>
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        ) : expos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-500 font-medium text-sm">ไม่พบงานที่ตรงกับการค้นหา</p>
              <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
            </div>
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); handleCategoryChange(''); }}
                className="text-xs text-[#3674B5] hover:underline mt-1"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expos.map(expo => (
                <ExpoCard key={expo.id} expo={expo}
                  onApply={(e) => {
                    if (!boothGroupId) {
                      alert('กรุณาสร้างหรือเข้าร่วมบูธก่อน');
                      return;
                    }
                    setApplyTarget(e);
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => loadExpos(page - 1, searchRef.current, categoryRef.current)}
                  disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p}
                    onClick={() => loadExpos(p, searchRef.current, categoryRef.current)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition
                      ${p === page ? 'bg-[#3674B5] text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadExpos(page + 1, searchRef.current, categoryRef.current)}
                  disabled={page >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {applyTarget && (
        <JoinRequestModal
          expo={applyTarget}
          boothGroupId={boothGroupId}
          onClose={() => setApplyTarget(null)}
          onSuccess={() => { setApplyTarget(null); setShowSuccess(true); }}
        />
      )}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </div>
  );
}