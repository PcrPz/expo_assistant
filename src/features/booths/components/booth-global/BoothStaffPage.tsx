// src/features/booths/components/booth-global/BoothStaffPage.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getMyBoothGlobal, 
  getBoothStaff, 
  inviteBoothStaff, 
  createBoothInviteCode, 
  removeBoothStaff 
} from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGlobalStaff } from '@/src/features/booths/types/boothGlobal.types';

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function BoothStaffPage() {
  const router = useRouter();
  
  const [boothId, setBoothId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [staff, setStaff] = useState<BoothGlobalStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ Search state
  
  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // States
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [creatingCode, setCreatingCode] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<BoothGlobalStaff | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Load Data ────────────────────────────────────────────────
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { booth, role: userRole } = await getMyBoothGlobal();
      
      if (!booth) {
        toast.warning('ไม่พบข้อมูลบูธ');
        router.push('/booths/my-booth');
        return;
      }
      
      setBoothId(booth.id);
      setRole(userRole);
      
      // Load staff
      const staffData = await getBoothStaff(booth.id);
      
      console.log('═══════════════════════════════════════════');
      console.log('📊 STAFF DATA RESPONSE:');
      console.log('═══════════════════════════════════════════');
      console.log('Raw Data:', staffData);
      console.log('Count:', staffData.length);
      console.log('---');
      staffData.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, {
          userId: member.userId,
          name: `${member.firstname} ${member.lastname}`,
          email: member.email,
          role: member.role,
          status: member.status
        });
      });
      console.log('═══════════════════════════════════════════');
      
      // ✅ เรียงข้อมูล: เจ้าของบนสุด → ทีมงานเรียง A-Z
      const sortedStaff = [...staffData].sort((a, b) => {
        const isOwnerA = a.role === 'booth_group_owner';
        const isOwnerB = b.role === 'booth_group_owner';
        
        // 1. เจ้าของอยู่บนสุดเสมอ
        if (isOwnerA && !isOwnerB) return -1;  // a is owner → a อยู่บน
        if (!isOwnerA && isOwnerB) return 1;   // b is owner → b อยู่บน
        
        // 2. ถ้าทั้งคู่เป็น role เดียวกัน → เรียงตามชื่อ A-Z
        return a.firstname.localeCompare(b.firstname, 'th');  // รองรับภาษาไทย
      });
      
      console.log('✅ Sorted Staff (Owner first, then A-Z):', sortedStaff.map(s => ({
        name: `${s.firstname} ${s.lastname}`,
        role: s.role
      })));
      
      setStaff(sortedStaff);
      
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('ไม่สามารถโหลดข้อมูลทีมงานได้');
    } finally {
      setLoading(false);
    }
  };

  // ─── Invite by Email ──────────────────────────────────────────
  
  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      toast.warning('กรุณากรอกอีเมล');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.warning('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
    
    try {
      setInviting(true);
      await inviteBoothStaff(boothId, inviteEmail);
      
      toast.success('ส่งคำเชิญสำเร็จ!');
      setShowInviteModal(false);
      setInviteEmail('');
      await loadData();
      
    } catch (error: any) {
      console.error('Failed to invite:', error);
      toast.error(error.message || 'ไม่สามารถส่งคำเชิญได้');
    } finally {
      setInviting(false);
    }
  };

  // ─── Create Invite Code ───────────────────────────────────────
  
  const handleOpenCodeModal = () => {
    // เปิด modal เฉยๆ ไม่สร้างรหัสทันที
    setInviteCode('');
    setShowCodeModal(true);
  };

  const handleGenerateCode = async () => {
    try {
      setCreatingCode(true);
      const code = await createBoothInviteCode(boothId);
      
      if (code) {
        setInviteCode(code);
      } else {
        toast.error('ไม่สามารถสร้างรหัสเชิญได้');
      }
      
    } catch (error) {
      console.error('Failed to create code:', error);
      toast.error('ไม่สามารถสร้างรหัสเชิญได้');
    } finally {
      setCreatingCode(false);
    }
  };

  // ─── Copy Code ────────────────────────────────────────────────
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('คัดลอกรหัสเรียบร้อย!');
  };

  // ─── Remove Staff ─────────────────────────────────────────────
  
  const handleRemoveStaff = async () => {
    if (!deletingStaff) return;
    
    try {
      setDeleting(true);
      await removeBoothStaff(boothId, deletingStaff.userId);
      
      toast.success('ลบทีมงานสำเร็จ');
      setShowDeleteModal(false);
      setDeletingStaff(null);
      await loadData();
      
    } catch (error: any) {
      console.error('Failed to remove staff:', error);
      toast.error(error.message || 'ไม่สามารถลบทีมงานได้');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Get Role Badge ───────────────────────────────────────────
  
  const getRoleBadge = (staffRole: string) => {
    if (staffRole === 'booth_group_owner') {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white text-xs font-bold rounded-full shadow-sm">
          เจ้าของ
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
        ทีมงาน
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'accepted') {
      return (
        <span className="px-3 py-1 bg-blue-50 text-[#3674B5] text-xs font-semibold rounded-full flex items-center gap-1 border border-blue-200">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          ยอมรับแล้ว
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full flex items-center gap-1 border border-gray-300">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        รอการตอบรับ
      </span>
    );
  };

  // ─── Loading State ────────────────────────────────────────────
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-[#3674B5] mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle className="opacity-25" cx="12" cy="12" r="10"/>
            <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
          </svg>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────
  
  const isOwner = role === 'booth_group_owner';

  // ✅ Filter staff based on search query
  const filteredStaff = staff.filter(member => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
    const email = member.email.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* ══════ Header ══════ */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/booths/my-booth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">กลับหน้าบูธ</span>
          </button>
          
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">จัดการทีมงาน</h1>
                <p className="text-gray-500 mt-1">เชิญและจัดการสมาชิกในบูธ</p>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl font-semibold hover:shadow-lg transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  เชิญทีมงาน
                </button>
                <button
                  onClick={handleOpenCodeModal}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-[#3674B5] border-2 border-[#3674B5] rounded-xl font-semibold hover:bg-blue-50 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  สร้างรหัสเชิญ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════ Search Bar ══════ */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหรืออีเมล..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              พบ {filteredStaff.length} คนจากทั้งหมด {staff.length} คน
            </p>
          )}
        </div>

        {/* ══════ Staff List ══════ */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-300 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              สมาชิกทั้งหมด ({filteredStaff.length} คน)
            </h2>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                {searchQuery ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
              </div>
              <p className="text-gray-400 mb-4">
                {searchQuery ? `ไม่พบผลการค้นหา "${searchQuery}"` : 'ยังไม่มีทีมงาน'}
              </p>
              {!searchQuery && isOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-6 py-2.5 bg-[#3674B5] text-white rounded-lg font-medium hover:bg-[#2d5a8f] transition"
                >
                  เชิญทีมงานคนแรก
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredStaff.map((member) => (
                <div key={member.userId} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Avatar - ปรับสีให้นุ่มนวล */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5B8FC9] to-[#7AA8D6] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
                        <span className="select-none">
                          {member.firstname.charAt(0)}{member.lastname.charAt(0)}
                        </span>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-900 truncate">
                            {member.firstname} {member.lastname}
                          </h3>
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2 truncate">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          {member.email}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isOwner && member.role !== 'booth_group_owner' && (
                      <button
                        onClick={() => {
                          setDeletingStaff(member);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                        title="ลบออกจากทีมงาน"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════ Invite by Email Modal ══════ */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">เชิญทีมงานด้วยอีเมล</h3>
                <p className="text-sm text-gray-500 mt-1">ส่งคำเชิญไปยังอีเมลของสมาชิก</p>
              </div>
              
              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="example@company.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !inviting) {
                      handleInviteByEmail();
                    }
                  }}
                />
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleInviteByEmail}
                  disabled={inviting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {inviting ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ Invite Code Modal ══════ */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">รหัสเชิญทีมงาน</h3>
                <p className="text-sm text-gray-500 mt-1">สร้างรหัสเพื่อให้ทีมงานเข้าร่วมบูธ</p>
              </div>
              
              <div className="p-6">
                {!inviteCode ? (
                  /* ยังไม่มีรหัส - แสดงปุ่มสร้าง */
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                        <rect x="3" y="6" width="18" height="12" rx="2"/>
                        <path d="M3 10h18"/>
                        <path d="M7 14h.01"/>
                        <path d="M11 14h2"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-6">
                      คลิกปุ่มด้านล่างเพื่อสร้างรหัสเชิญ
                    </p>
                    <button
                      onClick={handleGenerateCode}
                      disabled={creatingCode}
                      className="px-8 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingCode ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle className="opacity-25" cx="12" cy="12" r="10"/>
                            <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
                          </svg>
                          กำลังสร้างรหัส...
                        </span>
                      ) : (
                        'สร้างรหัสเชิญ'
                      )}
                    </button>
                  </div>
                ) : (
                  /* มีรหัสแล้ว - แสดงรหัส */
                  <div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-2">รหัสเชิญ</p>
                      <p className="text-4xl font-bold text-[#3674B5] tracking-widest font-mono mb-4">
                        {inviteCode}
                      </p>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-white text-[#3674B5] rounded-lg font-medium hover:bg-blue-50 transition border border-blue-200"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        คัดลอกรหัส
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-4">
                      รหัสนี้สามารถใช้ได้หลายครั้ง
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowCodeModal(false);
                    setInviteCode('');
                  }}
                  className="w-full px-4 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                  {inviteCode ? 'ปิด' : 'ยกเลิก'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════ Delete Confirmation Modal ══════ */}
        {showDeleteModal && deletingStaff && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">ยืนยันการลบทีมงาน</h3>
                <p className="text-sm text-gray-500 mt-2">
                  คุณต้องการลบ <span className="font-semibold text-gray-900">{deletingStaff.firstname} {deletingStaff.lastname}</span> ออกจากทีมงานใช่หรือไม่?
                </p>
              </div>

              <div className="p-6 bg-gray-50 flex gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingStaff(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleRemoveStaff}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleting ? 'กำลังลบ...' : 'ลบทีมงาน'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}