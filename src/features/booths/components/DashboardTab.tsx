// src/features/booths/components/DashboardTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBooths } from '../api/boothApi';
import type { Booth } from '../types/booth.types';

interface DashboardTabProps {
  expoId: string;
}

export function DashboardTab({ expoId }: DashboardTabProps) {
  const router = useRouter();
  const [myBooths, setMyBooths] = useState<Booth[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyBooths();
  }, [expoId]);

  const loadMyBooths = async () => {
    try {
      setIsLoading(true);
      const allMyBooths = await getMyBooths();
      
      // Filter เฉพาะบูธที่อยู่ในงานนี้
      const boothsInThisExpo = allMyBooths.filter(
        booth => booth.expo_id === expoId
      );
      
      setMyBooths(boothsInThisExpo);
    } catch (error) {
      console.error('Failed to load my booths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดบูธของคุณ...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (myBooths.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">คุณยังไม่มีบูธในงานนี้</h3>
        <p className="text-gray-600 mb-6">
          โปรดติดต่อผู้จัดงานเพื่อเพิ่มคุณเข้าในบูธ
        </p>
        <button
          onClick={() => router.push(`/events/${expoId}`)}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
        >
          กลับหน้ารายละเอียดงาน
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          บูธของฉัน
        </h2>
        <p className="text-gray-600">
          คุณมีบูธ {myBooths.length} บูธในงานนี้
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="🏪"
          label="บูธทั้งหมด"
          value={myBooths.length}
          color="blue"
        />
        <StatCard
          icon="📄"
          label="เอกสาร"
          value="-"
          color="purple"
          subtitle="เร็วๆ นี้"
        />
        <StatCard
          icon="🛍️"
          label="สินค้า"
          value="-"
          color="green"
          subtitle="เร็วๆ นี้"
        />
        <StatCard
          icon="📢"
          label="ประกาศ"
          value="-"
          color="orange"
          subtitle="เร็วๆ นี้"
        />
      </div>

      {/* Booth List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          จัดการบูธของคุณ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myBooths.map((booth) => (
            <BoothDashboardCard
              key={booth.booth_id}
              booth={booth}
              onClick={() => router.push(`/events/${expoId}/booths/${booth.booth_id}`)}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          การกระทำด่วน
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickActionButton
            icon="📄"
            label="จัดการเอกสาร"
            disabled
          />
          <QuickActionButton
            icon="🛍️"
            label="จัดการสินค้า"
            disabled
          />
          <QuickActionButton
            icon="📢"
            label="สร้างประกาศ"
            disabled
          />
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 ฟีเจอร์เหล่านี้จะเปิดใช้งานเร็วๆ นี้
        </p>
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

function StatCard({ icon, label, value, color, subtitle }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
      <div className={`inline-flex w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} items-center justify-center text-2xl mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// ============================================
// Booth Dashboard Card
// ============================================

interface BoothDashboardCardProps {
  booth: Booth;
  onClick: () => void;
}

function BoothDashboardCard({ booth, onClick }: BoothDashboardCardProps) {
  const TYPE_ICONS: Record<string, string> = {
    small_booth: '🏪',
    big_booth: '🏬',
    stage: '🎭',
  };

  const TYPE_LABELS: Record<string, string> = {
    small_booth: 'บูธเล็ก',
    big_booth: 'บูธใหญ่',
    stage: 'เวที',
  };

  const icon = TYPE_ICONS[booth.type] || '📦';
  const typeLabel = TYPE_LABELS[booth.type] || booth.type;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border-2 border-green-300 p-6 cursor-pointer hover:border-green-400 hover:shadow-lg transition group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{icon}</div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition">
              {booth.booth_no}
            </h4>
            <p className="text-sm text-gray-600">{typeLabel}</p>
          </div>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-green-600 transition">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      {/* Info */}
      {booth.title && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {booth.title}
        </p>
      )}

      <div className="space-y-1.5 text-sm text-gray-600">
        {booth.zone_name && (
          <div className="flex items-center gap-2">
            <span className="font-medium">โซน:</span>
            <span>{booth.zone_name}</span>
          </div>
        )}
        {booth.hall && (
          <div className="flex items-center gap-2">
            <span className="font-medium">ฮอลล์:</span>
            <span>{booth.hall}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
        <span>📄 - เอกสาร</span>
        <span>🛍️ - สินค้า</span>
        <span>📢 - ประกาศ</span>
      </div>
    </div>
  );
}

// ============================================
// Quick Action Button
// ============================================

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function QuickActionButton({ icon, label, onClick, disabled }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-3 p-3 rounded-lg transition
        ${disabled
          ? 'bg-white/50 text-gray-400 cursor-not-allowed'
          : 'bg-white hover:bg-blue-50 text-gray-700 hover:shadow-md'
        }
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}