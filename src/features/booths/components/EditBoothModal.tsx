// src/features/booths/components/EditBoothModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { updateBooth, updateBoothWithThumbnail } from '../api/boothApi';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Booth, BoothType, UpdateBoothRequest } from '../types/booth.types';
import type { Zone } from '@/src/features/zones/types/zone.types';
import { BOOTH_TYPES } from '../types/booth.types';

interface EditBoothModalProps {
  expoId: string;
  booth: Booth;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBoothModal({ expoId, booth, onClose, onSuccess }: EditBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  
  // Thumbnail upload
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    booth_no: string;
    type: BoothType;
    price: string;
    status: string;
    title: string;
    detail: string;
    company: string;
    hall: string;
    zone_id: string;
    email: string;
    tel: string;
    website1: string;
    website2: string;
  }>({
    booth_no: booth.booth_no || '',
    type: booth.type || 'small_booth',
    price: String(booth.price ?? '0'),
    status: booth.status || 'available',
    title: booth.title || '',
    detail: booth.detail || '',
    company: booth.company || '',
    hall: booth.hall || '',
    zone_id: booth.zone_id || '',
    email: booth.email || '',
    tel: booth.tel || '',
    website1: booth.website1 || '',
    website2: booth.website2 || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load zones
  useEffect(() => {
    loadZones();
  }, [expoId]);

  const loadZones = async () => {
    try {
      setLoadingZones(true);
      const data = await getZonesByExpoId(expoId);
      setZones(data);
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setLoadingZones(false);
    }
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, thumbnail: 'กรุณาเลือกไฟล์รูปภาพ' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, thumbnail: 'ไฟล์รูปภาพต้องไม่เกิน 5MB' });
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Clear error
    const newErrors = { ...errors };
    delete newErrors.thumbnail;
    setErrors(newErrors);
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.booth_no || !formData.booth_no.trim()) {
      newErrors.booth_no = 'กรุณาระบุเลขที่บูธ';
    }

    if (!formData.type) {
      newErrors.type = 'กรุณาเลือกประเภทบูธ';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    // Phone validation
    if (formData.tel && !/^[0-9]{9,10}$/.test(formData.tel.replace(/-/g, ''))) {
      newErrors.tel = 'เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)';
    }

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

      // Prepare update data
      const updateData: UpdateBoothRequest = {
        booth_no: formData.booth_no,
        type: formData.type,
        price: formData.price || '0',
        status: formData.status || 'available',
        title: formData.title || null,
        detail: formData.detail || null,
        company: formData.company || null,
        hall: formData.hall || null,
        zone_id: formData.zone_id || '',
        email: formData.email || null,
        tel: formData.tel || null,
        website1: formData.website1 || null,
        website2: formData.website2 || null,
      };

      // If thumbnail file is selected, upload it first
      if (thumbnailFile) {
        console.log('📸 Uploading thumbnail...');
        await updateBoothWithThumbnail(expoId, booth.booth_id, thumbnailFile, updateData);
      } else {
        console.log('📝 Updating booth without thumbnail...');
        await updateBooth(expoId, booth.booth_id, updateData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to update booth:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขบูธ');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current thumbnail URL
  const currentThumbnailUrl = booth.thumbnail ? getMinioFileUrl(booth.thumbnail) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขบูธ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพบูธ
            </label>
            
            {/* Preview */}
            <div className="mb-3">
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : currentThumbnailUrl ? (
                <img
                  src={currentThumbnailUrl}
                  alt="Current"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full max-w-md h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p className="text-sm">ยังไม่มีรูปภาพ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <label
                htmlFor="thumbnail"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>เลือกรูปภาพ</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">รองรับไฟล์: JPG, PNG, GIF (สูงสุด 5MB)</p>
            </div>

            {errors.thumbnail && (
              <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>
            )}
          </div>

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
              ข้อมูลพื้นฐาน
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Booth No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลขที่บูธ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.booth_no}
                  onChange={(e) => setFormData({ ...formData, booth_no: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.booth_no ? 'border-red-500' : 'border-gray-300'
                  } focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition`}
                  placeholder="เช่น A-101"
                />
                {errors.booth_no && (
                  <p className="mt-1 text-sm text-red-500">{errors.booth_no}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภท <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as BoothType })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  } focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition`}
                >
                  <option value="">เลือกประเภท</option>
                  {BOOTH_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อบูธ
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                placeholder="ชื่อบูธ (ถ้ามี)"
              />
            </div>

            {/* Price & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition`}
                  placeholder="0.00"
                />
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                >
                  <option value="available">ว่าง (เปิดรับคำขอ)</option>
                  <option value="unavailable">ไม่เปิดรับ (เชิญได้อย่างเดียว)</option>
                  <option value="pending">รอชำระเงิน</option>
                  <option value="reserved">จองแล้ว</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
              สถานที่
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hall */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ฮอลล์
                </label>
                <input
                  type="text"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                  placeholder="เช่น Hall A, ฮอลล์ 1"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  โซน
                </label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                  disabled={loadingZones}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition disabled:bg-gray-100"
                >
                  <option value="">-- ไม่ระบุโซน --</option>
                  {zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.title}
                    </option>
                  ))}
                </select>
                {loadingZones && (
                  <p className="mt-1 text-xs text-gray-500">กำลังโหลดโซน...</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Company & Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
              บริษัทและรายละเอียด
            </h3>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อบริษัท/องค์กร
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                placeholder="ชื่อบริษัทหรือองค์กร"
              />
            </div>

            {/* Detail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียด
              </label>
              <textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition resize-none"
                placeholder="รายละเอียดเกี่ยวกับบูธ..."
              />
            </div>
          </div>

          {/* Section 4: Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-200 pb-2">
              ข้อมูลติดต่อ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Tel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.tel ? 'border-red-500' : 'border-gray-300'
                  } focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition`}
                  placeholder="0812345678"
                />
                {errors.tel && (
                  <p className="mt-1 text-sm text-red-500">{errors.tel}</p>
                )}
              </div>
            </div>

            {/* Websites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เว็บไซต์ 1
                </label>
                <input
                  type="url"
                  value={formData.website1}
                  onChange={(e) => setFormData({ ...formData, website1: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เว็บไซต์ 2
                </label>
                <input
                  type="url"
                  value={formData.website2}
                  onChange={(e) => setFormData({ ...formData, website2: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/20 focus:outline-none transition"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึก</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}