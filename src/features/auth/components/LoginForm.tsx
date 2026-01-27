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

      // ✅ login() จะเรียก tokenManager.setTokens() ให้แล้ว

      // ✅ โหลด User data ทันทีหลัง Login
      console.log('📡 Login - Loading user data...');
      await refreshUser();
      console.log('✅ Login - User data loaded');

      // Redirect ไปหน้า Home
      router.push('/home');
      router.refresh();
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล');
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
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-600 text-lg">
              ยินดีต้อนรับกลับมา! กรุณากรอกอีเมลและรหัสผ่านของคุณ
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
            {/* Email Input */}
            <div className="relative">
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-6 py-4 pl-14 pr-5 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="อีเมล / ชื่อผู้ใช้"
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

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 pl-14 pr-14 rounded-xl border-0 bg-gray-100 text-gray-800 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="รหัสผ่าน"
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

            {/* Sign In Button */}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white font-bold py-5 px-6 rounded-xl text-lg shadow-md transition-all ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-blue-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
              }`}
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-6">
            <Link 
              href="/forgot-password" 
              className="text-lg text-blue-600 hover:text-blue-700 font-semibold hover:underline transition"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-10 mb-10">
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

          {/* Google Login Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-xl bg-white border-2 border-gray-200 text-blue-600 font-semibold text-lg hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.99] mb-10 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 20 20">
              <path
                fill="#4285F4"
                d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
              />
              <path
                fill="#34A853"
                d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
              />
              <path
                fill="#FBBC05"
                d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
              />
              <path
                fill="#EA4335"
                d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
              />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-gray-600 text-lg">ยังไม่มีบัญชีใช่ไหม? </span>
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline transition"
            >
              สมัครสมาชิก
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
            src="/images/Login_Image.png"
            alt="Login Illustration"
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