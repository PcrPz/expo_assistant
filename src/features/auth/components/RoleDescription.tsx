// src/features/auth/components/RoleDescription.tsx
'use client';

import { UserRole } from '../types/auth.types';

interface RoleDescriptionProps {
  role: UserRole;
}

const roleContent = {
  organizer: {
    icon: '📊',
    title: 'สมัครสมาชิกสำหรับผู้จัดงาน',
    description: 'จัดการงาน Expo ของคุณได้อย่างมืออาชีพ',
    features: [
      'สร้างและจัดการงานได้ไม่จำกัด',
      'เชิญทีมงานร่วมจัดงาน',
      'ควบคุมบูธและโซนต่างๆ',
      'ดูสถิติและรายงานแบบเรียลไทม์'
    ],
    color: '#3674B5',
    bgColor: 'from-blue-50 to-blue-100',
  },
  booth_manager: {
    icon: '🏪',
    title: 'สมัครสมาชิกสำหรับผู้จัดการบูธ',
    description: 'จัดการบูธของคุณในงาน Expo ต่างๆ',
    features: [
      'เข้าร่วมงาน Expo ได้หลายงาน',
      'จัดการสินค้าและเอกสาร',
      'ใช้ระบบคิวและแบบสอบถาม',
      'ประกาศข่าวสารและโปรโมชั่น'
    ],
    color: '#749BC2',
    bgColor: 'from-sky-50 to-sky-100',
  },
};

export function RoleDescription({ role }: RoleDescriptionProps) {
  const content = roleContent[role];

  return (
    <div className={`bg-gradient-to-r ${content.bgColor} rounded-2xl p-6 mb-8 border-2 transition-all duration-300`}
      style={{ borderColor: content.color }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-5xl">
          {content.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {content.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {content.description}
          </p>

          {/* Features List */}
          <ul className="space-y-2">
            {content.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="flex-shrink-0 mt-0.5"
                  style={{ stroke: content.color }}
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}