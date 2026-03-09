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

interface BoothTabProps {
  expoId: string;
  role: EventRole;
}

// ── Type config ─────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  small_booth: {
    label: 'บูธเล็ก',
    color: '#3674B5',
    bg: '#EBF3FC',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  big_booth: {
    label: 'บูธใหญ่',
    color: '#2563AB',
    bg: '#DBEAFE',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  stage: {
    label: 'เวที',
    color: '#6366F1',
    bg: '#EEF2FF',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
  },
  booth: {
    label: 'บูธ',
    color: '#3674B5',
    bg: '#EBF3FC',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
};

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  available:   { label: 'ว่าง',          dot: '#22C55E' },
  unavailable: { label: 'ไม่เปิดรับ',     dot: '#9CA3AF' },
  pending:     { label: 'รอชำระเงิน',    dot: '#F59E0B' },
  reserved:    { label: 'จองแล้ว',       dot: '#EF4444' },
};

// ── Main Component ───────────────────────────────────────────────
export function BoothTab({ expoId, role }: BoothTabProps) {
  const router = useRouter();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [myBoothGroupId, setMyBoothGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const canCreate = role === 'owner' || role === 'admin' || role === 'system_admin';

  useEffect(() => { loadBooths(); }, [expoId]);

  const loadBooths = async () => {
    try {
      setIsLoading(true);
      const allBooths = await getBoothsByExpoId(expoId);
      setBooths(allBooths);

      // ✅ ระบบใหม่: ดึง booth_group_id ของ user เพื่อใช้เทียบ
      if (role === 'booth_staff') {
        const { booth: myGroup } = await getMyBoothGlobal();
        setMyBoothGroupId(myGroup?.id ?? null);
      }
    } catch (error) {
      console.error('Failed to load booths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooths = booths.filter(booth => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (booth.booth_no || '').toLowerCase().includes(q) ||
      (booth.title || '').toLowerCase().includes(q) ||
      (booth.company || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || booth.type === selectedType;
    return matchesSearch && matchesType;
  });

  // ✅ เช็คจาก booth_group_id แทน booth_id set เดิม
  const isMyBooth = (b: Booth) =>
    role === 'booth_staff' && !!myBoothGroupId && b.booth_group_id === myBoothGroupId;

  const myBooths   = role === 'booth_staff' ? filteredBooths.filter(b => isMyBooth(b))  : [];
  const otherBooths = role === 'booth_staff' ? filteredBooths.filter(b => !isMyBooth(b)) : filteredBooths;

  // stats
  const stats = {
    total: booths.length,
    available: booths.filter(b => b.status === 'available').length,
    reserved: booths.filter(b => b.status === 'reserved').length,
    pending: booths.filter(b => b.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-[#3674B5] rounded-full animate-spin mx-auto" style={{ borderWidth: 3 }}/>
          <p className="text-sm text-gray-400">กำลังโหลดบูธ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Stats Bar (เฉพาะ organizer) ── */}
      {canCreate && booths.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex divide-x divide-gray-100 overflow-hidden">
          {[
            { label: 'ทั้งหมด', value: stats.total,     color: '#3674B5' },
            { label: 'ว่าง',    value: stats.available,  color: '#16A34A' },
            { label: 'รอชำระ',  value: stats.pending,    color: '#D97706' },
            { label: 'จองแล้ว', value: stats.reserved,   color: '#DC2626' },
          ].map((s) => (
            <div key={s.label} className="flex-1 flex flex-col items-center pt-5 pb-4 gap-1.5 relative">
              <span className="text-3xl font-black" style={{ color: s.color }}>{s.value}</span>
              <span className="text-sm text-gray-400 font-medium">{s.label}</span>
              <div className="absolute bottom-0 left-6 right-6 h-[3px] rounded-t-full" style={{ backgroundColor: s.color }}/>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Search */}
        <div className="relative w-60">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาบูธ..."
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition bg-white"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
          {[
            { value: 'all', label: 'ทั้งหมด' },
            { value: 'small_booth', label: 'บูธเล็ก' },
            { value: 'big_booth', label: 'บูธใหญ่' },
            { value: 'stage', label: 'เวที' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedType(opt.value)}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedType === opt.value
                  ? 'bg-white text-[#3674B5] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#3674B5]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-[#3674B5]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Create — ชิดขวา */}
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm hover:shadow-md hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            สร้างบูธ
          </button>
        )}
      </div>

      {/* ── Empty ── */}
      {filteredBooths.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">ไม่พบบูธ</p>
          <p className="text-sm text-gray-400 mb-5">
            {searchQuery || selectedType !== 'all' ? 'ลองเปลี่ยนเงื่อนไขการค้นหา' : canCreate ? 'เริ่มต้นด้วยการสร้างบูธแรก' : 'ยังไม่มีบูธในงานนี้'}
          </p>
          {canCreate && !searchQuery && selectedType === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
            >
              สร้างบูธแรก
            </button>
          )}
        </div>
      )}

      {/* ── Booth Staff: My Booths ── */}
      {role === 'booth_staff' && myBooths.length > 0 && (
        <Section
          title="บูธของฉัน"
          count={myBooths.length}
          accentColor="#3674B5"
          booths={myBooths}
          viewMode={viewMode}
          isMyBooth
          onClickBooth={(id) => router.push(`/events/${expoId}/booths/${id}`)}
        />
      )}

      {/* ── All Booths / Other Booths ── */}
      {otherBooths.length > 0 && (
        <Section
          title={role === 'booth_staff' ? 'บูธอื่นๆ' : 'บูธทั้งหมด'}
          count={otherBooths.length}
          accentColor="#3674B5"
          booths={otherBooths}
          viewMode={viewMode}
          isMyBooth={false}
          onClickBooth={(id) => router.push(`/events/${expoId}/booths/${id}`)}
        />
      )}

      {showCreateModal && (
        <CreateBoothModal expoId={expoId} onClose={() => setShowCreateModal(false)} onSuccess={loadBooths} />
      )}
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────
function Section({
  title, count, booths, viewMode, isMyBooth, onClickBooth,
}: {
  title: string; count: number; accentColor: string;
  booths: Booth[]; viewMode: 'grid' | 'list'; isMyBooth: boolean;
  onClickBooth: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
        <span className="px-2 py-0.5 bg-[#EBF3FC] text-[#3674B5] text-xs font-bold rounded-full">{count}</span>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {booths.map((booth) => (
            <BoothCard key={booth.booth_id} booth={booth} isMyBooth={isMyBooth} viewMode="grid" onClick={() => onClickBooth(booth.booth_id)} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {booths.map((booth) => (
            <BoothCard key={booth.booth_id} booth={booth} isMyBooth={isMyBooth} viewMode="list" onClick={() => onClickBooth(booth.booth_id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booth Card ───────────────────────────────────────────────────
function BoothCard({ booth, isMyBooth, viewMode, onClick }: {
  booth: Booth; isMyBooth: boolean; viewMode: 'grid' | 'list'; onClick: () => void;
}) {
  const cfg = TYPE_CONFIG[booth.type] || TYPE_CONFIG.small_booth;
  const statusCfg = STATUS_CONFIG[booth.status] || STATUS_CONFIG.available;
  const thumbnailUrl = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;
  const displayName = booth.title?.trim() ? booth.title : booth.booth_no;
  const isNameFromTitle = !!booth.title?.trim();

  // ── LIST MODE ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-3 hover:border-[#3674B5]/40 hover:shadow-md transition-all cursor-pointer"
      >
        {/* Thumbnail / Placeholder */}
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {booth.type === 'stage' ? (
                  <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>
                ) : booth.type === 'big_booth' ? (
                  <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
                ) : (
                  <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-gray-900 text-sm truncate group-hover:text-[#3674B5] transition">{displayName}</p>
            {isNameFromTitle && (
              <span className="flex-shrink-0 text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">{booth.booth_no}</span>
            )}
            {isMyBooth && (
              <span className="flex-shrink-0 px-1.5 py-0.5 bg-[#3674B5] text-white text-[10px] font-bold rounded-md">ของฉัน</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1" style={{ color: cfg.color }}>
              {cfg.icon}{cfg.label}
            </span>
            {booth.hall && <span>{booth.hall}</span>}
            {booth.zone_name && (
              <span className="flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {booth.zone_name}
              </span>
            )}
          </div>
        </div>

        {/* Right: status + price */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }}/>
            <span className="text-xs text-gray-500">{statusCfg.label}</span>
          </div>
          {booth.price && Number(booth.price) > 0 && (
            <span className="text-xs font-bold text-gray-700">
              ฿{Number(booth.price).toLocaleString()}
            </span>
          )}
          <svg className="text-gray-300 group-hover:text-[#3674B5] transition" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    );
  }

  // ── GRID MODE ────────────────────────────────────────────────
  return (
    <div
      onClick={onClick}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#3674B5]/40 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Image area */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative" style={{ backgroundColor: cfg.bg }}>
            {/* Subtle grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-${booth.booth_id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke={cfg.color} strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${booth.booth_id})`}/>
            </svg>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {booth.type === 'stage' ? (
                    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>
                  ) : booth.type === 'big_booth' ? (
                    <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>
                  ) : (
                    <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
                  )}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Overlay gradient ที่มีรูป */}
        {thumbnailUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>}

        {/* Badges บน image */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm" style={{ backgroundColor: `${cfg.color}CC`, color: 'white' }}>
            {cfg.icon}{cfg.label}
          </span>
        </div>
        {isMyBooth && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-1 bg-white/90 text-[#3674B5] text-[10px] font-bold rounded-lg shadow backdrop-blur-sm">ของฉัน</span>
          </div>
        )}

        {/* Status dot ล่างซ้ายของรูป */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.dot }}/>
          <span className="text-[10px] font-semibold text-gray-700">{statusCfg.label}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Name */}
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[#3674B5] transition line-clamp-1">{displayName}</p>
          {isNameFromTitle && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{booth.booth_no}</p>
          )}
        </div>

        {/* Meta */}
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
            <span className="text-sm font-bold text-[#3674B5]">฿{Number(booth.price).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}