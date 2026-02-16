// src/features/auth/components/RoleToggle.tsx
'use client';

import { UserRole } from '../types/auth.types';

interface RoleToggleProps {
  selectedRole: UserRole;
  onToggle: () => void;
}

export function RoleToggle({ selectedRole, onToggle }: RoleToggleProps) {
  const isOrganizer = selectedRole === 'organizer';

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      {/* Toggle Switch */}
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          className="relative w-80 h-16 rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-200"
          style={{
            backgroundColor: isOrganizer ? '#3674B5' : '#749BC2',
          }}
        >
          {/* Sliding Circle */}
          <div
            className="absolute top-1 h-14 w-[50%] bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
            style={{
              left: isOrganizer ? '4px' : 'calc(50% - 4px)',
            }}
          />

          {/* Labels */}
          <div className="relative flex items-center justify-between h-full px-6">
            <span
              className={`font-semibold text-sm transition-colors duration-300 z-10 ${
                isOrganizer ? 'text-[#3674B5]' : 'text-white'
              }`}
            >
              Organizer
            </span>
            <span
              className={`font-semibold text-sm transition-colors duration-300 z-10 ${
                !isOrganizer ? 'text-[#749BC2]' : 'text-white'
              }`}
            >
              Booth Manager
            </span>
          </div>
        </button>
      </div>

      {/* Thai Labels */}
      <div className="flex items-center justify-between w-80 px-8">
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            isOrganizer ? 'text-[#3674B5]' : 'text-gray-400'
          }`}
        >
          ผู้จัดงาน
        </span>
        <span
          className={`text-sm font-medium transition-colors duration-300 ${
            !isOrganizer ? 'text-[#749BC2]' : 'text-gray-400'
          }`}
        >
          ผู้จัดการบูธ
        </span>
      </div>
    </div>
  );
}