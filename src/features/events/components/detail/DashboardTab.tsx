// src/features/events/components/detail/DashboardTab.tsx
'use client';

import type { EventRole } from '../../types/event.types';
import { isEventOrganizer } from '../../types/event.types';

interface DashboardTabProps {
  eventId: string;
  role?: EventRole;
}

export function DashboardTab({ eventId, role }: DashboardTabProps) {
  const isOrganizer = isEventOrganizer(role);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {isOrganizer ? 'แดชบอร์ดงาน' : 'สถิติของฉัน'}
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <StatCard
          icon={<UserIcon />}
          label="ผู้เข้าชมทั้งหมด"
          value="0"
          color="blue"
        />
        
        {/* Card 2 */}
        <StatCard
          icon={<BoothIcon />}
          label="บูธทั้งหมด"
          value="0"
          color="green"
        />
        
        {isOrganizer && (
          <>
            {/* Card 3 */}
            <StatCard
              icon={<StaffIcon />}
              label="เจ้าหน้าที่"
              value="0"
              color="yellow"
            />
            
            {/* Card 4 */}
            <StatCard
              icon={<ChartIcon />}
              label="คะแนนเฉลี่ย"
              value="0.0"
              color="purple"
            />
          </>
        )}
      </div>

      {/* Empty State */}
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </div>
        <p className="text-gray-500">ยังไม่มีข้อมูล</p>
        <p className="text-sm text-gray-400 mt-2">ข้อมูลจะแสดงเมื่อมีผู้เข้าชมงาน</p>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colors[color]} border-2 rounded-xl p-6`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Icons
function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B9BD5" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function BoothIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  );
}