// src/features/events/components/create/BasicInfoForm.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import type { CreateEventRequest } from '../../types/event.types';
import { EVENT_CATEGORIES } from '../../constants/categories';

interface BasicInfoFormProps {
  formData: CreateEventRequest;
  onChange: (updates: Partial<CreateEventRequest>) => void;
  onNext: () => void;
}

export default function BasicInfoForm({ formData, onChange, onNext }: BasicInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (formData.logoFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.logoFile);
    }
    
    if (formData.bannerFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(formData.bannerFile);
    }
  }, [formData.logoFile, formData.bannerFile]);

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (field: 'logoFile' | 'bannerFile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.warning('กรุณาเลือกไฟล์ภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      
      handleChange(field, file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (field === 'logoFile') {
            setLogoPreview(reader.result as string);
          } else {
            setBannerPreview(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } else {
        if (field === 'logoFile') {
          setLogoPreview(null);
        } else {
          setBannerPreview(null);
        }
      }
    }
  };

  const handleRemoveImage = (field: 'logoFile' | 'bannerFile') => {
    handleChange(field, undefined);
    if (field === 'logoFile') {
      setLogoPreview(null);
    } else {
      setBannerPreview(null);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'กรุณากรอกชื่องาน';
    if (!formData.category) newErrors.category = 'กรุณาเลือกประเภทงาน';
    if (!formData.startDate) newErrors.startDate = 'กรุณาเลือกวันที่เริ่มต้น';
    if (!formData.endDate) newErrors.endDate = 'กรุณาเลือกวันที่สิ้นสุด';
    if (!formData.startTime) newErrors.startTime = 'กรุณาเลือกเวลาเปิดงาน';
    if (!formData.endTime) newErrors.endTime = 'กรุณาเลือกเวลาปิดงาน';
    if (!formData.location?.trim()) newErrors.location = 'กรุณากรอกสถานที่';
    if (!formData.organizer?.trim()) newErrors.organizer = 'กรุณากรอกชื่อผู้จัดงาน';
    if (!formData.email?.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!formData.tel?.trim()) newErrors.tel = 'กรุณากรอกเบอร์โทร';
    if (!formData.description?.trim()) newErrors.description = 'กรุณากรอกรายละเอียด';
    if (!formData.logoFile) newErrors.logoFile = 'กรุณาเลือกรูปภาพโปรโมท';
    if (!formData.bannerFile) newErrors.bannerFile = 'กรุณาเลือกแผนผังงาน';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    } else {
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">ข้อมูลพื้นฐาน</h2>
        <p className="text-sm text-gray-500 text-center">กรอกรายละเอียดงาน Expo ของคุณ</p>
      </div>

      {/* ข้อมูลงาน */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">1</div>
          <span>ข้อมูลงาน</span>
        </h3>

        <div className="grid grid-cols-1 gap-6 pl-10">
          {/* ชื่องาน */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่องาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="เช่น Future Expo 2025"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* ประเภท */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทของงาน <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">เลือกประเภทงาน</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.category}
              </p>
            )}
          </div>

          {/* วันที่และเวลา */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.endDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เวลาเปิดงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เวลาปิดงาน <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* สถานที่ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานที่จัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="เช่น ศูนย์การประชุมแห่งชาติสิริกิติ์"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.location && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.location}
              </p>
            )}
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดงาน <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="อธิบายรายละเอียดของงาน Expo"
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ข้อมูลติดต่อ */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">2</div>
          <span>ข้อมูลผู้จัด</span>
        </h3>

        <div className="grid grid-cols-1 gap-6 pl-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้จัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.organizer || ''}
              onChange={(e) => handleChange('organizer', e.target.value)}
              placeholder="เช่น บริษัท Future Events จำกัด"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                errors.organizer ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.organizer && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {errors.organizer}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@example.com"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทร <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.tel || ''}
                onChange={(e) => handleChange('tel', e.target.value)}
                placeholder="0812345678"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] transition ${
                  errors.tel ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.tel && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {errors.tel}
              </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* รูปภาพ */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3674B5] text-white rounded-lg flex items-center justify-center text-sm font-bold">3</div>
          <span>รูปภาพ</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-10">
          {/* รูปโปรโมท */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพโปรโมท <span className="text-red-500">*</span>
            </label>
            
            {logoPreview ? (
              <div className="relative group">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={logoPreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-600 truncate flex-1">
                    {formData.logoFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('logoFile')}
                    className="ml-2 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('logoFile', e)}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    errors.logoFile 
                      ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#3674B5]'
                  }`}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={errors.logoFile ? '#DC2626' : '#9CA3AF'} strokeWidth="1.5" className="mb-3">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p className={`text-sm font-medium mb-1 ${errors.logoFile ? 'text-red-600' : 'text-gray-700'}`}>
                    เลือกรูปโปรโมท
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (สูงสุด 5MB)</p>
                </label>
                {errors.logoFile && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.logoFile}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* แผนผัง */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              แผนผังงาน <span className="text-red-500">*</span>
            </label>
            
            {bannerPreview ? (
              <div className="relative group">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={bannerPreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-600 truncate flex-1">
                    {formData.bannerFile?.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage('bannerFile')}
                    className="ml-2 px-3 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange('bannerFile', e)}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    errors.bannerFile 
                      ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#3674B5]'
                  }`}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={errors.bannerFile ? '#DC2626' : '#9CA3AF'} strokeWidth="1.5" className="mb-3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                  <p className={`text-sm font-medium mb-1 ${errors.bannerFile ? 'text-red-600' : 'text-gray-700'}`}>
                    เลือกแผนผังงาน
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG (สูงสุด 5MB)</p>
                </label>
                {errors.bannerFile && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {errors.bannerFile}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-6 flex justify-end border-t border-gray-200">
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center gap-2"
        >
          <span>ดำเนินการต่อ</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </form>
  );
}