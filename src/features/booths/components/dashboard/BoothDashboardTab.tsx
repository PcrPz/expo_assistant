// src/features/booths/components/dashboard/BoothDashboardTab.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { getBoothDashboardData } from '../../api/boothDashboardApi';
import type {
  BoothDashboardData,
  BoothHourlyChartPoint,
  BoothDailyChartPoint,
  BoothGenderChartPoint,
  BoothAgeChartPoint,
} from '../../types/boothDashboard.types';

// ─── Palette — ใช้ธีมฟ้าของเว็บทั้งหมด ────────────────────────
const BLUE          = '#3674B5';
const BLUE2         = '#498AC3';
const BL            = '#EBF3FC';
// เพศ — ใช้โทนฟ้าเหมือน Event Dashboard
const GENDER_COLORS: Record<string, string> = { female: '#F9A8D4', male: '#93C5FD', other: '#CBD5E1' };
const GENDER_TH:    Record<string, string>  = { female: 'หญิง', male: 'ชาย', other: 'ไม่ระบุ' };
// Rating — gradient ฟ้าเข้มไปอ่อน
const RATING_COLORS = ['#FCA5A5', '#FCD34D', '#86EFAC', '#6EE7B7', '#93C5FD'];
// Daily chart — 4 เส้น โทนฟ้าทั้งหมด เข้ม/อ่อน/กลาง/จาง
const DAILY_COLORS = {
  attendance: '#93C5FD',
  queue:      '#86EFAC',
  download:   '#FDE68A',
  locate:     '#C4B5FD',
};

const STAT_COLORS = {
  total:      '#3674B5',
  attendance: '#2E6FA3',
  queue:      '#498AC3',
  download:   '#82B4E0',
};

// ─── Props ────────────────────────────────────────────────────
interface BoothDashboardTabProps {
  expoId: string;
  boothId: string;
  boothTitle?: string;
}

// ══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2.5 text-xs min-w-[130px]">
      {label && <p className="font-bold text-gray-600 mb-1.5 text-center">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 truncate">{p.name}:</span>
          <span className="font-bold text-gray-900">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '18' }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({
  title, sub, children, empty,
}: {
  title: string; sub?: string; children?: React.ReactNode; empty?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <div className="px-6 py-[18px] border-b border-gray-50">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
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
        <div className="p-6">{children}</div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export function BoothDashboardTab({ expoId, boothId, boothTitle = 'Dashboard' }: BoothDashboardTabProps) {
  const [data,    setData]    = useState<BoothDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'' | 'excel' | 'pdf'>('');

  const handleExcelDownload = async () => {
    if (downloading) return;
    setDownloading('excel');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/booth-dashboard/${expoId}/${boothId}/export-excel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dashboard_${boothTitle}.xlsx`;
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
      await exportDashboardPDF('booth-dashboard-content', boothTitle);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setDownloading('');
    }
  };
  const [modalQuestion, setModalQuestion] = useState<{ key: string; title: string } | null>(null);
  const [filterGender,  setFilterGender]  = useState<string>('all');
  const [filterAge,     setFilterAge]     = useState<string>('all');

  useEffect(() => {
    getBoothDashboardData(expoId, boothId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [expoId, boothId]);

  // ── Derived: stat totals ──────────────────────────────────
  const totalAttendance = useMemo(
    () => (data?.attendance ?? []).reduce((s, d) => s + d.totalUsers, 0), [data]
  );
  const totalQueue = useMemo(
    () => (data?.queue ?? []).reduce((s, d) => s + d.totalUsers, 0), [data]
  );
  const totalDownload = useMemo(
    () => (data?.download ?? []).reduce((s, d) => s + d.totalUsers, 0), [data]
  );
  const totalLocate = useMemo(
    () => (data?.locate ?? []).reduce((s, d) => s + d.totalUsers, 0), [data]
  );

  // ── Derived: hourly area chart — แยกตามวัน ───────────────
  const hourlyByDay = useMemo<Record<string, BoothHourlyChartPoint[]>>(() => {
    const raw = data?.hourly ?? [];
    const grouped: Record<string, BoothHourlyChartPoint[]> = {};
    raw.forEach(h => {
      const date = h.date;                  // "2026-02-15" (Date field)
      const hour = h.hour.slice(11, 16);    // "09:00"
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ hour, visitors: h.totalUsers });
    });
    Object.values(grouped).forEach(arr => arr.sort((a, b) => a.hour.localeCompare(b.hour)));
    return grouped;
  }, [data]);

  const hourlyDays = useMemo(() => Object.keys(hourlyByDay).sort(), [hourlyByDay]);

  const [selectedHourDay, setSelectedHourDay] = useState<string>('');
  useEffect(() => {
    if (hourlyDays.length > 0 && !hourlyDays.includes(selectedHourDay)) {
      setSelectedHourDay(hourlyDays[0]);
    }
  }, [hourlyDays]);

  const hourlyChart = useMemo<BoothHourlyChartPoint[]>(
    () => hourlyByDay[selectedHourDay] ?? [],
    [hourlyByDay, selectedHourDay],
  );

  // ── Derived: gender donut ─────────────────────────────────
  const genderChart = useMemo<BoothGenderChartPoint[]>(() =>
    (data?.gender ?? []).map(g => ({
      name:  GENDER_TH[g.gender] ?? g.gender,
      value: g.totalUsers,
      color: GENDER_COLORS[g.gender] ?? '#9CA3AF',
    }))
  , [data]);

  // ── Derived: age h-bar ────────────────────────────────────
  const ageChart = useMemo<BoothAgeChartPoint[]>(() =>
    (data?.age ?? []).map(a => ({ ageRange: a.ageRange, visitors: a.totalUsers }))
  , [data]);

  // ── Derived: daily multi-line ─────────────────────────────
  const dailyChart = useMemo<BoothDailyChartPoint[]>(() => {
    // รวบทุก date ที่มี
    const allDates = [...new Set([
      ...(data?.attendance ?? []).map(d => d.date),
      ...(data?.queue      ?? []).map(d => d.date),
      ...(data?.download   ?? []).map(d => d.date),
      ...(data?.locate     ?? []).map(d => d.date),
    ])].sort();

    const toMap = (arr: { date: string; totalUsers: number }[]) =>
      Object.fromEntries(arr.map(d => [d.date, d.totalUsers]));

    const atMap = toMap(data?.attendance ?? []);
    const quMap = toMap(data?.queue      ?? []);
    const dlMap = toMap(data?.download   ?? []);
    const lcMap = toMap(data?.locate     ?? []);

    return allDates.map(date => ({
      date:       date.slice(5),    // "02-15"
      attendance: atMap[date] ?? 0,
      queue:      quMap[date] ?? 0,
      download:   dlMap[date] ?? 0,
      locate:     lcMap[date] ?? 0,
    }));
  }, [data]);

  // ── Derived: form rating stacked bar ─────────────────────
  const formRatingChart = useMemo(() =>
    (data?.formRating ?? []).map(r => ({
      name: r.questionTitle,
      '1': r.rating1, '2': r.rating2, '3': r.rating3,
      '4': r.rating4, '5': r.rating5,
    }))
  , [data]);

  // ── Derived: text questions ───────────────────────────────
  // คำถามที่ไม่ใช่ rating (ค่าตอบไม่ใช่ "1"-"5")
  const textQuestions = useMemo(() => {
    if (!data?.formResponse) return [];
    const { questions, responses } = data.formResponse;
    return Object.entries(questions).filter(([key]) => {
      const sample = responses[0]?.[key] ?? '';
      return !['1','2','3','4','5'].includes(sample.trim());
    });
  }, [data]);

  // ─────────────────────────────────────────────────────────
  if (loading) return <LoadingState />;
  if (!data)   return (
    <div className="text-center py-16 text-sm text-gray-400">โหลดข้อมูลไม่สำเร็จ</div>
  );

  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5" id="booth-dashboard-content">

      {/* ── Header + Download ── */}
      <div className="flex items-center justify-between" data-no-print>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">ภาพรวมและสถิติของบูธ</p>
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

      {/* ══ Section 1: Stat Cards ════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Interactions ทั้งหมด" value={data.total.totalUsers} color={BLUE}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-7 1-4 7z"/>
            </svg>
          }
        />
        <StatCard label="เข้าชมบูธ" value={totalAttendance} color={STAT_COLORS.attendance}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STAT_COLORS.attendance} strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          }
        />
        <StatCard label="ต่อคิว" value={totalQueue} color={STAT_COLORS.queue}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STAT_COLORS.queue} strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <StatCard label="โหลดเอกสาร" value={totalDownload} color={STAT_COLORS.download}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STAT_COLORS.download} strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          }
        />
      </div>

      {/* ══ Section 2: Gender + Age ══════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender Donut */}
        <Section title="ผู้เข้าชมแบ่งตามเพศ" empty={genderChart.length === 0}>
          {genderChart.length > 0 && (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={genderChart} cx="50%" cy="50%" innerRadius={48} outerRadius={75}
                    dataKey="value" paddingAngle={3}>
                    {genderChart.map((g, i) => <Cell key={i} fill={g.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {genderChart.map((g, i) => {
                  const total = genderChart.reduce((s, x) => s + x.value, 0);
                  const pct   = total > 0 ? Math.round((g.value / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700">{g.name}</span>
                        <span className="text-sm font-bold text-gray-900">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{g.value.toLocaleString()} คน</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Section>

        {/* Age HBar */}
        <Section title="ผู้เข้าชมแบ่งตามช่วงอายุ" empty={ageChart.length === 0}>
          {ageChart.length > 0 && (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ageChart} layout="vertical"
                margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="ageRange" tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="visitors" name="คน" fill="#93C5FD" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>
      </div>

      {/* ══ Section 3: Hourly Area Chart ═════════════════════ */}
      {hourlyDays.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">ผู้เข้าชมรายชั่วโมง</h3>
              {/* Segmented Control */}
              <div className="flex mt-3 p-0.5 rounded-xl gap-0.5" style={{ backgroundColor: '#F1F5F9' }}>
                {hourlyDays.map(day => {
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
            {hourlyChart.length > 0 && (
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums" style={{ color: BLUE }}>
                  {hourlyChart.reduce((s, p) => s + p.visitors, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">คนรวมวันนี้</p>
              </div>
            )}
          </div>
          {/* Chart */}
          <div className="px-6 pb-6">
            {hourlyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyChart} margin={{ top: 4, right: 16, left: 8, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="visitors" name="คน" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={32} />
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

      {/* ══ Section 4: Daily Multi-Line ══════════════════════ */}
      {dailyChart.length > 0 && (
        <Section title="กิจกรรมรายวัน" sub="เปรียบเทียบการเข้าชม / คิว / โหลดเอกสาร / BLE">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyChart} margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} padding={{ left: 30, right: 30 }} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line type="linear"dataKey="attendance" name="เข้าชม"
                stroke={DAILY_COLORS.attendance} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="linear" dataKey="queue" name="คิว"
                stroke={DAILY_COLORS.queue}      strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="linear" dataKey="download" name="โหลดเอกสาร"
                stroke={DAILY_COLORS.download}   strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="linear" dataKey="locate" name="BLE"
                stroke={DAILY_COLORS.locate}     strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend คำอธิบาย */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-50">
            {[
              { color: DAILY_COLORS.attendance, label: 'เข้าชมบูธ',   sub: 'scan ticket เข้าบูธ' },
              { color: DAILY_COLORS.queue,      label: 'ต่อคิว',       sub: 'join queue' },
              { color: DAILY_COLORS.download,   label: 'โหลดเอกสาร',  sub: 'download doc' },
              { color: DAILY_COLORS.locate,     label: 'BLE',          sub: 'ผ่านมาใกล้บูธ' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
                <span className="text-xs text-gray-400">— {item.sub}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ══ Section 5: Form Rating ════════════════════════════ */}
      {(data.formAvg.length > 0 || formRatingChart.length > 0) && (
        <Section title="แบบสอบถามความพึงพอใจ">

          {/* Rating Avg Cards */}
          {data.formAvg.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {data.formAvg.map((item) => {
                const avg   = item.averageRating;
                const count = item.responseCount;
                const pct   = (avg / 5) * 100;
                return (
                  <div key={item.responseId} className="rounded-xl p-3 text-center"
                    style={{ backgroundColor: BL }}>
                    <p className="text-2xl font-bold" style={{ color: BLUE }}>
                      {avg.toFixed(1)}
                    </p>
                    <p className="text-xs font-bold text-gray-700 mt-1 line-clamp-2 leading-tight">
                      {item.title}
                    </p>
                    <div className="h-1.5 bg-white rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#93C5FD' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{count.toLocaleString()} คำตอบ</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stacked Bar Distribution */}
          {formRatingChart.length > 0 && (
            <>
              <p className="text-sm font-semibold text-gray-500 mb-3">การกระจายคะแนน</p>
              <ResponsiveContainer width="100%" height={Math.max(160, formRatingChart.length * 52)}>
                <BarChart data={formRatingChart} layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }}
                    axisLine={false} tickLine={false} width={155} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {['1','2','3','4','5'].map((r, i) => (
                    <Bar key={r} dataKey={r} name={`★ ${r}`} stackId="a" fill={RATING_COLORS[i]}
                      radius={i === 4 ? [0,4,4,0] : [0,0,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Section>
      )}

      {/* ══ Section 6: Text Answers ═══════════════════════════ */}
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
                      <p className="text-[11px] text-gray-400">+{answers.length - 3} คำตอบเพิ่มเติม</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ══ Modal: Text Answers ═══════════════════════════════ */}
      {modalQuestion && data.formResponse && (() => {
        const allAnswers = data.formResponse.responses
          .map(r => ({ gender: r['gender'], ageGroup: r['age_group'], answer: r[modalQuestion.key] }))
          .filter(r => r.answer && r.answer.trim() !== '');

        const filtered = allAnswers.filter(r =>
          (filterGender === 'all' || r.gender === filterGender) &&
          (filterAge    === 'all' || r.ageGroup === filterAge)
        );

        const genders   = ['all', ...Array.from(new Set(allAnswers.map(r => r.gender)))];
        const ageGroups = ['all', ...['13-19','20-39','40-59','>59']
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

              <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{modalQuestion.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {filtered.length === allAnswers.length
                        ? `${allAnswers.length} คำตอบ`
                        : `${filtered.length} / ${allAnswers.length} คำตอบ`}
                    </p>
                  </div>
                  <button onClick={() => setModalQuestion(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[11px] text-gray-400 mr-1">เพศ</span>
                  {genders.map(g => (
                    <FilterBtn key={g} active={filterGender === g}
                      onClick={() => setFilterGender(g)}
                      label={g === 'all' ? 'ทั้งหมด' : (GENDER_TH[g] ?? g)} />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-400 mr-1">อายุ</span>
                  {ageGroups.map(a => (
                    <FilterBtn key={a} active={filterAge === a}
                      onClick={() => setFilterAge(a)}
                      label={a === 'all' ? 'ทั้งหมด' : a} />
                  ))}
                </div>
              </div>

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