// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <nav className="bg-[#4A8BC2] text-white shadow-md sticky top-0 z-40">
      <div className="h-14 px-6 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Logo */}
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

        {/* Right: Login + Register Buttons */}
        <div className="flex items-center gap-3">
          {/* Register Button */}
          <Link
            href="/register"
            className="px-5 py-2 text-white font-medium hover:bg-white/10 rounded-full transition-all"
          >
            ลงทะเบียน
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2 bg-white text-[#4A8BC2] hover:bg-white/90 rounded-full transition-all font-medium shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span>เข้าสู่ระบบ</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}