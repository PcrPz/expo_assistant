// src/features/auth/components/RegisterForm.tsx
'use client';

import { useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RegisterRequest, UserRole } from '../types/auth.types';
import { register } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

// ─────────────────────────────────────────────
// PDPA Modal Component
// ─────────────────────────────────────────────
function PDPAModal({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && bodyRef.current) {
      bodyRef.current.scrollTo({ top: el.offsetTop - 12, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden"
        style={{ maxWidth: 520, maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">เงื่อนไขและนโยบายความเป็นส่วนตัว</p>
                <p className="text-[11px] text-gray-400 mt-0.5">ExpoAssistant · อัปเดตล่าสุด มี.ค. 2569</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Nav pills */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => scrollToSection('section-terms')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#EBF3FC] text-[#3674B5] border-none cursor-pointer hover:bg-[#DBEAFE] transition"
            >
              เงื่อนไขการใช้งาน
            </button>
            <button
              onClick={() => scrollToSection('section-pdpa')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border-none cursor-pointer hover:bg-gray-200 transition"
            >
              นโยบาย PDPA
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="overflow-y-auto flex-1 min-h-0">

          {/* ── เงื่อนไขการใช้งาน ── */}
          <div id="section-terms">
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#EBF3FC] flex items-center justify-center text-[11px] font-bold text-[#3674B5] flex-shrink-0">1</div>
                <p className="text-sm font-bold text-gray-900">การยอมรับเงื่อนไข</p>
              </div>
              <ul className="space-y-2">
                {[
                  'การลงทะเบียนและใช้งานระบบ ExpoAssistant ถือว่าท่านได้อ่านและยอมรับเงื่อนไขทั้งหมด',
                  'ระบบสงวนสิทธิ์ปรับเปลี่ยนเงื่อนไขโดยแจ้งล่วงหน้าผ่านอีเมลที่ลงทะเบียนไว้',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] flex-shrink-0 mt-2" />
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#EBF3FC] flex items-center justify-center text-[11px] font-bold text-[#3674B5] flex-shrink-0">2</div>
                <p className="text-sm font-bold text-gray-900">การใช้งานบัญชี</p>
              </div>
              <ul className="space-y-2">
                {[
                  'ผู้ใช้งานต้องรักษาความปลอดภัยของบัญชีและรหัสผ่านของตนเอง',
                  'ห้ามใช้บัญชีของผู้อื่นหรือสร้างบัญชีโดยใช้ข้อมูลเท็จ',
                  'บัญชีแต่ละบัญชีใช้ได้เฉพาะบทบาทที่ลงทะเบียนไว้ (Organizer หรือ Booth Manager)',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] flex-shrink-0 mt-2" />
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#EBF3FC] flex items-center justify-center text-[11px] font-bold text-[#3674B5] flex-shrink-0">3</div>
                <p className="text-sm font-bold text-gray-900">ข้อห้ามในการใช้งาน</p>
              </div>
              <ul className="space-y-2">
                {[
                  'ห้ามใช้ระบบเพื่อวัตถุประสงค์ที่ผิดกฎหมายหรือละเมิดสิทธิ์ผู้อื่น',
                  'ห้ามพยายามเข้าถึงข้อมูลของผู้ใช้งานอื่นโดยไม่ได้รับอนุญาต',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3674B5] flex-shrink-0 mt-2" />
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── นโยบาย PDPA ── */}
          <div id="section-pdpa" className="bg-[#FAFBFC]">
            <div className="px-6 pt-4 pb-3">
              <div className="bg-[#EBF3FC] rounded-xl px-4 py-3 flex gap-2 items-start mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p className="text-[12px] text-blue-800 leading-relaxed">ระบบดำเนินการตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[11px] font-bold text-emerald-700 flex-shrink-0">4</div>
                <p className="text-sm font-bold text-gray-900">ข้อมูลที่เราเก็บรวบรวมและวัตถุประสงค์</p>
              </div>
              <ul className="space-y-2">
                {[
                  'ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ — ใช้สำหรับการยืนยันตัวตนและการติดต่อสื่อสาร',
                  'วันเกิด — ใช้คำนวณช่วงอายุ (เช่น 18-25 ปี) เพื่อแสดงเป็นสถิติ Demographics ใน Dashboard ของงานและบูธ',
                  'เพศ — ใช้แสดงสัดส่วนเพศผู้เข้าชมในสถิติ Dashboard ของงานและบูธ',
                  'ข้อมูลการใช้งานระบบ เช่น การสร้างงาน การจัดการบูธ — ใช้ปรับปรุงประสบการณ์การใช้งาน',
                  'รูปโปรไฟล์และไฟล์ที่อัปโหลด — ใช้แสดงในระบบตามที่ผู้ใช้กำหนด',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[11px] font-bold text-emerald-700 flex-shrink-0">5</div>
                <p className="text-sm font-bold text-gray-900">สิทธิ์ของเจ้าของข้อมูล</p>
              </div>
              <ul className="space-y-2">
                {[
                  'ท่านมีสิทธิ์ขอดู แก้ไข หรือลบข้อมูลส่วนตัวได้ทุกเมื่อผ่านหน้าโปรไฟล์',
                  'ท่านมีสิทธิ์ถอนความยินยอมได้ตลอดเวลา อย่างไรก็ตามอาจกระทบต่อการใช้งานบางส่วน',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                    <p className="text-[13px] text-gray-500 leading-relaxed">{t}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-3 bg-amber-50 rounded-xl px-4 py-3 flex gap-2 items-start">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p className="text-[12px] text-amber-800 leading-relaxed">ข้อมูลจะถูกเก็บไว้ตลอดอายุบัญชี และลบออกภายใน 30 วันหลังจากปิดบัญชี</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-[11px] text-gray-400 text-center mb-3 leading-relaxed">
            การกด "ยอมรับทั้งหมด" ถือว่าท่านได้อ่านและยอมรับเงื่อนไขทั้งหมดข้างต้น
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              ปิด
            </button>
            <button
              onClick={onAccept}
              className="flex-[2] py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ยอมรับทั้งหมด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RegisterForm Component
// ─────────────────────────────────────────────
export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('organizer');
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    tel: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    pdpa_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPDPAModal, setShowPDPAModal] = useState(false);

  const router = useRouter();

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleToggle = () => {
    setSelectedRole(prev => prev === 'organizer' ? 'booth_manager' : 'organizer');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePDPAAccept = () => {
    setFormData(prev => ({ ...prev, pdpa_accepted: true }));
    setShowPDPAModal(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    if (formData.tel.length !== 10) {
      setError('เบอร์โทรศัพท์ต้องเป็น 10 หลัก');
      setLoading(false);
      return;
    }

    if (!formData.pdpa_accepted) {
      setError('กรุณายอมรับเงื่อนไข PDPA');
      setLoading(false);
      return;
    }

    try {
      const dob = formData.birthYear && formData.birthMonth && formData.birthDay
        ? `${parseInt(formData.birthYear) - 543}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        : '';

      const registerData: RegisterRequest = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        tel: formData.tel,
        dob: dob,
        gender: formData.gender,
        pdpa_accepted: formData.pdpa_accepted,
        role: selectedRole,
      };

      // ✅ Register แล้ว auto login เลย
      await register(registerData);
      await useAuthStore.getState().refreshUser();

      if (selectedRole === 'booth_manager') {
        router.push('/booths/my-booth');
      } else {
        router.push('/home');
      }

    } catch (err: any) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const isOrganizer = selectedRole === 'organizer';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 lg:px-12 xl:px-20 py-12 bg-white">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">สร้างบัญชีใหม่</h1>
            <p className="text-gray-600">ยินดีต้อนรับสู่ ExpoAssistant! กรุณากรอกข้อมูลของคุณ</p>
          </div>

          {/* Toggle */}
          <div className="mb-8 flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-700 mb-3">เลือกบทบาทที่ต้องการสร้าง</p>
            <div className="relative inline-flex w-96">
              <button
                type="button"
                onClick={handleToggle}
                className="relative w-full h-14 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-200"
                style={{ backgroundColor: isOrganizer ? '#3674B5' : '#749BC2' }}
              >
                <div
                  className="absolute top-1 h-12 w-[48%] bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
                  style={{ left: isOrganizer ? '4px' : 'calc(52% - 4px)' }}
                />
                <div className="relative flex h-full">
                  <div className="w-1/2 flex items-center justify-center z-10">
                    <span className={`font-semibold transition-colors duration-300 ${isOrganizer ? 'text-[#3674B5]' : 'text-white'}`}>ผู้จัดงาน</span>
                  </div>
                  <div className="w-1/2 flex items-center justify-center z-10">
                    <span className={`font-semibold transition-colors duration-300 ${!isOrganizer ? 'text-[#749BC2]' : 'text-white'}`}>ผู้จัดการบูธ</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ชื่อ + นามสกุล */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ชื่อ" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
              <div className="relative">
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="นามสกุล" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
            </div>

            {/* Username + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input type="text" name="username" value={formData.username} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ชื่อผู้ใช้" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
              <div className="relative">
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="อีเมล" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="รหัสผ่าน" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={loading}>
                  {showPassword
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ยืนยันรหัสผ่าน" required disabled={loading} />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" disabled={loading}>
                  {showConfirmPassword
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="relative">
              <input type="tel" name="tel" value={formData.tel} onChange={handleChange} maxLength={10}
                className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                placeholder="เบอร์โทรศัพท์ (10 หลัก)" required disabled={loading} />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.26 12 19.79 19.79 0 0 1 1.19 3.35 2 2 0 0 1 3.17 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
            </div>

            {/* วันเกิด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">วันเกิด</label>
              <div className="grid grid-cols-3 gap-3">
                <select name="birthDay" value={formData.birthDay} onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none"
                  required disabled={loading}>
                  <option value="">วัน</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="birthMonth" value={formData.birthMonth} onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none"
                  required disabled={loading}>
                  <option value="">เดือน</option>
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select name="birthYear" value={formData.birthYear} onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none"
                  required disabled={loading}>
                  <option value="">ปี</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* เพศ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">เพศ</label>
              <div className="flex gap-6 px-5 py-4 rounded-xl bg-gray-50">
                {[
                  { value: 'male', label: 'ชาย' },
                  { value: 'female', label: 'หญิง' },
                  { value: 'other', label: 'อื่น ๆ' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center cursor-pointer group">
                    <input type="radio" name="gender" value={opt.value}
                      checked={formData.gender === opt.value} onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                      required={opt.value === 'male'} disabled={loading} />
                    <span className="ml-2 text-gray-700 font-medium group-hover:text-gray-900 transition">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── PDPA Checkbox ── */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="pdpa_accepted"
                checked={formData.pdpa_accepted}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                required
                disabled={loading}
              />
              <label className="text-sm text-gray-600 leading-relaxed">
                ฉันได้อ่านและยอมรับ{' '}
                <button
                  type="button"
                  onClick={() => setShowPDPAModal(true)}
                  className="text-blue-600 hover:underline font-medium bg-transparent border-none cursor-pointer p-0"
                >
                  เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว (PDPA)
                </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'}`}
              style={{ backgroundColor: isOrganizer ? '#3674B5' : '#749BC2' }}
              disabled={loading}
            >
              {loading
                ? 'กำลังสมัครสมาชิก...'
                : isOrganizer ? 'สมัครสมาชิกในฐานะผู้จัดงาน' : 'สมัครสมาชิกในฐานะผู้จัดการบูธ'
              }
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition">
              เข้าสู่ระบบ
            </a>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 w-full max-w-lg">
          <Image src="/images/Register_Image.png" alt="Register Illustration"
            width={450} height={450} className="object-contain drop-shadow-2xl" priority />
        </div>
      </div>

      {/* PDPA Modal */}
      {showPDPAModal && (
        <PDPAModal
          onClose={() => setShowPDPAModal(false)}
          onAccept={handlePDPAAccept}
        />
      )}
    </div>
  );
}