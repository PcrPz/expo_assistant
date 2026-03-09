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
const ZONE_COLORS = ['#3674B5','#5B9BD6','#82B4E0','#A8CDEB','#6BAED4','#3A8CC4','#2E6FA3'];
const GENDER_COLORS: Record<string, string> = { female: '#A78BCA', male: '#3674B5', other: '#94A3B8' };
const GENDER_TH:     Record<string, string> = { female: 'หญิง', male: 'ชาย', other: 'อื่นๆ' };
const RATING_COLORS = ['#CBD5E1','#93B4D4','#5B9BD6','#3674B5','#2C5F99'];

// ─── Props ────────────────────────────────────────────────────
interface DashboardTabProps {
  eventId: string;
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
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-gray-400">ยังไม่มีข้อมูล</p>
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
  const opacity = rank === 1 ? 1 : rank === 2 ? 0.75 : rank === 3 ? 0.55 : 0.35;
  return (
    <div className="flex items-center gap-3 py-1">
      {/* Badge วงกลม */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
        style={{ backgroundColor: `rgba(54,116,181,${opacity * 0.12})`, color: `rgba(54,116,181,${opacity})` }}>
        {rank}
      </div>
      {/* ชื่อบูธ */}
      <span className="w-14 text-sm font-bold text-gray-900 flex-shrink-0">{boothNo}</span>
      {/* Bar */}
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: BLUE2, opacity: 0.6 + opacity * 0.4 }}/>
      </div>
      {/* ตัวเลข */}
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
export function DashboardTab({ eventId }: DashboardTabProps) {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalQuestion, setModalQuestion] = useState<{ key: string; title: string } | null>(null);
  const [filterGender,   setFilterGender]   = useState<string>('all');
  const [filterAge,      setFilterAge]      = useState<string>('all');

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

  // visit-hour → AreaChart
  const visitHourChart = useMemo<VisitHourChartPoint[]>(() =>
    (data?.visitHour ?? []).map(v => ({
      hour: v.hour.slice(11, 16),   // "09:00"
      visitors: v.visitorCount,
    }))
  , [data]);

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
  const genderChart = useMemo<GenderChartPoint[]>(() =>
    (data?.visitGender ?? []).map(g => ({
      name:  GENDER_TH[g.gender] ?? g.gender,
      value: g.visitorCount,
      color: GENDER_COLORS[g.gender] ?? '#9CA3AF',
    }))
  , [data]);

  // age → BarChart
  const ageChart = useMemo<AgeChartPoint[]>(() =>
    (data?.visitAge ?? []).map(a => ({
      ageGroup: a.ageGroup,
      visitors: a.visitorCount,
    }))
  , [data]);

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
    <div className="space-y-5">

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
      <Section title="ผู้เข้าชมรายชั่วโมง"  empty={visitHourChart.length === 0}>
        {visitHourChart.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={visitHourChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVisit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BLUE} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} padding={{ left: 16, right: 16 }}/>
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} label={{ value: 'จำนวน (คน)', angle: -90, position: 'insideLeft', offset: 20, style: { fontSize: 10, fill: '#9CA3AF' } }}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="visitors" name="ผู้เข้าชม" stroke={BLUE} strokeWidth={2.5}
                fill="url(#gradVisit)"
                dot={{ r: 4, fill: BLUE, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: BLUE, stroke: 'white', strokeWidth: 2 }}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ══ Section 3: Demographic ═══════════════════════════ */}
      <div className="grid grid-cols-2 gap-5">

        {/* Gender Donut */}
        <Section title="เพศผู้เข้าชม"  empty={genderChart.length === 0}>
          {genderChart.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={200}>
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
                  <div className="flex justify-center gap-3 mt-2">
                    {genderChart.map((g, i) => (
                      <div key={i} className="flex-1 rounded-xl px-3 py-2.5 text-center border border-gray-100"
                        style={{ backgroundColor: g.color + '12' }}>
                        <p className="text-[11px] font-semibold mb-1" style={{ color: g.color }}>{g.name}</p>
                        <p className="text-base font-black text-gray-900">{g.value.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {total > 0 ? Math.round((g.value / total) * 100) : 0}%
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
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
                <Bar dataKey="visitors" name="ผู้เข้าชม" fill={BLUE2} radius={[0,6,6,0]}/>
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
              <LineChart data={zoneHourChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }}/>
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false}/>
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