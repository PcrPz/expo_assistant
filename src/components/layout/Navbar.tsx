// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/features/auth/store/authStore';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // โหลด user จาก localStorage เมื่อ mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      // TODO: เรียก API เพื่อ verify token และดึง user data
      // ตอนนี้ใช้แค่เช็ค token ก่อน
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-[#498AC3] px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/images/logo_expo.png"
            alt="ExpoAssistant Logo" 
            width={40}
            height={40}
            className="rounded transition-transform group-hover:scale-105"
          />
          <span className="text-white text-xl font-semibold">
            ExpoAssistant
          </span>
        </Link>

        {/* Right Side - เปลี่ยนตามสถานะ Login */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* แสดงเมื่อ Login แล้ว */}
              
              {/* User Info */}
              <div className="flex items-center gap-3 text-white">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs opacity-90">{user.email}</p>
                </div>
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Dashboard Button */}
              <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <Button 
                  variant="outline" 
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#498AC3] transition-colors"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                    />
                  </svg>
                  แดชบอร์ด
                </Button>
              </Link>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="bg-white/10 text-white border-2 border-white/50 hover:bg-red-500 hover:border-red-500 transition-colors"
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                ออกจากระบบ
              </Button>
            </>
          ) : (
            <>
              {/* แสดงเมื่อยัง Login */}
              
              {/* Register Link */}
              <Link href="/register">
                <Button 
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  สมัครสมาชิก
                </Button>
              </Link>

              {/* Login Button */}
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#498AC3] transition-colors"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  เข้าสู่ระบบ
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}