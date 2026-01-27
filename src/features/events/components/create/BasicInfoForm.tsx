// src/features/events/components/create/BasicInfoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import type { CreateEventRequest } from '../../types/event.types';

interface BasicInfoFormProps {
  formData: CreateEventRequest;
  onChange: (updates: Partial<CreateEventRequest>) => void;
  onNext: () => void;
}

export default function BasicInfoForm({ formData, onChange, onNext }: BasicInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // ✅ State สำหรับ Preview รูป
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const categories = [
    'อาหารและเครื่องดื่ม',
    'แฟชั่นและเครื่องประดับ',
    'เทคโนโลยีและนวัตกรรม',
    'สัตว์เลี้ยงและอุปกรณ์',
    'เด็กและครอบครัว',
    'สุขภาพและความงาม',
    'ศิลปะและหัตถกรรม',
    'การศึกษาและอาชีพ',
    'บ้านและการตกแต่ง',
    'กีฬาและนันทนาการ',
  ];

  // ✅ Load existing preview เมื่อกลับมาจาก step อื่น
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

  // ✅ แก้ไขให้มี Preview
  const handleImageChange = (field: 'logoFile' | 'bannerFile', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์ภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ไฟล์มีขนาดใหญ่เกิน 5MB');
        return;
      }
      
      handleChange(field, file);
      
      // ✅ สร้าง Preview
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
        // PDF ไม่แสดง preview
        if (field === 'logoFile') {
          setLogoPreview(null);
        } else {
          setBannerPreview(null);
        }
      }
    }
  };

  // ✅ ฟังก์ชันลบรูป
  const handleRemoveImage = (field: 'logoFile' | 'bannerFile') => {
    handleChange(field, undefined);
    if (field === 'logoFile') {
      setLogoPreview(null);
    } else {
      setBannerPreview(null);
    }
  };

  // ✅ Validation แบบเข้มงวด
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
    
    // ✅ บังคับให้มีรูป
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
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-gray-900 mb-8">กรอกข้อมูลพื้นฐาน</h2>

      <div className="space-y-6">
        {/* ชื่องาน */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ชื่องาน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="ระบุชื่องาน Expo"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* ประเภทของงาน */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ประเภทของงาน <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
          >
            <option value="">ระบุประเภทของงาน Expo</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* วันที่ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              วันที่เริ่มต้นงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              วันที่สิ้นสุด <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
          </div>
        </div>

        {/* เวลา */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              เวลาเปิดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              เวลาปิดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.endTime || ''}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
          </div>
        </div>

        {/* สถานที่ */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            สถานที่ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="ระบุสถานที่จัดงาน"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
          />
          {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
        </div>

        {/* ผู้จัดงาน */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            ผู้จัดงาน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.organizer || ''}
            onChange={(e) => handleChange('organizer', e.target.value)}
            placeholder="ระบุชื่อผู้จัดงาน"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
          />
          {errors.organizer && <p className="mt-1 text-sm text-red-500">{errors.organizer}</p>}
        </div>

        {/* อีเมล และเบอร์โทร */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              อีเมลติดต่อผู้จัดงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="กรอกอีเมลติดต่อผู้จัดงาน"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              เบอร์โทร <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.tel || ''}
              onChange={(e) => handleChange('tel', e.target.value)}
              placeholder="ระบุเบอร์โทร"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent"
            />
            {errors.tel && <p className="mt-1 text-sm text-red-500">{errors.tel}</p>}
          </div>
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            รายละเอียด <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="รายละเอียดของงาน"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B9BD5] focus:border-transparent resize-none"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* ✅ รูปภาพโปรโมทงาน - มี Preview */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            รูปภาพโปรโมทงาน <span className="text-red-500">*</span>
          </label>
          
          {logoPreview ? (
            // แสดง Preview
            <div className="relative border-2 border-[#5B9BD5] rounded-xl p-4 bg-gray-50">
              <img 
                src={logoPreview} 
                alt="Logo Preview" 
                className="w-full h-64 object-contain rounded-lg"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  📎 {formData.logoFile?.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveImage('logoFile')}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  ลบรูป
                </button>
              </div>
            </div>
          ) : (
            // Upload Zone
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#5B9BD5] transition cursor-pointer bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('logoFile', e)}
                className="hidden"
                id="promo-image"
              />
              <label htmlFor="promo-image" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="mb-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-gray-600 mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-sm text-gray-400">PNG, JPG, WEBP (สูงสุด 5MB)</p>
                </div>
              </label>
            </div>
          )}
          {errors.logoFile && <p className="mt-1 text-sm text-red-500">{errors.logoFile}</p>}
        </div>

        {/* ✅ แผนผังงาน - มี Preview */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            แผนผังงาน <span className="text-red-500">*</span>
          </label>
          
          {bannerPreview ? (
            // แสดง Preview
            <div className="relative border-2 border-[#5B9BD5] rounded-xl p-4 bg-gray-50">
              <img 
                src={bannerPreview} 
                alt="Banner Preview" 
                className="w-full h-64 object-contain rounded-lg"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  📎 {formData.bannerFile?.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveImage('bannerFile')}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  ลบรูป
                </button>
              </div>
            </div>
          ) : (
            // Upload Zone
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#5B9BD5] transition cursor-pointer bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('bannerFile', e)}
                className="hidden"
                id="layout-image"
              />
              <label htmlFor="layout-image" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="mb-4">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p className="text-gray-600 mb-1">คลิกเพื่อเลือกรูปภาพ</p>
                  <p className="text-sm text-gray-400">PNG, JPG, WEBP (สูงสุด 5MB)</p>
                </div>
              </label>
            </div>
          )}
          {errors.bannerFile && <p className="mt-1 text-sm text-red-500">{errors.bannerFile}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          className="px-12 py-4 bg-[#5B9BD5] text-white text-lg font-semibold rounded-xl hover:bg-[#4A8BC2] transition shadow-lg"
        >
          ดำเนินการต่อ
        </button>
      </div>
    </form>
  );
}