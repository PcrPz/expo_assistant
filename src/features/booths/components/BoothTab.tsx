// src/features/booths/components/BoothTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBoothsByExpoId } from '../api/boothApi';
import { getMyBoothGlobal } from '../api/boothGlobalApi';
import { CreateBoothModal } from './CreateBoothModal';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Booth } from '../types/booth.types';
import type { EventRole } from '@/src/features/events/types/event.types';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

interface BoothTabProps {
  expoId: string;
  role: EventRole;
  onBoothChange?: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  stage: {
    label: 'เวที', color: '#6366F1', bg: '#EEF2FF',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  },
  booth: {
    label: 'บูธ', color: '#3674B5', bg: '#EBF3FC',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  available:   { label: 'ว่าง',          dot: '#22C55E', bg: '#ECFDF5', text: '#065F46' },
  unavailable: { label: 'เชิญเท่านั้น', dot: '#9CA3AF', bg: '#F3F4F6', text: '#374151' },
  pending:     { label: 'รอชำระเงิน',   dot: '#F59E0B', bg: '#FEF9EC', text: '#92400E' },
  reserved:    { label: 'จองแล้ว',      dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
};

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export function BoothTab({ expoId, role, onBoothChange }: BoothTabProps) {
  const router = useRouter();
  const [booths,         setBooths]         = useState<Booth[]>([]);
  const [myBoothGroupId, setMyBoothGroupId] = useState<string | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [selectedType,   setSelectedType]   = useState('all');
  const [viewMode,       setViewMode]       = useState<'grid' | 'list'>('grid');

  const canCreate  = role === 'owner' || role === 'admin' || role === 'system_admin';
  const isBoothStaff = role === 'booth_staff';

  useEffect(() => { loadBooths(); }, [expoId]);

  const loadBooths = async () => {
    try {
      setIsLoading(true);
      const allBooths = await getBoothsByExpoId(expoId);
      setBooths(allBooths);
      if (isBoothStaff) {
        const { booth: myGroup } = await getMyBoothGlobal();
        setMyBoothGroupId(myGroup?.id ?? null);
      }
    } catch (error) {
      console.error('Failed to load booths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMyBooth = (b: Booth) =>
    isBoothStaff && !!myBoothGroupId && b.booth_group_id === myBoothGroupId;

  // บูธของฉัน (booth_staff เท่านั้น) — ไม่ filter search/type
  const myBoothsList = isBoothStaff ? booths.filter(b => isMyBooth(b)) : [];

  // filtered for grid
  const filteredBooths = booths.filter(booth => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (booth.booth_no || '').toLowerCase().includes(q) ||
      (booth.title    || '').toLowerCase().includes(q) ||
      (booth.company  || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || booth.type === selectedType;
    return matchesSearch && matchesType;
  });

  // booth_staff — ไม่แสดงบูธของฉันใน grid เพราะมี hero card แล้ว
  const sortedBooths = isBoothStaff
    ? filteredBooths.filter(b => !isMyBooth(b))
    : filteredBooths;

  const stats = {
    total:     booths.length,
    available: booths.filter(b => b.status === 'available').length,
    unavailable: booths.filter(b => b.status === 'unavailable').length,
    pending:   booths.filter(b => b.status === 'pending').length,
    reserved:  booths.filter(b => b.status === 'reserved').length,
  };

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin mx-auto"/>
          <p className="text-sm text-gray-400">กำลังโหลดบูธ...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">

      {/* ── Hero card — บูธของฉัน (booth_staff only) ─────── */}
      {isBoothStaff && myBoothsList.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{ height: '160px', background: 'linear-gradient(135deg, #498AC3 0%, #5B9BD5 50%, #749BC2 100%)' }}
        >
          {/* overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 60%)' }} />

          {/* Content */}
          <div className="absolute inset-0 flex items-center gap-[18px] px-6">

            {/* Thumbnail + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-[76px] h-[76px] rounded-[14px] overflow-hidden flex items-center justify-center"
                style={{ border: '2.5px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.22)' }}
              >
                {myBoothsList[0].thumbnail ? (
                  <img
                    src={getMinioFileUrl(myBoothsList[0].thumbnail) ?? undefined}
                    alt={myBoothsList[0].booth_no}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
                    {myBoothsList[0].type === 'stage'
                      ? <><polygon points="12 2 2 7..."/><polyline points="2 17..."/><polyline points="2 12..."/></>
                      : <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
                    }
                  </svg>
                )}
              </div>
              <p className="text-[12px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.85)' }}>
                บูธของฉัน
              </p>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[21px] font-black text-white leading-tight mb-1 truncate">
                {myBoothsList[0].title?.trim() || myBoothsList[0].booth_no}
              </p>
              <p className="text-[13px] mb-2.5" style={{ color: 'rgba(255,255,255,0.85)' }}>
                บูธ {myBoothsList[0].booth_no}
                {myBoothsList[0].hall ? ` · ${myBoothsList[0].hall}` : ''}
                {' · '}{(TYPE_CONFIG[myBoothsList[0].type] || TYPE_CONFIG.booth).label}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {myBoothsList[0].hall && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    {myBoothsList[0].hall}
                  </span>
                )}
                {myBoothsList[0].zone_name && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white"
                    style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {myBoothsList[0].zone_name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-2.5 flex-shrink-0">
              {myBoothsList[0].status && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-white"
                  style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)' }}>
                  <span className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_CONFIG[myBoothsList[0].status]?.dot || '#9CA3AF' }} />
                  {STATUS_CONFIG[myBoothsList[0].status]?.label || myBoothsList[0].status}
                </div>
              )}
              <button
                onClick={() => router.push(`/events/${expoId}/booths/${myBoothsList[0].booth_id}`)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white rounded-xl text-[13px] font-black hover:bg-blue-50 transition"
                style={{ color: BLUE }}
              >
                จัดการบูธ
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Organizer header ────────────────────────────────── */}
      {!isBoothStaff && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">จัดการบูธในงาน</h2>
            <p className="text-sm text-gray-400 mt-0.5">รายการบูธทั้งหมดภายในงาน</p>
          </div>
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        {/* Stat pills — organizer only */}
        {canCreate && booths.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-3.5">
              {[
                { label: 'ทั้งหมด',      value: stats.total,       color: BLUE      },
                { label: 'ว่าง',         value: stats.available,   color: '#16A34A' },
                { label: 'เชิญเท่านั้น', value: stats.unavailable, color: '#6B7280' }, // ← เพิ่ม
                { label: 'รอชำระ',       value: stats.pending,     color: '#D97706' },
                { label: 'จองแล้ว',      value: stats.reserved,    color: '#DC2626' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                  <span className="text-base font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs font-semibold text-gray-400">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mx-4"/>
          </>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 flex-wrap">
          {/* Search */}
          <div className="relative w-56">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาบูธ..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition bg-white"
            />
          </div>

          {/* Type filter */}
          <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
            {[
              { value: 'all',         label: 'ทั้งหมด' },
              { value: 'booth', label: 'บูธ' },
              { value: 'stage',       label: 'เวที' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedType === opt.value
                    ? 'bg-white text-[#3674B5] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#3674B5]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-[#3674B5]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Organizer buttons */}
          {canCreate && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => router.push(`/events/${expoId}/explore-booths`)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 border-[#3674B5] text-[#3674B5] hover:bg-[#3674B5] hover:text-white transition"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                สำรวจบูธ
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                สร้างบูธ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty ───────────────────────────────────────────── */}
      {sortedBooths.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">ไม่พบบูธ</p>
          <p className="text-sm text-gray-400 mb-5">
            {searchQuery || selectedType !== 'all'
              ? 'ลองเปลี่ยนเงื่อนไขการค้นหา'
              : canCreate ? 'เริ่มต้นด้วยการสร้างบูธแรก' : 'ยังไม่มีบูธในงานนี้'}
          </p>
          {canCreate && !searchQuery && selectedType === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              สร้างบูธแรก
            </button>
          )}
        </div>
      )}

      {/* ── Section label "บูธทั้งหมดในงาน" (booth_staff) ── */}
      {isBoothStaff && sortedBooths.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="ml-2 text-[13px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
            บูธอื่นๆทั้งหมดในงาน
          </span>
          <div className="flex-2 h-px bg-gray-200" />
          <span className="text-[13px] font-bold text-gray-400 whitespace-nowrap mr-3">{sortedBooths.length} บูธ</span>
        </div>
      )}

      {/* ── Booth grid / list ────────────────────────────── */}
      {sortedBooths.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
            {sortedBooths.map(booth => (
              <BoothCard
                key={booth.booth_id}
                booth={booth}
                isMyBooth={isMyBooth(booth)}
                viewMode="grid"
                onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedBooths.map(booth => (
              <BoothCard
                key={booth.booth_id}
                booth={booth}
                isMyBooth={isMyBooth(booth)}
                viewMode="list"
                onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
              />
            ))}
          </div>
        )
      )}

      {showCreateModal && (
        <CreateBoothModal expoId={expoId} onClose={() => setShowCreateModal(false)} onSuccess={() => { loadBooths(); onBoothChange?.(); }} />
      )}
    </div>
  );
}

// ── Booth Card ────────────────────────────────────────────────
function BoothCard({ booth, isMyBooth, viewMode, onClick }: {
  booth: Booth; isMyBooth: boolean; viewMode: 'grid' | 'list'; onClick: () => void;
}) {
  const cfg        = TYPE_CONFIG[booth.type] || TYPE_CONFIG.booth
  const statusCfg  = STATUS_CONFIG[booth.status] || STATUS_CONFIG.available;
  const thumbnailUrl  = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;
  const displayName   = booth.title?.trim() ? booth.title : booth.booth_no;
  const isNameFromTitle = !!booth.title?.trim();

  // ── LIST ───────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className={`group flex items-center gap-3 bg-white border rounded-xl px-4 py-3 hover:shadow-md transition-all cursor-pointer ${
          isMyBooth ? 'border-[#3674B5] bg-[#EEF4FB]' : 'border-gray-100 hover:border-[#3674B5]/40'
        }`}
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: isMyBooth ? '#3674B5' : cfg.bg }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isMyBooth ? 'white' : cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {booth.type === 'stage'
                  ? <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>
                  : <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#3674B5] transition">{displayName}</p>
            {isNameFromTitle && <span className="flex-shrink-0 text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{booth.booth_no}</span>}
            {isMyBooth && <span className="flex-shrink-0 px-1.5 py-0.5 bg-[#3674B5] text-white text-[10px] font-bold rounded-md">ของฉัน</span>}
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-400">
            <span className="flex items-center gap-1 font-semibold" style={{ color: cfg.color }}>{cfg.icon}{cfg.label}</span>
            {booth.zone_name && (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {booth.zone_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }}/>
            <span className="text-xs text-gray-500">{statusCfg.label}</span>
          </div>
          {booth.price && Number(booth.price) > 0 && (
            <span className="text-xs font-bold text-gray-700">฿{Number(booth.price).toLocaleString()}</span>
          )}
        </div>
        <svg className="text-gray-300 group-hover:text-[#3674B5] transition flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </div>
    );
  }

  // ── GRID ───────────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className={`group bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col ${
        isMyBooth ? 'border-[#3674B5] shadow-md' : 'border-gray-100 hover:border-[#3674B5]/40'
      }`}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative" style={{ backgroundColor: isMyBooth ? '#3674B5' : cfg.bg }}>
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-${booth.booth_id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isMyBooth ? 'white' : cfg.color} strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${booth.booth_id})`}/>
            </svg>
            <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: isMyBooth ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isMyBooth ? 'white' : cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {booth.type === 'stage'
                  ? <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>
                  : <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
              </svg>
            </div>
          </div>
        )}

        {thumbnailUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>}

        <div className="absolute top-2 left-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm" style={{ backgroundColor: `${cfg.color}CC`, color: 'white' }}>
            {cfg.icon}{cfg.label}
          </span>
        </div>

        {isMyBooth && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-white text-[#3674B5] text-[10px] font-bold rounded-lg shadow backdrop-blur-sm">ของฉัน</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }}/>
          <span className="text-[10px] font-semibold text-gray-700">{statusCfg.label}</span>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-2">
        <div>
          <p className="text-[13px] font-bold text-gray-900 leading-tight group-hover:text-[#3674B5] transition line-clamp-1">{displayName}</p>
          {isNameFromTitle && <p className="text-xs text-gray-400 font-mono mt-0.5">{booth.booth_no}</p>}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {booth.hall && (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                {booth.hall}
              </span>
            )}
            {booth.zone_name && (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {booth.zone_name}
              </span>
            )}
            {!booth.hall && !booth.zone_name && <span className="text-gray-300">—</span>}
          </div>
          {booth.price && Number(booth.price) > 0 && (
            <span className="text-[13px] font-bold text-[#3674B5]">฿{Number(booth.price).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}