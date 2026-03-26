// src/features/events/components/organizer/InviteBoothGroupMedal.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getAvailableBooths, getBoothUnavailability, inviteBoothGroupToExpo } from '@/src/features/booths/api/boothGlobalApi';
import type { AvailableBooth } from '@/src/features/booths/types/boothGlobal.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

interface InviteBoothGroupModalProps {
  boothGroup: { ID: string; Title: string; Company: string; };
  expoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const BOOTH_TYPE_LABEL: Record<string, string> = {
  booth: 'บูธ',
  stage:       'เวที',
};

type SortKey = 'boothNo' | 'price_asc' | 'price_desc';

function formatPrice(price: number) {
  return new Intl.NumberFormat('th-TH').format(price);
}

// ─── Status config ────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'available') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-[#EEF4FB] text-[#1D4E89] border border-[#B8D0EA]">
      <span className="w-[5px] h-[5px] rounded-full bg-[#3674B5] flex-shrink-0" />
      ว่าง
    </span>
  );
  if (status === 'unavailable') return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
      <span className="w-[5px] h-[5px] rounded-full bg-amber-400 flex-shrink-0" />
      เชิญเท่านั้น
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-[5px] h-[5px] rounded-full bg-gray-400 flex-shrink-0" />
      จองแล้ว
    </span>
  );
}

function MapPreview({ mapUrl }: { mapUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initScale, setInitScale] = useState<number | null>(null);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;
    const scaleX = container.clientWidth / img.naturalWidth;
    const scaleY = 170 / img.naturalHeight;
    setInitScale(Math.min(scaleX, scaleY) * 1.2);
  };

  return (
    <div ref={containerRef} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '170px' }}>
      {initScale === null ? (
        // โหลดรูปเพื่อวัดขนาดก่อน ยังไม่แสดง TransformWrapper
        <img
          src={getMinioFileUrl(mapUrl) ?? undefined}
          alt=""
          onLoad={handleLoad}
          style={{ visibility: 'hidden', position: 'absolute' }}
        />
      ) : (
        <TransformWrapper key={initScale} initialScale={initScale} minScale={0.1} maxScale={4} centerOnInit>
          {({ zoomIn, zoomOut }) => (
            <div className="relative w-full h-full">
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <img
                  src={getMinioFileUrl(mapUrl) ?? undefined}
                  alt="แผนผังงาน"
                  style={{ display: 'block' }}
                />
              </TransformComponent>
              <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                <button onClick={() => zoomIn()} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold shadow-sm hover:bg-gray-50 text-base">+</button>
                <button onClick={() => zoomOut()} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 font-bold shadow-sm hover:bg-gray-50 text-base">−</button>
              </div>
            </div>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}
// ══════════════════════════════════════════════════════════════
// Main Modal
// ══════════════════════════════════════════════════════════════

export function InviteBoothGroupModal({
  boothGroup,
  expoId,
  onClose,
  onSuccess,
}: InviteBoothGroupModalProps) {
  const [booths,            setBooths]            = useState<AvailableBooth[]>([]);
  const [mapUrl,            setMapUrl]            = useState<string | null>(null);
  const [showMapFullscreen, setShowMapFullscreen] = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [selectedBoothId, setSelectedBoothId] = useState('');
  const [detail,          setDetail]          = useState('');
  const [inviting,        setInviting]        = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [error,           setError]           = useState('');
  const [typeFilter,      setTypeFilter]      = useState<string>('all');
  const [sort,            setSort]            = useState<SortKey>('boothNo');

  useEffect(() => { loadBooths(); }, []);

  const loadBooths = async () => {
    setLoading(true);
    try {
      // API ใหม่ — ดึงทุกบูธ, filter status เอง
      const { expo_map, booths } = await getBoothUnavailability(expoId);
      setMapUrl(expo_map);
      setBooths(booths);
    } catch (err) {
      console.error('Failed to load booths:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Selectable booths: available + unavailable (เชิญเท่านั้น) ─
  const selectableBooths = useMemo(
    () => booths.filter(b => b.status === 'available' || b.status === 'unavailable'),
    [booths]
  );

  // ─── Type options from selectable booths only ────────────────
  const types = useMemo(
    () => Array.from(new Set(selectableBooths.map(b => b.type))),
    [selectableBooths]
  );

  const countByType = useMemo(() => {
    const m: Record<string, number> = { all: selectableBooths.length };
    selectableBooths.forEach(b => { m[b.type] = (m[b.type] || 0) + 1; });
    return m;
  }, [selectableBooths]);

  // ─── Status counts ───────────────────────────────────────────
  const countAvailable   = booths.filter(b => b.status === 'available').length;
  const countUnavailable = booths.filter(b => b.status === 'unavailable').length;
  const countReserved    = booths.filter(b => b.status === 'reserved').length;

  // ─── Filtered + sorted ───────────────────────────────────────
  const filtered = useMemo(() => {
    // แสดงทุก booth ใน table (reserved ด้วย เพื่อให้เห็นภาพรวม)
    let list = typeFilter === 'all' ? booths : booths.filter(b => b.type === typeFilter);
    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'boothNo')    list = [...list].sort((a, b) =>
      a.boothNo.localeCompare(b.boothNo, 'th', { numeric: true })
    );
    return list;
  }, [booths, typeFilter, sort]);

  const handleInvite = async () => {
    if (!selectedBoothId) { setError('กรุณาเลือกบูธก่อน'); return; }
    setError('');
    setInviting(true);
    try {
      await inviteBoothGroupToExpo(expoId, selectedBoothId, boothGroup.ID, detail || undefined);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setInviting(false); }
  };

  // ─── Success state ────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-[18px] font-black text-gray-900 mb-2">ส่งคำเชิญสำเร็จ!</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              ส่งคำเชิญไปยัง <span className="font-semibold text-gray-800">{boothGroup.Title}</span> แล้ว<br/>
              รอการตอบรับจากทางบูธ
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition"
              >
                ปิด
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 py-2.5 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
              >
                ดูรายการเชิญ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main modal ───────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BL }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-black text-gray-900">เชิญเข้าร่วมออกบูธ</h3>
            <p className="text-[12px] text-gray-400 mt-0.5 truncate">
              {boothGroup.Title} · {boothGroup.Company}
            </p>
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
        {/* ── แผนผังงาน ──────────────────────────────── */}
        {mapUrl && (
          <div className="px-5 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[14px] font-bold text-gray-700">แผนผังงาน</p>
              <button
                onClick={() => setShowMapFullscreen(true)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>
            </div>
            <MapPreview mapUrl={mapUrl} />
          </div>
        )}
        {/* ── Section label ──────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <p className="text-[14px] font-bold text-gray-700">เลือกบูธ</p>
          {!loading && (
            <div className="flex gap-1.5 flex-wrap justify-end">
              {countAvailable > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FB] text-[#1D4E89] border border-[#B8D0EA]">
                  ว่าง {countAvailable}
                </span>
              )}
              {countUnavailable > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  เชิญเท่านั้น {countUnavailable}
                </span>
              )}
              {countReserved > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  จองแล้ว {countReserved}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Filter + Sort bar ───────────────────────────── */}
        {!loading && booths.length > 0 && (
          <div className="px-5 pb-2 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-3 flex-wrap">
              {/* Type filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[{ key: 'all', label: 'ทั้งหมด' }, ...types.map(t => ({ key: t, label: BOOTH_TYPE_LABEL[t] || t }))].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setTypeFilter(key); setSelectedBoothId(''); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      typeFilter === key
                        ? 'text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                    style={typeFilter === key ? { background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` } : undefined}
                  >
                    {label}
                    <span className={`ml-1 text-[10px] font-bold ${typeFilter === key ? 'opacity-70' : 'text-gray-400'}`}>
                      {countByType[key] || 0}
                    </span>
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400">เรียง</span>
                {([
                  { key: 'boothNo',    label: 'หมายเลข' },
                  { key: 'price_asc',  label: 'ราคา ↑' },
                  { key: 'price_desc', label: 'ราคา ↓' },
                ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                      sort === key
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Scrollable booth table ──────────────────────── */}
        <div className="overflow-y-auto flex-shrink-0 border-t border-gray-100" style={{ maxHeight: '260px' }}>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-gray-400">ไม่มีบูธในประเภทนี้</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="sticky top-0 z-10">
                  <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 py-2.5 bg-gray-50 border-b border-gray-100">บูธ</th>
                  <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 bg-gray-50 border-b border-gray-100">ประเภท / ที่ตั้ง</th>
                  <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide px-3 py-2.5 bg-gray-50 border-b border-gray-100">สถานะ</th>
                  <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide px-5 py-2.5 bg-gray-50 border-b border-gray-100">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(booth => {
                  const isSelectable = booth.status === 'available' || booth.status === 'unavailable';
                  const isSelected   = selectedBoothId === booth.boothId;
                  return (
                    <tr
                      key={booth.boothId}
                      onClick={() => isSelectable && setSelectedBoothId(booth.boothId)}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${
                        !isSelectable
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#EEF4FB] cursor-pointer'
                          : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-[17px] h-[17px] rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                              isSelected ? 'border-[#3674B5] bg-[#3674B5]' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-[5px] h-[5px] rounded-full bg-white" />}
                          </div>
                          <span className="text-[13px] font-bold text-gray-900">{booth.boothNo}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-[12px] text-gray-500">
                          {BOOTH_TYPE_LABEL[booth.type] || booth.type}
                          {booth.hall     ? ` · ${booth.hall}` : ''}
                          {booth.zoneName ? ` · ${booth.zoneName}` : ''}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={booth.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-[13px] font-bold" style={{ color: isSelectable ? BLUE : '#9CA3AF' }}>
                          {booth.price > 0 ? `${formatPrice(booth.price)} ฿` : 'ฟรี'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Textarea + error ───────────────────────────── */}
        <div className="px-5 pt-3 pb-4 flex-shrink-0 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2 pb-1">
            <p className="text-[14px] font-bold text-gray-700">ข้อความถึงบูธ</p>
            <span className="text-[11px] text-gray-400">(ไม่บังคับ)</span>
          </div>
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="ระบุข้อความที่ต้องการส่งไปพร้อมคำเชิญ..."
            rows={2}
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
            disabled={inviting}
            className="flex-1 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleInvite}
            disabled={!selectedBoothId || inviting}
            className="flex-1 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
          >
            {inviting ? (
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
                  <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                ส่งคำเชิญ
              </>
            )}
          </button>
        </div>
      </div>
      {/* Fullscreen modal */}
      {showMapFullscreen && mapUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center p-4"
          onClick={() => setShowMapFullscreen(false)}
        >
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-bold">แผนผังงาน</p>
              <button
                onClick={() => setShowMapFullscreen(false)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black" style={{ height: '70vh' }}>
              <TransformWrapper>
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <div className="relative w-full h-full">
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                      <img
                        src={getMinioFileUrl(mapUrl) ?? undefined}
                        alt="แผนผังงาน"
                        className="w-full h-full object-contain"
                      />
                    </TransformComponent>
                    <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                      <button onClick={() => zoomIn()} className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-base hover:bg-white/25">+</button>
                      <button onClick={() => zoomOut()} className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white font-bold text-base hover:bg-white/25">−</button>
                      <button onClick={() => resetTransform()} className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}