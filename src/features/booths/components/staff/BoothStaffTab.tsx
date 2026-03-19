// src/features/booths/components/staff/BoothStaffTab.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBoothStaff } from "../../api/boothGlobalApi";
import type { BoothGlobalStaff } from "../../types/boothGlobal.types";
import type { EventRole } from '@/src/features/events/types/event.types';

interface BoothStaffTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
  boothGroupId: string | null;
}

export function BoothStaffTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
  boothGroupId,
}: BoothStaffTabProps) {
  const router = useRouter();
  const [staffList, setStaffList] = useState<BoothGlobalStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStaff = async () => {
    if (!boothGroupId) {
      setStaffList([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getBoothStaff(boothGroupId);
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, [boothGroupId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return staffList;
    const q = search.toLowerCase();
    return staffList.filter(s =>
      (s.firstname || '').toLowerCase().includes(q) ||
      (s.lastname  || '').toLowerCase().includes(q) ||
      (s.email     || '').toLowerCase().includes(q) ||
      (s.role      || '').toLowerCase().includes(q)
    );
  }, [staffList, search]);

  const getInitials = (firstname: string, lastname: string) => {
    const f = (firstname || '').charAt(0).toUpperCase();
    const l = (lastname  || '').charAt(0).toUpperCase();
    return (f + l) || '??';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'owner') return 'owner';
    if (role === 'staff') return 'booth_staff';
    return role || 'booth_staff';
  };

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Tab header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">ทีมงาน</h2>
          <p className="text-sm text-gray-400 mt-0.5">รายชื่อทีมงานที่ดูแลบูธนี้</p>
        </div>
        {isAssignedStaff && (
          <button
            onClick={() => router.push('/booths/staff')}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            จัดการทีมงาน
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* ไม่มี booth_group — บูธยังว่าง */}
      {!boothGroupId ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">บูธนี้ยังไม่มีทีมงาน</p>
          <p className="text-xs text-gray-400 mt-1">บูธยังไม่ได้ถูกจองโดย Booth Group</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">

          {/* Search bar */}
          <div className="px-5 py-4 border-b border-[#F0F4F8]">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาจากชื่อ, อีเมล หรือบทบาท..."
                className="w-full pl-9 pr-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-[#FAFBFC]"
              />
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_160px_140px] px-5 py-3 bg-[#FAFBFC] border-b border-[#F0F4F8]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.05em]">ชื่อ</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.05em]">บทบาท</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.05em]">สถานะ</span>
          </div>

          {/* Empty */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                {search ? 'ไม่พบทีมงานที่ค้นหา' : 'ยังไม่มีทีมงาน'}
              </p>
              {!search && isAssignedStaff && (
                <button
                  onClick={() => router.push('/booths/staff')}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
                >
                  ไปหน้า Booth Group
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#F8FAFC]">
              {filtered.map((member) => (
                <div
                  key={member.userId}
                  className="grid grid-cols-[1fr_160px_140px] items-center px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors"
                >
                  {/* Avatar + name + email */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: '#3674B5', color: 'white' }}
                    >
                      {getInitials(member.firstname, member.lastname)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {[member.firstname, member.lastname].filter(Boolean).join(' ') || '(ไม่ระบุชื่อ)'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{member.email || '—'}</p>
                    </div>
                  </div>

                  {/* Role badge */}
                  <div>
                    <span className="inline-flex px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-gray-600 bg-white">
                      {getRoleLabel(member.role)}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      member.status === 'accepted'
                        ? 'bg-green-50 text-green-700'
                        : member.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        member.status === 'accepted' ? 'bg-green-500'
                        : member.status === 'pending' ? 'bg-yellow-500'
                        : 'bg-gray-400'
                      }`} />
                      {member.status === 'accepted' ? 'ยืนยันแล้ว'
                        : member.status === 'pending' ? 'รอยืนยัน'
                        : member.status || 'ไม่ทราบ'}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}