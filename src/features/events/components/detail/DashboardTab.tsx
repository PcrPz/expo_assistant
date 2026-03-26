// src/features/events/components/detail/DashboardTab.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LabelList,
} from 'recharts';
import { getDashboardData } from '../../api/dashboardApi';
import type {
  DashboardData, ZoneHourChartPoint, FormAvg,
  VisitHourChartPoint, GenderChartPoint, AgeChartPoint,
} from '../../types/dashboard.types';
import type { EventRole } from '../../types/event.types';

// ─── Palette ──────────────────────────────────────────────────
const BLUE   = '#3674B5';
const BLUE2  = '#498AC3';
const BL     = '#EBF3FC';
// โทนซีด เข้ากับธีมฟ้า
const ZONE_COLORS = ['#93C5FD','#86EFAC','#FDE68A','#C4B5FD','#F9A8D4','#6EE7B7','#FCA5A5'];
const GENDER_COLORS: Record<string, string> = { female: '#F9A8D4', male: '#93C5FD', other: '#CBD5E1' };
const GENDER_TH:     Record<string, string> = { female: 'หญิง', male: 'ชาย', other: 'ไม่ระบุ' };
const RATING_COLORS = ['#FCA5A5','#FCD34D','#86EFAC','#6EE7B7','#93C5FD'];

// ─── Props ────────────────────────────────────────────────────
interface DashboardTabProps {
  eventId: string;
  eventTitle?: string;
  role?: EventRole;
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

// Custom Tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const displayLabel = typeof label === 'string' ? label.replace(' Zone', '') : label;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 text-xs min-w-[120px]">
      {displayLabel && <p className="font-bold text-gray-600 mb-1.5 text-center">{displayLabel}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}/>
          <span className="text-gray-500 truncate">{p.name}:</span>
          <span className="font-bold text-gray-900">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// Stat Card
function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// Section wrapper
function Section({ title, sub, children, empty }: { title: string; sub?: string; children?: React.ReactNode; empty?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-black text-gray-900 text-sm">{title}</h3>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {empty ? (
        <div className="flex flex-col items-center justify-center gap-2.5 py-10">
          <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">ยังไม่มีข้อมูล</p>
            <p className="text-xs text-gray-400 mt-0.5">ข้อมูลจะแสดงเมื่อมีผู้เข้าชม</p>
          </div>
        </div>
      ) : (
        <div className="p-5">{children}</div>
      )}
    </div>
  );
}

// Top Booth Row
function BoothRankRow({ rank, boothNo, value, max, label }: { rank: number; boothNo: string; value: number; max: number; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const badgeBg    = rank === 1 ? '#FEF3C7' : '#F3F4F6';
  const badgeColor = rank === 1 ? '#92400E' : '#4B5563';
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{ backgroundColor: badgeBg, color: badgeColor }}>
        {rank}
      </div>
      <span className="w-14 text-sm font-bold text-gray-900 flex-shrink-0">{boothNo}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#93C5FD' }}/>
      </div>
      <div className="flex-shrink-0 text-right w-24">
        <span className="text-sm font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</span>
        <span className="text-xs text-gray-400 ml-1">{label}</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export function DashboardTab({ eventId, eventTitle = 'Dashboard' }: DashboardTabProps) {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalQuestion, setModalQuestion] = useState<{ key: string; title: string } | null>(null);
  const [filterGender,   setFilterGender]   = useState<string>('all');
  const [filterAge,      setFilterAge]      = useState<string>('all');
  const [downloading, setDownloading] = useState<'' | 'excel' | 'pdf'>('');

  const handleExcelDownload = async () => {
    if (downloading) return;
    setDownloading('excel');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/expo-dashboard/${eventId}/export-excel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dashboard_${eventTitle}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel export error:', e);
    } finally {
      setDownloading('');
    }
  };

  const handlePDFDownload = async () => {
    if (downloading) return;
    setDownloading('pdf');
    try {
      const { exportDashboardPDF } = await import('@/src/lib/export/exportDashboard');
      await exportDashboardPDF('expo-dashboard-content', eventTitle);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setDownloading('');
    }
  };

  useEffect(() => {
    getDashboardData(eventId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [eventId]);

  // ── Derived data ────────────────────────────────────────────
  const ticketPaid = useMemo(() => data?.ticketCount.find(t => t.status === 'paid')?.ticketCount ?? 0, [data]);
  const ticketUsed = useMemo(() => data?.ticketCount.find(t => t.status === 'used')?.ticketCount ?? 0, [data]);
  const attendRate = useMemo(() => ticketPaid > 0 ? Math.round((ticketUsed / ticketPaid) * 100) : 0, [ticketPaid, ticketUsed]);
  const totalVisitors = useMemo(() => (data?.visitGender ?? []).reduce((s, g) => s + g.visitorCount, 0), [data]);

  // visit-hour → แยกเป็น { date → AreaChart points[] }
  const visitHourByDay = useMemo<Record<string, VisitHourChartPoint[]>>(() => {
    const raw = data?.visitHour ?? [];
    const grouped: Record<string, VisitHourChartPoint[]> = {};
    raw.forEach(v => {
      const date = v.hour.slice(0, 10);   // "2026-02-17"
      const hour = v.hour.slice(11, 16);  // "09:00"
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ hour, visitors: v.visitorCount });
    });
    // sort each day by hour
    Object.values(grouped).forEach(arr => arr.sort((a, b) => a.hour.localeCompare(b.hour)));
    return grouped;
  }, [data]);

  const visitHourDays = useMemo(() => Object.keys(visitHourByDay).sort(), [visitHourByDay]);

  const [selectedHourDay, setSelectedHourDay] = useState<string>('');
  // auto-select first day when data loads
  useEffect(() => {
    if (visitHourDays.length > 0 && !visitHourDays.includes(selectedHourDay)) {
      setSelectedHourDay(visitHourDays[0]);
    }
  }, [visitHourDays]);

  const visitHourChart = useMemo<VisitHourChartPoint[]>(
    () => visitHourByDay[selectedHourDay] ?? [],
    [visitHourByDay, selectedHourDay],
  );

  // zone-hour → pivot → LineChart (dynamic zones)
  const { zoneHourChart, zoneNames } = useMemo(() => {
    const raw = data?.zoneHour ?? [];
    if (!raw.length) return { zoneHourChart: [], zoneNames: [] };

    const names = [...new Set(raw.map(r => r.zoneName))];
    const hours  = [...new Set(raw.map(r => r.hour))].sort();

    const chart: ZoneHourChartPoint[] = hours.map(h => {
      const point: ZoneHourChartPoint = { hour: h.slice(11, 16) };
      names.forEach(n => { point[n] = 0; });
      raw.filter(r => r.hour === h).forEach(r => { point[r.zoneName] = r.visitorCount; });
      return point;
    });

    return { zoneHourChart: chart, zoneNames: names };
  }, [data]);

  // gender → PieChart
  const genderChart = useMemo<GenderChartPoint[]>(() => {
    const map: Record<string, number> = {};
    (data?.visitGender ?? []).forEach(g => {
      map[g.gender] = (map[g.gender] ?? 0) + g.visitorCount;
    });
    return Object.entries(map).map(([gender, value]) => ({
      name:  GENDER_TH[gender] ?? gender,
      value,
      color: GENDER_COLORS[gender] ?? '#9CA3AF',
    }));
  }, [data]);

  // age → BarChart
  const ageChart = useMemo<AgeChartPoint[]>(() => {
    const map: Record<string, number> = {};
    (data?.visitAge ?? []).forEach(a => {
      map[a.ageGroup] = (map[a.ageGroup] ?? 0) + a.visitorCount;
    });
    const order = ['<18', '18-25', '26-40', '41-60', '>60'];
    return order
      .filter(g => map[g] !== undefined)
      .map(g => ({ ageGroup: g, visitors: map[g] }));
  }, [data]);

  // formRating → stacked BarChart (rating_1..5 จาก real API)
  const formRatingChart = useMemo(() =>
    (data?.formRating ?? []).map(f => ({
      name: f.questionTitle.length > 20 ? f.questionTitle.slice(0, 20) + '…' : f.questionTitle,
      '1': f.rating1, '2': f.rating2, '3': f.rating3, '4': f.rating4, '5': f.rating5,
    }))
  , [data]);

  // formAvg จาก API — map by title เพื่อ lookup ง่าย
  const formAvgMap = useMemo(() => {
    const map: Record<string, FormAvg> = {};
    (data?.formAvg ?? []).forEach(f => { map[f.title] = f; });
    return map;
  }, [data]);

  // text questions — กรอง q_type ที่ไม่ใช่ตัวเลข (rating จะตอบเป็น "1"-"5")
  const textQuestions = useMemo(() => {
    if (!data?.formResponse) return [] as [string, string][];
    const responses = data.formResponse.responses;
    return Object.entries(data.formResponse.questions)
      .filter(([key]) => {
        // หา sample ที่ตอบคำถามนี้
        const sample = responses.find(r => r[key] !== undefined && r[key] !== '');
        if (!sample) return false;
        const val = sample[key];
        // ถ้าค่าเป็น "1"-"5" เท่านั้น = rating → ซ่อน (แสดงในกราฟแล้ว)
        return !(val >= '1' && val <= '5' && val.length === 1);
      });
  }, [data]);

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8" style={{ color: BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle className="opacity-25" cx="12" cy="12" r="10"/>
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400 text-sm">ไม่สามารถโหลดข้อมูลได้</p>
    </div>
  );

  const maxBoothVisit     = data.topBooth[0]?.visitorCount ?? 1;
  const maxBoothDownload  = data.topBoothDownload[0]?.downloadCount ?? 1;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-5" id="expo-dashboard-content">
      {/* ── Header + Download ── */}
      <div className="flex items-center justify-between" data-no-print>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">ภาพรวมและสถิติของงาน</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExcelDownload}
            disabled={!!downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#3674B5] text-[#3674B5] text-sm font-semibold hover:bg-[#3674B5] hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading === 'excel' ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="8" y1="3" x2="8" y2="21"/>
                <line x1="16" y1="3" x2="16" y2="21"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
              </svg>
            )}
            {downloading === 'excel' ? 'กำลังสร้าง...' : 'ดาวน์โหลด Excel'}
          </button>
          <button
            onClick={handlePDFDownload}
            disabled={!!downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3674B5] text-white text-sm font-semibold hover:bg-[#2d5a8f] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading === 'pdf' ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <polyline points="9 15 12 18 15 15"/>
              </svg>
            )}
            {downloading === 'pdf' ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </button>
        </div>
      </div>
      
      {/* ══ Section 1: Stat Cards ═══════════════════════════ */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="ตั๋วที่ขายได้" value={ticketPaid} color={BLUE}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
        />
        <StatCard label="ผู้เข้าชมจริง" value={ticketUsed} color="#5B9BD6"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B9BD6" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="อัตราเข้าชม" value={`${attendRate}%`} sub={`${ticketUsed.toLocaleString()} / ${ticketPaid.toLocaleString()} คน`} color="#6BAED4"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6BAED4" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <StatCard label="ผู้เข้าชม (scan)" value={totalVisitors} color="#82B4E0"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#82B4E0" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
      </div>

      {/* ══ Section 2: ผู้เข้าชมรายชั่วโมง ══════════════════ */}
      {visitHourDays.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-base">ผู้เข้าชมรายชั่วโมง</h3>
              {/* Segmented Control */}
              <div className="flex mt-3 p-0.5 rounded-xl gap-0.5" style={{ backgroundColor: '#F1F5F9' }}>
                {visitHourDays.map(day => {
                  const active = day === selectedHourDay;
                  const label  = new Date(day).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedHourDay(day)}
                      className="px-4 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all"
                      style={{
                        fontWeight:  active ? 700 : 500,
                        color:       active ? BLUE : '#9CA3AF',
                        background:  active ? 'white' : 'transparent',
                        boxShadow:   active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            {visitHourChart.length > 0 && (
              <div className="text-right">
                <p className="text-2xl font-black tabular-nums" style={{ color: BLUE }}>
                  {visitHourChart.reduce((s, p) => s + p.visitors, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">คนรวมวันนี้</p>
              </div>
            )}
          </div>
          {/* Chart */}
          <div className="p-5">
            {visitHourChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
              <BarChart data={visitHourChart} margin={{ top: 5, right: 16, left: 8, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={36}/>
                <Tooltip content={<ChartTooltip />}/>
                <Bar dataKey="visitors" name="ผู้เข้าชม" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={32}/>
              </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-gray-400">ยังไม่มีข้อมูลวันนี้</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Section 3: Demographic ═══════════════════════════ */}
      <div className="grid grid-cols-2 gap-5">

        {/* Gender Donut */}
        <Section title="เพศผู้เข้าชม"  empty={genderChart.length === 0}>
          {genderChart.length > 0 && (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={genderChart} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {genderChart.map((g, i) => (
                      <Cell key={i} fill={g.color} stroke="white" strokeWidth={2}/>
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
              {(() => {
                const total = genderChart.reduce((s, g) => s + g.value, 0);
                return (
                  <div className="flex-1 space-y-3">
                    {genderChart.map((g, i) => {
                      const pct = total > 0 ? Math.round((g.value / total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-700">{g.name}</span>
                            <span className="text-sm font-black text-gray-900">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: g.color }}/>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{g.value.toLocaleString()} คน</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </Section>

        {/* Age Bar */}
        <Section title="อายุผู้เข้าชม"  empty={ageChart.length === 0}>
          {ageChart.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageChart} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="ageGroup" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={40}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="visitors" name="ผู้เข้าชม" fill="#93C5FD" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* ══ Section 4: Zone Performance ══════════════════════ */}
      <div className="grid grid-cols-2 gap-5">

        {/* Zone Rank */}
        <Section title="อันดับโซนยอดนิยม"  empty={data.zoneRank.length === 0}>
          {data.zoneRank.length > 0 && (
            <ResponsiveContainer width="100%" height={Math.max(180, data.zoneRank.length * 46)}>
              <BarChart data={data.zoneRank} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="zoneName" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={100}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="visitorCount" name="ผู้เข้าชม" radius={[0,6,6,0]}>
                  {data.zoneRank.map((_, i) => (
                    <Cell key={i} fill={ZONE_COLORS[i % ZONE_COLORS.length]}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        {/* Zone by Hour — dynamic lines */}
        <Section title="ผู้เข้าชมแต่ละโซนรายชั่วโมง"  empty={zoneHourChart.length === 0}>
          {zoneHourChart.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={zoneHourChart} margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }}/>
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={36}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                {/* Dynamic: สร้าง Line ตามจำนวน Zone จริง */}
                {zoneNames.map((name, i) => (
                  <Line key={name} type="monotone" dataKey={name}
                    stroke={ZONE_COLORS[i % ZONE_COLORS.length]} strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* ══ Section 5: Top Booths ════════════════════════════ */}
      <div className="grid grid-cols-2 gap-5">
        <Section title="5 อันดับบูธที่มีผู้เข้าชมมากสุด" empty={data.topBooth.length === 0}>
          {data.topBooth.length > 0 && (
            <div className="space-y-3">
              {data.topBooth.map((b, i) => (
                <BoothRankRow key={b.boothId} rank={i + 1} boothNo={b.boothNo}
                  value={b.visitorCount} max={maxBoothVisit} label="คน"/>
              ))}
            </div>
          )}
        </Section>

        <Section title="5 อันดับบูธที่โหลดเอกสารมากสุด" empty={data.topBoothDownload.length === 0}>
          {data.topBoothDownload.length > 0 && (
            <div className="space-y-3">
              {data.topBoothDownload.map((b, i) => (
                <div key={b.boothId} className="space-y-1">
                  <BoothRankRow rank={i + 1} boothNo={b.boothNo}
                    value={b.downloadCount} max={maxBoothDownload} label="ครั้ง"/>
                  <p className="text-[11px] text-gray-400 pl-9">
                    {b.uniqueDownloaders.toLocaleString()} คนที่ไม่ซ้ำกัน
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ══ Section 6: Rating Questions ══════════════════════ */}
      {data.formRating.length > 0 && (
        <Section title="ผลแบบสอบถามความพึงพอใจ">
          {/* Summary avg cards — ใช้ข้อมูลจาก /form-avg */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {data.formRating.map((f, i) => {
              const avgData = formAvgMap[f.questionTitle];
              const avg = avgData ? Math.round(avgData.averageRating * 10) / 10 : 0;
              const count = avgData?.responseCount ?? (f.rating1+f.rating2+f.rating3+f.rating4+f.rating5);
              const pct = (avg / 5) * 100;
              return (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">{f.questionTitle}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE2 }}/>
                    </div>
                    <span className="text-sm font-black text-gray-900 w-8 text-right">{avg}</span>
                    <span className="text-xs text-gray-400">/ 5</span>
                  </div>
                  {/* mini star row */}
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="text-[10px]" style={{ opacity: s <= Math.round(avg) ? 1 : 0.2 }}>★</span>
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">{count.toLocaleString()} คำตอบ</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stacked bar distribution */}
          <p className="text-xs text-gray-400 mb-3">การกระจายคะแนน</p>
          <ResponsiveContainer width="100%" height={Math.max(160, data.formRating.length * 48)}>
            <BarChart data={formRatingChart} layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false} tickLine={false} width={140}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Legend wrapperStyle={{ fontSize: 11 }}/>
              {['1','2','3','4','5'].map((r, i) => (
                <Bar key={r} dataKey={r} name={`★ ${r}`} stackId="a" fill={RATING_COLORS[i]}
                  radius={i === 4 ? [0,4,4,0] : [0,0,0,0]}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ══ Section 7: Text Questions ════════════════════════ */}
      {data.formResponse && textQuestions.length > 0 && (
        <Section title="ความคิดเห็นและข้อเสนอแนะ">
          <div className="space-y-3">
            {textQuestions.map(([key, title]) => {
              const answers = data.formResponse!.responses
                .map(r => ({ gender: r['gender'], ageGroup: r['age_group'], answer: r[key] }))
                .filter(r => r.answer && r.answer.trim() !== '');
              return (
                <div key={key} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{answers.length} คำตอบ</p>
                    </div>
                    <button
                      onClick={() => { setModalQuestion({ key, title }); setFilterGender('all'); setFilterAge('all'); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
                      style={{ color: BLUE, borderColor: BLUE + '40', backgroundColor: BLUE + '08' }}>
                      ดูทั้งหมด →
                    </button>
                  </div>
                  {/* Preview 3 คำตอบแรก */}
                  <div className="space-y-2">
                    {answers.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0 mt-0.5">
                          {GENDER_TH[r.gender] ?? r.gender} · {r.ageGroup}
                        </span>
                        <p className="text-xs text-gray-700 line-clamp-1">{r.answer}</p>
                      </div>
                    ))}
                    {answers.length > 3 && (
                      <p className="text-[11px] text-gray-400 pl-0.5">+{answers.length - 3} คำตอบเพิ่มเติม</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ══ Modal: Text Answers with Filter ═══════════════════ */}
      {modalQuestion && data.formResponse && (() => {
        const allAnswers = data.formResponse.responses
          .map(r => ({ gender: r['gender'], ageGroup: r['age_group'], answer: r[modalQuestion.key] }))
          .filter(r => r.answer && r.answer.trim() !== '');

        const filtered = allAnswers.filter(r =>
          (filterGender === 'all' || r.gender === filterGender) &&
          (filterAge    === 'all' || r.ageGroup === filterAge)
        );

        const genders  = ['all', ...Array.from(new Set(allAnswers.map(r => r.gender)))];
        const ageGroups = ['all', ...[  '<18','18-25','26-40','41-60','>60']
          .filter(a => allAnswers.some(r => r.ageGroup === a))];

        const FilterBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
          <button onClick={onClick}
            className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: active ? BLUE : 'transparent',
              color: active ? '#fff' : '#6B7280',
              border: active ? `1px solid ${BLUE}` : '1px solid #E5E7EB',
            }}>
            {label}
          </button>
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setModalQuestion(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">{modalQuestion.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {filtered.length === allAnswers.length
                        ? `${allAnswers.length} คำตอบ`
                        : `${filtered.length} / ${allAnswers.length} คำตอบ`}
                    </p>
                  </div>
                  <button onClick={() => setModalQuestion(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition flex-shrink-0">
                    ✕
                  </button>
                </div>

                {/* Filter: เพศ */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[11px] text-gray-400 mr-1">เพศ</span>
                  {genders.map(g => (
                    <FilterBtn key={g} active={filterGender === g}
                      onClick={() => setFilterGender(g)}
                      label={g === 'all' ? 'ทั้งหมด' : (GENDER_TH[g] ?? g)}/>
                  ))}
                </div>

                {/* Filter: อายุ */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-400 mr-1">อายุ</span>
                  {ageGroups.map(a => (
                    <FilterBtn key={a} active={filterAge === a}
                      onClick={() => setFilterAge(a)}
                      label={a === 'all' ? 'ทั้งหมด' : a}/>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto p-5 space-y-2 flex-1">
                {filtered.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">ไม่มีคำตอบในกลุ่มนี้</p>
                ) : (
                  filtered.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: BLUE + '15', color: BLUE }}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-800 leading-relaxed">{r.answer}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {GENDER_TH[r.gender] ?? r.gender} · {r.ageGroup}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}