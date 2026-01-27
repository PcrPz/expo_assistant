// src/components/layout/DashboardLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';
import { useAuth } from '@/src/features/auth/hook/useAuth';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  
  // ✅ ใช้ useAuth เพื่อโหลด User
  const { isAuthenticated, isLoading } = useAuth();

  // ✅ Redirect ถ้ายังไม่ Login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to /login');
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Debug state
  useEffect(() => {
    console.log('📊 Sidebar state:', sidebarOpen);
  }, [sidebarOpen]);

  // ✅ แสดง Loading ขณะโหลด User
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ✅ ถ้ายังไม่ Login ไม่ต้องแสดงอะไร (จะ Redirect อยู่แล้ว)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <DashboardNavbar 
        onToggleSidebar={() => {
          console.log('🔄 Toggle sidebar - Before:', sidebarOpen);
          setSidebarOpen(!sidebarOpen);
          console.log('🔄 Toggle sidebar - After:', !sidebarOpen);
        }} 
      />

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content - ขยับตาม sidebar state */}
        <main 
          className={`
            flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-300
            ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}