// src/features/booths/components/CreateBoothModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';
import type { Zone } from '@/src/features/zones/types/zone.types';

interface CreateBoothModalProps {
  expoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// SVG Icons แทน Emoji
const SmallBoothIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const StageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const AvailableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const UnavailableIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const BOOTH_TYPES = [
  {
    value: 'booth',
    label: 'บูธ',
    desc: 'เหมาะสำหรับธุรกิจขนาดเล็ก',
    Icon: SmallBoothIcon,
    color: '#3674B5',
    bg: '#EBF3FC',
  },
  {
    value: 'stage',
    label: 'เวที',
    desc: 'พื้นที่สำหรับกิจกรรมและการแสดง',
    Icon: StageIcon,
    color: '#749BC2',
    bg: '#EBF3FC',
  },
];

const STATUS_OPTIONS = [
  {
    value: 'available',
    label: 'ว่าง',
    desc: 'บูธ Group สามารถขอเข้าร่วมได้',
    Icon: AvailableIcon,
    activeColor: '#3674B5',
    activeBg: '#EBF3FC',
  },
  {
    value: 'unavailable',
    label: 'ไม่เปิดรับ',
    desc: 'เฉพาะ Expo เชิญเท่านั้น',
    Icon: UnavailableIcon,
    activeColor: '#3674B5',
    activeBg: '#EBF3FC',
  },
];

export function CreateBoothModal({ expoId, onClose, onSuccess }: CreateBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const [formData, setFormData] = useState({
    booth_no: '',
    type: '',
    price: '',
    status: 'available',
    hall: '',
    zone_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { loadZones(); }, [expoId]);

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      const data = await getZonesByExpoId(expoId);
      setZones(data);
    } catch (error) {
      console.error('❌ Failed to load zones:', error);
    } finally {
      setLoadingZones(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.booth_no.trim()) newErrors.booth_no = 'กรุณาระบุเลขที่บูธ';
    if (!formData.type) newErrors.type = 'กรุณาเลือกประเภทบูธ';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0)
      newErrors.price = 'กรุณาระบุราคา (0 = ฟรี)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const { fetchWithAuth } = await import('@/src/lib/api/fetchWithAuth');
      const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create booth');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create booth:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างบูธ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">สร้างบูธใหม่</h2>
                <p className="text-xs text-gray-400">เพิ่มบูธในงาน Expo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Form — scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── เลขที่บูธ ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                เลขที่บูธ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                </span>
                <input
                  type="text"
                  value={formData.booth_no}
                  onChange={(e) => { setFormData({ ...formData, booth_no: e.target.value }); setErrors({ ...errors, booth_no: '' }); }}
                  placeholder="เช่น A-101, B-205"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                    errors.booth_no
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-[#3674B5] focus:ring-[#3674B5]/15'
                  }`}
                />
              </div>
              {errors.booth_no && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"/></svg>{errors.booth_no}</p>}
            </div>

            {/* ── ประเภทบูธ ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ประเภทบูธ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {BOOTH_TYPES.map((type) => {
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => { setFormData({ ...formData, type: type.value }); setErrors({ ...errors, type: '' }); }}
                      className={`relative flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? 'border-[#3674B5] bg-[#EBF3FC]'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: isSelected ? type.color : '#F3F4F6',
                          color: isSelected ? 'white' : '#9CA3AF',
                        }}
                      >
                        <type.Icon />
                      </div>
                      <p className={`text-xs font-semibold leading-tight ${isSelected ? 'text-[#3674B5]' : 'text-gray-600'}`}>
                        {type.label}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"/></svg>{errors.type}</p>}
            </div>

            {/* ── ราคา + ฮอลล์ ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* ราคา */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">฿</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => { setFormData({ ...formData, price: e.target.value }); setErrors({ ...errors, price: '' }); }}
                    placeholder="0.00"
                    className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      errors.price
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-200 focus:border-[#3674B5] focus:ring-[#3674B5]/15'
                    }`}
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                <p className="mt-1 text-xs text-gray-400">ใส่ 0 = ฟรี</p>
              </div>

              {/* ฮอลล์ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ฮอลล์ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  placeholder="เช่น Hall A"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition"
                />
              </div>
            </div>

            {/* ── สถานะเริ่มต้น ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                สถานะเริ่มต้น <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        isSelected
                          ? 'border-[#3674B5] bg-[#EBF3FC]'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: isSelected ? opt.activeColor : '#F3F4F6',
                          color: isSelected ? 'white' : '#9CA3AF',
                        }}
                      >
                        <opt.Icon />
                      </div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#3674B5]' : 'text-gray-700'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-[11px] leading-tight ${isSelected ? 'text-[#3674B5]/70' : 'text-gray-400'}`}>
                        {opt.desc}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── โซน ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                โซน <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
              </label>
              {loadingZones ? (
                <div className="flex items-center gap-2 py-2.5 text-gray-400 text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังโหลดโซน...
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <select
                    value={formData.zone_id}
                    onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 focus:outline-none transition appearance-none bg-white"
                  >
                    <option value="">-- ไม่ระบุโซน --</option>
                    {zones.map((zone, index) => (
                      <option key={zone.zone_id || `zone-${index}`} value={zone.zone_id}>
                        {zone.title}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              form=""
              disabled={isLoading}
              onClick={handleSubmit as any}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10"/>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  สร้างบูธ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}