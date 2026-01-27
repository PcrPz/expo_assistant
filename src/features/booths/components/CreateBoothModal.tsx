// src/features/booths/components/CreateBoothModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';
import type { Zone } from '@/src/features/zones/types/zone.types';

interface CreateBoothModalProps {
  expoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ✅ Booth Types จาก Backend
const BOOTH_TYPES = [
  { value: 'small_booth', label: 'บูธขนาดเล็ก', icon: '🏪' },
  { value: 'big_booth', label: 'บูธขนาดใหญ่', icon: '🏬' },
  { value: 'stage', label: 'เวที', icon: '🎭' },
];

export function CreateBoothModal({ expoId, onClose, onSuccess }: CreateBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    booth_no: '',
    type: '',
    hall: '',
    zone_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // โหลด Zones
  useEffect(() => {
    loadZones();
  }, [expoId]);

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      console.log('🔍 Loading zones for expo:', expoId);
      const data = await getZonesByExpoId(expoId);
      console.log('✅ Zones loaded:', data);
      console.log('📊 Number of zones:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('🎯 First zone:', data[0]);
      }
      setZones(data);
    } catch (error) {
      console.error('❌ Failed to load zones:', error);
    } finally {
      setLoadingZones(false);
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.booth_no.trim()) {
      newErrors.booth_no = 'กรุณาระบุเลขที่บูธ';
    }

    if (!formData.type) {
      newErrors.type = 'กรุณาเลือกประเภทบูธ';
    }

    // ✅ ลบ validation zone_id ออก (ไม่บังคับแล้ว)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const { fetchWithAuth } = await import('@/src/lib/api/fetchWithAuth');

      const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booth');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create booth:', error);
      alert('เกิดข้อผิดพลาดในการสร้างบูธ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">สร้างบูธใหม่</h2>
                  <p className="text-sm text-gray-600">เพิ่มบูธในงาน Expo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* เลขที่บูธ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                เลขที่บูธ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.booth_no}
                onChange={(e) => {
                  setFormData({ ...formData, booth_no: e.target.value });
                  setErrors({ ...errors, booth_no: '' });
                }}
                placeholder="เช่น A-101, B-205"
                className={`
                  w-full px-4 py-3 rounded-lg border transition
                  ${errors.booth_no
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                  }
                  focus:ring-2 focus:outline-none
                `}
              />
              {errors.booth_no && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"></line>
                  </svg>
                  {errors.booth_no}
                </p>
              )}
            </div>

            {/* ประเภทบูธ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ประเภทบูธ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {BOOTH_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: type.value });
                      setErrors({ ...errors, type: '' });
                    }}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg border-2 transition
                      ${formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}
                  >
                    <div className="text-3xl">{type.icon}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{type.label}</p>
                    </div>
                    {formData.type === type.value && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  {errors.type}
                </p>
              )}
            </div>

            {/* ฮอลล์ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ฮอลล์ <span className="text-gray-400">(ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                value={formData.hall}
                onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                placeholder="เช่น Hall A, Hall 1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
              />
            </div>

            {/* โซน */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                โซน <span className="text-gray-400">(ไม่บังคับ)</span>
              </label>
              {loadingZones ? (
                <div className="flex items-center justify-center py-4 text-gray-500">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10"></circle>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  กำลังโหลดโซน...
                </div>
              ) : (
                <select
                  value={formData.zone_id}
                  onChange={(e) => {
                    setFormData({ ...formData, zone_id: e.target.value });
                    setErrors({ ...errors, zone_id: '' });
                  }}
                  className={`
                    w-full px-4 py-3 rounded-lg border transition
                    ${errors.zone_id
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }
                    focus:ring-2 focus:outline-none
                  `}
                >
                  <option value="">-- ไม่ระบุโซน --</option>
                  {zones.map((zone, index) => (
                    <option key={zone.zone_id || `zone-${index}`} value={zone.zone_id}>
                      {zone.title}
                    </option>
                  ))}
                </select>
              )}
              {errors.zone_id && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  {errors.zone_id}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
              >
                {isLoading ? 'กำลังสร้าง...' : 'สร้างบูธ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}