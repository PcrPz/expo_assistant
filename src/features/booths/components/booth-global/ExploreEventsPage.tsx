'use client';
import { toast } from '@/src/lib/toast';

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

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

const CATEGORIES = getCategoriesForFilter();

const BOOTH_TYPE_LABELS: Record<string, string> = {
  small_booth: 'บูธขนาดเล็ก',
  big_booth:   'บูธขนาดใหญ่',
  stage:       'เวที',
};

// ─── Helpers ──────────────────────────────────────────────────
function formatDate(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

// ══════════════════════════════════════════════════════════════
// JoinRequestModal
// ══════════════════════════════════════════════════════════════

interface JoinModalProps {
  expo: ExpoSearchResult;
  boothGroupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function JoinRequestModal({ expo, boothGroupId, onClose, onSuccess }: JoinModalProps) {
  const [booths,       setBooths]       = useState<AvailableBooth[]>([]);
  const [loadingBooths, setLoadingBooths] = useState(true);
  const [selectedBooth, setSelectedBooth] = useState<AvailableBooth | null>(null);
  const [detail,       setDetail]       = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    getAvailableBooths(expo.id, boothGroupId)
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BL }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-black text-gray-900">ขอเข้าร่วมงาน</h3>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate">{expo.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Section label ──────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <p className="text-[13px] font-bold text-gray-700">เลือกบูธ</p>
          {!loadingBooths && availableBooths.length > 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ว่าง {availableBooths.length} บูธ
            </span>
          )}
        </div>

        {/* ── Scrollable booth table ──────────────────────── */}
        <div className="overflow-y-auto flex-shrink-0" style={{ maxHeight: '240px' }}>
          {loadingBooths ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
            </div>
          ) : availableBooths.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <p className="text-sm text-gray-400">ไม่มีบูธว่างในขณะนี้</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="sticky top-0 z-10">
                  <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 py-2.5 bg-gray-50 border-b border-gray-100">บูธ</th>
                  <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 bg-gray-50 border-b border-gray-100">ประเภท / ที่ตั้ง</th>
                  <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 py-2.5 bg-gray-50 border-b border-gray-100">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {availableBooths.map((booth, idx) => (
                  <tr
                    key={booth.boothId}
                    onClick={() => setSelectedBooth(booth)}
                    className={`cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                      selectedBooth?.boothId === booth.boothId
                        ? 'bg-[#EEF4FB]'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-[17px] h-[17px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                            selectedBooth?.boothId === booth.boothId
                              ? 'border-[#3674B5] bg-[#3674B5]'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedBooth?.boothId === booth.boothId && (
                            <div className="w-[5px] h-[5px] rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-[13px] font-bold text-gray-900">{booth.boothNo}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[12px] text-gray-500">
                        {BOOTH_TYPE_LABELS[booth.type] || booth.type}
                        {booth.hall ? ` · ฮอลล์ ${booth.hall}` : ''}
                        {booth.zoneName ? ` · โซน ${booth.zoneName}` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-[13px] font-bold" style={{ color: BLUE }}>
                        {booth.price > 0 ? `${booth.price.toLocaleString()} ฿` : 'ฟรี'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Textarea + error ───────────────────────────── */}
        <div className="px-5 pt-3 pb-4 flex-shrink-0 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-bold text-gray-700">ข้อความถึงผู้จัดงาน</p>
            <span className="text-[11px] text-gray-400">(ไม่บังคับ)</span>
          </div>
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="แนะนำสินค้า/บริการ หรือเหตุผลที่ต้องการเข้าร่วมงาน..."
            rows={3}
            className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3674B5]/15 focus:border-[#3674B5] transition bg-gray-50 focus:bg-white"
          />
          {error && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-[12px] text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="flex gap-2.5 px-5 py-4 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedBooth || availableBooths.length === 0}
            className="flex-1 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
                </svg>
                กำลังส่ง...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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

// ══════════════════════════════════════════════════════════════
// SuccessModal
// ══════════════════════════════════════════════════════════════

function SuccessModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 className="text-[18px] font-black text-gray-900 mb-2">ส่งคำขอสำเร็จ!</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            คำขอของคุณถูกส่งไปยังผู้จัดงานแล้ว<br/>รอการพิจารณาและตอบรับจากผู้จัดงาน
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
            >
              ดูงานต่อ
            </button>
            <button
              onClick={() => router.push('/booths/my-applications')}
              className="flex-1 py-2.5 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              ดูคำขอของฉัน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ExpoCard — Style C (thumbnail + date overlay)
// ══════════════════════════════════════════════════════════════

function ExpoCard({ expo, onApply }: { expo: ExpoSearchResult; onApply: (expo: ExpoSearchResult) => void }) {
  const router = useRouter();
  const thumbnailUrl = expo.thumbnail ? getMinioFileUrl(expo.thumbnail) : null;
  const catLabel = getCategoryLabel(expo.category, false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer">

      {/* Thumbnail */}
      <div
        className="relative h-[140px] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
      >
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={expo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        {/* gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />

        {/* category badge — top left */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-block px-2.5 py-1 bg-white/92 backdrop-blur-sm text-[#3674B5] text-[11px] font-bold rounded-lg shadow-sm">
            {catLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-black text-gray-900 text-[14px] leading-snug mb-2 line-clamp-2 group-hover:text-[#3674B5] transition-colors">
          {expo.title}
        </h3>
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="flex-shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[12px] text-gray-500 line-clamp-1">{expo.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="flex-shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="text-[12px] text-gray-500">
              {formatDate(expo.startDate)} – {formatDate(expo.endDate)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/events/${expo.id}?from=explore`)}
            className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl text-[12px] hover:border-gray-300 hover:bg-gray-50 transition"
          >
            ดูรายละเอียด
          </button>
          <button
            onClick={() => onApply(expo)}
            className="flex-1 py-2 text-white font-bold rounded-xl text-[12px] hover:opacity-90 transition shadow-sm"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            ขอเข้าร่วม
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════

export function ExploreEventsPage() {
  const router = useRouter();

  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('');
  const [expos,       setExpos]       = useState<ExpoSearchResult[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [applyTarget, setApplyTarget] = useState<ExpoSearchResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [boothGroupId, setBoothGroupId] = useState('');

  // กัน stale closure
  const searchRef   = useRef(search);
  const categoryRef = useRef(category);
  searchRef.current   = search;
  categoryRef.current = category;

  useEffect(() => {
    getMyBoothGlobal()
      .then(({ booth }) => { if (booth?.id) setBoothGroupId(booth.id); })
      .catch(() => {});
  }, []);

  const loadExpos = useCallback(async (p: number, s: string, cat: string) => {
    if (!boothGroupId) return;
    setLoading(true);
    try {
      const result = await searchExpos({ boothGroupId, search: s, category: cat, page: p, pageSize: 9 });
      setExpos(result.expos);
      setTotalPages(result.totalPages);
      setPage(p);
    } catch {
      setExpos([]);
    } finally {
      setLoading(false);
    }
  }, [boothGroupId]);

  // โหลดครั้งแรกเมื่อได้ boothGroupId
  useEffect(() => {
    if (boothGroupId) loadExpos(1, '', '');
  }, [boothGroupId]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadExpos(1, searchRef.current, newCat);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadExpos(1, searchRef.current, categoryRef.current);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-screen-xl mx-auto px-8 py-6 space-y-5">

        {/* ── Back ────────────────────────────────────────── */}
        <button
          onClick={() => router.push('/booths/my-booth')}
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
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[20px] font-black text-gray-900">ค้นหางาน Expo</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">เลือกงานที่ต้องการขอเข้าร่วม</p>
          </div>
        </div>

        {/* ── Search + Filter card ─────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
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
                placeholder="ค้นหาชื่องาน, สถานที่..."
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

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition border ${
                  category === cat.value
                    ? 'bg-[#3674B5] text-white border-[#3674B5] shadow-sm'
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-[#EEF4FB] hover:text-[#3674B5] hover:border-[#B8D0EA]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
            <p className="text-sm text-gray-400">กำลังโหลด...</p>
          </div>
        ) : expos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-semibold text-sm">ไม่พบงานที่ตรงกับการค้นหา</p>
              <p className="text-gray-400 text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
            </div>
            {(search || category) && (
              <button
                onClick={() => { setSearch(''); handleCategoryChange(''); }}
                className="text-xs font-semibold mt-1 hover:underline"
                style={{ color: BLUE }}
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expos.map(expo => (
                <ExpoCard
                  key={expo.id}
                  expo={expo}
                  onApply={e => {
                    if (!boothGroupId) {
                      toast.warning('กรุณาสร้างหรือเข้าร่วมบูธก่อน');
                      return;
                    }
                    setApplyTarget(e);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  onClick={() => loadExpos(page - 1, searchRef.current, categoryRef.current)}
                  disabled={page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => loadExpos(p, searchRef.current, categoryRef.current)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                      p === page
                        ? 'text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    style={p === page ? { background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` } : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => loadExpos(page + 1, searchRef.current, categoryRef.current)}
                  disabled={page >= totalPages}
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

      {/* ── Modals ──────────────────────────────────────────── */}
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