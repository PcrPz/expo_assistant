// src/features/auth/components/RegisterForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RegisterRequest, UserRole } from '../types/auth.types';
import { register } from '../api/authApi';

/**
 * RegisterForm Component with Toggle Slide
 */
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
    // ✅ ข้อมูลไม่หาย! เก็บ state ไว้
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

      const response = await register(registerData);
      console.log('Register successful:', response);
      router.push('/login');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.error || 'สมัครสมาชิกไม่สำเร็จ');
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
          {/* Header - Centered */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-gray-600">
              ยินดีต้อนรับสู่ ExpoAssistant! กรุณากรอกข้อมูลของคุณ
            </p>
          </div>

          {/* Toggle Slide with Centered Label */}
          <div className="mb-8 flex flex-col items-center">
            {/* Label above toggle */}
            <p className="text-sm font-semibold text-gray-700 mb-3">
              เลือกบทบาทที่ต้องการสร้าง
            </p>

            <div className="relative inline-flex w-96">
              <button
                type="button"
                onClick={handleToggle}
                className="relative w-full h-14 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-200"
                style={{
                  backgroundColor: isOrganizer ? '#3674B5' : '#749BC2',
                }}
              >
                {/* Sliding Circle */}
                <div
                  className="absolute top-1 h-12 w-[48%] bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
                  style={{
                    left: isOrganizer ? '4px' : 'calc(52% - 4px)',
                  }}
                />

                {/* Labels - Centered in each half */}
                <div className="relative flex h-full">
                  <div className="w-1/2 flex items-center justify-center z-10">
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        isOrganizer ? 'text-[#3674B5]' : 'text-white'
                      }`}
                    >
                      ผู้จัดงาน
                    </span>
                  </div>
                  <div className="w-1/2 flex items-center justify-center z-10">
                    <span
                      className={`font-semibold transition-colors duration-300 ${
                        !isOrganizer ? 'text-[#749BC2]' : 'text-white'
                      }`}
                    >
                      ผู้จัดการบูธ
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error Message */}
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
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ชื่อ"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="นามสกุล"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Username + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ชื่อผู้ใช้"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="อีเมล"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="รหัสผ่าน"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ยืนยันรหัสผ่าน"
                  required
                  disabled={loading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="relative">
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                required
                disabled={loading}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
            </div>

            {/* วันเกิด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                วันเกิด
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  required
                  disabled={loading}
                >
                  <option value="">วัน</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>

                <select
                  name="birthMonth"
                  value={formData.birthMonth}
                  onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  required
                  disabled={loading}
                >
                  <option value="">เดือน</option>
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>

                <select
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="px-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:20px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                  required
                  disabled={loading}
                >
                  <option value="">ปี</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* เพศ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                เพศ
              </label>
              <div className="flex gap-6 px-5 py-4 rounded-xl bg-gray-50">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                    required
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700 font-medium group-hover:text-gray-900 transition">ชาย</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700 font-medium group-hover:text-gray-900 transition">หญิง</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-400"
                    disabled={loading}
                  />
                  <span className="ml-2 text-gray-700 font-medium group-hover:text-gray-900 transition">อื่น ๆ</span>
                </label>
              </div>
            </div>

            {/* PDPA */}
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
                ฉันยอมรับ{' '}
                <Link href="/terms" className="text-blue-600 hover:underline font-medium">
                  เงื่อนไขการใช้งาน
                </Link>
                {' '}และ{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                  นโยบายความเป็นส่วนตัว (PDPA)
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              }`}
              style={{
                backgroundColor: isOrganizer ? '#3674B5' : '#749BC2'
              }}
              disabled={loading}
            >
              {loading 
                ? 'กำลังสมัครสมาชิก...' 
                : isOrganizer
                  ? 'สมัครสมาชิกในฐานะผู้จัดงาน'
                  : 'สมัครสมาชิกในฐานะผู้จัดการบูธ'
              }
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <Image
            src="/images/Register_Image.png"
            alt="Register Illustration"
            width={450}
            height={450}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}