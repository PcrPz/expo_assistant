// src/features/auth/components/RegisterForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RegisterRequest } from '../types/auth.types';
import { register } from '../api/authApi';

/**
 * RegisterForm Component - เชื่อมต่อ Backend
 */
export function RegisterForm() {
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

  // ข้อมูล dropdown
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const currentYear = new Date().getFullYear() + 543;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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

    // Validation
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
      // แปลงวันเกิด (พ.ศ. → ค.ศ. + YYYY-MM-DD)
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
      };

      const response = await register(registerData);
      console.log('Register successful:', response);

      // Redirect ไป Login
      router.push('/login');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.error || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex">
      {/* Left Side - Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 lg:px-12 xl:px-20 py-12 bg-white">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-3">
              สร้างบัญชีใหม่
            </h1>
            <p className="text-gray-600 text-lg">
              ยินดีต้อนรับสู่ ExpoAssistant! กรุณากรอกข้อมูลของคุณ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: ชื่อ + นามสกุล */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Firstname */}
              <div className="relative">
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="ชื่อ"
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              {/* Lastname */}
              <div className="relative">
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="นามสกุล"
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Row 2: Username + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="ชื่อผู้ใช้"
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="อีเมล"
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Row 3: Tel */}
            <div className="relative">
              <input
                type="tel"
                name="tel"
                value={formData.tel}
                onChange={handleChange}
                className="w-full px-6 py-4 pl-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                pattern="[0-9]{10}"
                maxLength={10}
                inputMode="numeric"
                required
                disabled={loading}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
            </div>

            {/* Row 4: Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 pr-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="รหัสผ่าน"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  disabled={loading}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPassword ? (
                      <>
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full px-6 py-4 pl-14 pr-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="ยืนยันรหัสผ่าน"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  disabled={loading}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showConfirmPassword ? (
                      <>
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 ml-1">
                วันเดือนปีเกิด
              </label>
              <div className="grid grid-cols-3 gap-5">
                <select
                  name="birthDay"
                  value={formData.birthDay}
                  onChange={handleChange}
                  className="px-6 py-4 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:22px] bg-[right_1rem_center] bg-no-repeat pr-12"
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
                  className="px-6 py-4 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:22px] bg-[right_1rem_center] bg-no-repeat pr-12"
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
                  className="px-6 py-4 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:22px] bg-[right_1rem_center] bg-no-repeat pr-12"
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
              <label className="block text-base font-semibold text-gray-700 mb-3 ml-1">
                เพศ
              </label>
              <div className="flex gap-10 px-6 py-5 rounded-xl bg-gray-100">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                  />
                  <span className="ml-3 text-gray-700 text-lg font-medium group-hover:text-gray-900 transition">ชาย</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="ml-3 text-gray-700 text-lg font-medium group-hover:text-gray-900 transition">หญิง</span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="ml-3 text-gray-700 text-lg font-medium group-hover:text-gray-900 transition">อื่น ๆ</span>
                </label>
              </div>
            </div>

            {/* PDPA Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="pdpa_accepted"
                checked={formData.pdpa_accepted}
                onChange={handleChange}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
              <label className="text-sm text-gray-700 leading-relaxed">
                ฉันยอมรับ{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  เงื่อนไขการใช้งาน
                </Link>
                {' '}และ{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  นโยบายความเป็นส่วนตัว (PDPA)
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white font-bold py-5 px-6 rounded-xl text-lg shadow-md transition-all ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-blue-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              }`}
              disabled={loading}
            >
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-5 mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 bg-white text-gray-500 text-base font-medium">
                  หรือเข้าสู่ระบบด้วย
                </span>
              </div>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-white border-2 border-gray-200 text-blue-600 font-semibold text-lg hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.99] mb-10 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
            </svg>
            ลงทะเบียนด้วย Google
          </button>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-gray-600 text-lg">มีบัญชีอยู่แล้ว? </span>
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline transition"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Image Container */}
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