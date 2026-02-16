// src/features/auth/components/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LoginRequest } from '../types/auth.types';
import { login } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { refreshUser } = useAuthStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData: LoginRequest = { 
        email: emailOrUsername, 
        password 
      };
      
      console.log('🔐 Login - Attempting login...');
      const response = await login(loginData);
      console.log('✅ Login successful:', response);

      // ✅ โหลด User data ทันทีหลัง Login
      console.log('📡 Login - Loading user data...');
      await refreshUser();
      console.log('✅ Login - User data loaded');

      // ✅ ดึง User จาก Store
      const currentUser = useAuthStore.getState().user;
      console.log('👤 Current user role:', currentUser?.Role);

      // ✅ Redirect ตาม Role
      if (currentUser?.Role === 'booth_manager') {
        console.log('🏪 Booth Manager - Redirecting to /booths/my-booth');
        router.push('/booths/my-booth');
      } else {
        console.log('🎪 Organizer - Redirecting to /home');
        router.push('/home');
      }

      router.refresh();
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form (60%) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 lg:px-12 xl:px-20 py-8 bg-white">
        <div className="w-full max-w-xl -mt-12">
          {/* Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-600">
              ยินดีต้อนรับกลับมา! กรุณากรอกข้อมูลของคุณ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-3.5 pl-12 rounded-xl border-0 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                placeholder="อีเมล / ชื่อผู้ใช้"
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

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Forgot Password */}
            <div className="flex items-center justify-end pt-1">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full bg-[#3674B5] text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              }`}
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">ยังไม่มีบัญชี? </span>
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
            >
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (40%) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center p-12">
        <div className="max-w-md">
          <Image
            src="/images/Login_Image.png"
            alt="Login Illustration"
            width={400}
            height={400}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}