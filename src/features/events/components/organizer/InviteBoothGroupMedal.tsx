// src/features/events/components/organizer/InviteBoothGroupMedal.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAvailableBooths, inviteBoothGroupToExpo } from '@/src/features/booths/api/boothGlobalApi';
import type { AvailableBooth } from '@/src/features/booths/types/boothGlobal.types';

interface InviteBoothGroupModalProps {
  boothGroup: { ID: string; Title: string; Company: string; };
  expoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const BOOTH_TYPE_LABEL: Record<string, string> = {
  small_booth: 'บูธเล็ก',
  big_booth:   'บูธใหญ่',
  stage:       'เวที',
};

const BOOTH_TYPE_BADGE: Record<string, string> = {
  small_booth: 'bg-blue-50 text-blue-700 border-blue-200',
  big_booth:   'bg-purple-50 text-purple-700 border-purple-200',
  stage:       'bg-orange-50 text-orange-700 border-orange-200',
};

type SortKey = 'boothNo' | 'price_asc' | 'price_desc';

function formatPrice(price: number) {
  return new Intl.NumberFormat('th-TH').format(price);
}

export function InviteBoothGroupModal({ boothGroup, expoId, onClose, onSuccess }: InviteBoothGroupModalProps) {
  const [booths, setBooths]           = useState<AvailableBooth[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedBoothId, setSelectedBoothId] = useState('');
  const [detail, setDetail]           = useState('');
  const [inviting, setInviting]       = useState(false);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState('');
  const [typeFilter, setTypeFilter]   = useState<string>('all');
  const [sort, setSort]               = useState<SortKey>('boothNo');

  useEffect(() => { loadBooths(); }, []);

  const loadBooths = async () => {
    setLoading(true);
    try { setBooths(await getAvailableBooths(expoId)); }
    catch (err) { console.error('Failed to load booths:', err); }
    finally { setLoading(false); }
  };

  // ─── Filter + Sort ────────────────────────────────────────
  const types = useMemo(() => Array.from(new Set(booths.map(b => b.type))), [booths]);

  const countByType = useMemo(() => {
    const m: Record<string, number> = { all: booths.length };
    booths.forEach(b => { m[b.type] = (m[b.type] || 0) + 1; });
    return m;
  }, [booths]);

  const filtered = useMemo(() => {
    let list = typeFilter === 'all' ? booths : booths.filter(b => b.type === typeFilter);
    if (sort === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'boothNo')    list = [...list].sort((a, b) => a.boothNo.localeCompare(b.boothNo, 'th', { numeric: true }));
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
    } finally { setInviting(false); }
  };

  const selectedBoothData = booths.find(b => b.boothId === selectedBoothId);

  // ─── Success ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ส่งคำเชิญสำเร็จ!</h3>
          <p className="text-gray-500 text-sm mb-6">
            ส่งคำเชิญไปยัง <span className="font-semibold text-gray-700">{boothGroup.Title}</span> แล้ว<br/>
            รอการตอบรับจากทางบูธ
          </p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">
              ปิด
            </button>
            <button onClick={onSuccess}
              className="flex-1 px-4 py-2.5 bg-[#3674B5] text-white font-semibold rounded-xl hover:bg-[#2d5a8f] transition text-sm">
              ดูรายการเชิญ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Modal ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header — เหมือนเดิม */}
        <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white mb-1">เชิญเข้าร่วมงาน</h2>
              <div className="flex items-center gap-2">
                <p className="text-blue-100 text-sm font-medium truncate">{boothGroup.Title}</p>
                <span className="text-blue-300 text-xs">•</span>
                <p className="text-blue-200 text-xs truncate">{boothGroup.Company}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="ml-3 p-1.5 hover:bg-white/20 rounded-lg transition flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin w-6 h-6 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Section label + count */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-900">
                  เลือกบูธที่ว่าง <span className="text-red-500">*</span>
                </label>
                {booths.length > 0 && (
                  <span className="text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {booths.length} บูธว่าง
                  </span>
                )}
              </div>

              {booths.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-400 text-sm">ไม่มีบูธว่างในงานนี้</p>
                </div>
              ) : (
                <>
                  {/* ── Filter + Sort bar — เพิ่มใหม่ ── */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 space-y-2.5">
                    {/* Type chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[{ key: 'all', label: 'ทั้งหมด' }, ...types.map(t => ({ key: t, label: BOOTH_TYPE_LABEL[t] || t }))].map(({ key, label }) => (
                        <button key={key}
                          onClick={() => { setTypeFilter(key); setSelectedBoothId(''); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            typeFilter === key
                              ? 'bg-[#3674B5] text-white shadow-sm'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                          }`}>
                          {label}
                          <span className={`text-[10px] font-bold px-1 py-0.5 rounded-full ${
                            typeFilter === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {countByType[key] || 0}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Sort row */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">เรียงตาม</span>
                      {([
                        { key: 'boothNo',    label: 'หมายเลข' },
                        { key: 'price_asc',  label: 'ราคา ↑' },
                        { key: 'price_desc', label: 'ราคา ↓' },
                      ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
                        <button key={key}
                          onClick={() => setSort(key)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                            sort === key
                              ? 'bg-gray-800 text-white'
                              : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                          }`}>
                          {label}
                        </button>
                      ))}
                      <span className="ml-auto text-[11px] text-gray-400">{filtered.length} รายการ</span>
                    </div>
                  </div>

                  {/* Booth list — card style เหมือนเดิม */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-400 text-sm">ไม่มีบูธประเภทนี้</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filtered.map(booth => (
                        <button key={booth.boothId}
                          onClick={() => { setSelectedBoothId(booth.boothId); setError(''); }}
                          className={`w-full text-left rounded-xl border-2 transition-all overflow-hidden ${
                            selectedBoothId === booth.boothId
                              ? 'border-[#3674B5] shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>

                          {/* Row 1 — เหมือนเดิม */}
                          <div className={`px-4 py-2.5 flex items-center justify-between ${
                            selectedBoothId === booth.boothId ? 'bg-blue-50' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedBoothId === booth.boothId
                                  ? 'border-[#3674B5] bg-[#3674B5]'
                                  : 'border-gray-400'
                              }`}>
                                {selectedBoothId === booth.boothId && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </div>
                              <span className="font-bold text-gray-900 text-lg">{booth.boothNo}</span>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              BOOTH_TYPE_BADGE[booth.type] || 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {BOOTH_TYPE_LABEL[booth.type] || booth.type}
                            </span>
                          </div>

                          {/* Row 2 — เหมือนเดิม */}
                          <div className="px-4 py-3 grid grid-cols-3 gap-3 text-sm bg-white">
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">โซน</p>
                              <p className="text-gray-900 font-semibold">{booth.zoneName}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-0.5">ห้อง</p>
                              <p className="text-gray-900 font-semibold">{booth.hall || '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-400 text-xs mb-0.5">ราคา</p>
                              <p className="text-[#3674B5] font-bold">฿{formatPrice(booth.price)}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Detail textarea — เหมือนเดิม */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  ข้อความเพิ่มเติม
                  <span className="ml-1 text-gray-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <textarea
                  value={detail} onChange={e => setDetail(e.target.value)}
                  placeholder="ระบุข้อความที่ต้องการส่งไปพร้อมคำเชิญ"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3674B5] focus:ring-1 focus:ring-[#3674B5] transition resize-none"
                />
              </div>

              {/* Summary — เหมือนเดิม */}
              {selectedBoothData && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#3674B5] rounded-xl overflow-hidden">
                  <div className="bg-[#3674B5] px-4 py-2.5 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p className="text-sm font-bold text-white">บูธที่เลือก</p>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">บูธ</p>
                      <p className="font-bold text-gray-900 text-base">{selectedBoothData.boothNo}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">ประเภท</p>
                      <p className="font-semibold text-gray-900 text-sm">{BOOTH_TYPE_LABEL[selectedBoothData.type] || selectedBoothData.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">โซน</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedBoothData.zoneName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">ห้อง</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedBoothData.hall || '—'}</p>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-[#3674B5]/20">
                      <p className="text-gray-400 text-xs mb-0.5">ราคา</p>
                      <p className="text-[#3674B5] font-bold text-2xl">฿{formatPrice(selectedBoothData.price)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — เหมือนเดิม */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-2 flex-shrink-0">
          <button onClick={onClose} disabled={inviting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handleInvite} disabled={!selectedBoothId || inviting}
            className="flex-1 px-4 py-2.5 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {inviting ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>กำลังส่ง...</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>ส่งคำเชิญ</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}