// src/components/layout/DashboardNavbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { logout as logoutApi } from '@/src/features/auth/api/authApi';
import { getProfilePicUrl } from '@/src/features/minio/api/minioApi';
import { tokenManager } from '@/src/lib/auth/tokenManager';
import { NotificationBell } from '@/src/features/notifications/components/NotificationBell';

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
}

export function DashboardNavbar({ onToggleSidebar }: DashboardNavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      tokenManager.clearTokens();
      logout();
      router.push('/login');
    }
  };

  const profilePicUrl = getProfilePicUrl(user?.ProfilePic);

  return (
    <nav className="bg-[#5B9BD5] shadow-sm sticky top-0 z-40">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <Link href="/home" className="flex items-center gap-3 group">
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
        </div>

        {/* Right: Notification + Profile */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-white/10 rounded-full py-1.5 px-2 pr-3 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden border-2 border-white">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={user?.Firstname || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <span className={`text-white font-bold text-lg ${profilePicUrl ? 'hidden' : ''}`}>
                  {user?.Firstname?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>

              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5"
                className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>

                <div className="absolute right-0 mt-3 w-72 z-50">
                  <div className="flex justify-end pr-4 mb-[-1px]">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[#5B9BD5]"></div>
                  </div>
                  
                  <div className="bg-[#5B9BD5] rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-4 flex items-center gap-3 border-b-2 border-white/30">
                      <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                        {profilePicUrl ? (
                          <img
                            src={profilePicUrl}
                            alt={user?.Firstname || 'User'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className={`text-white font-bold text-xl ${profilePicUrl ? 'hidden' : ''}`}>
                          {user?.Firstname?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      
                      {user && (
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-base truncate">
                            {user.Firstname} {user.Lastname}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3.5 text-white hover:bg-white/10 transition-colors border-b border-white/30"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span className="font-medium">Edit Profile</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 text-white hover:bg-white/10 transition-colors w-full"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}