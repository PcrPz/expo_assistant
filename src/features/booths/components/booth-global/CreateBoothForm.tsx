// src/features/booths/components/booth-global/CreateBoothForm.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBoothGlobal } from '@/src/features/booths/api/boothGlobalApi';

// ═══════════════════════════════════════════════════════════════
// Types & Validation
// ═══════════════════════════════════════════════════════════════

interface FormData {
  title: string;
  detail: string;
  company: string;
  email: string;
  tel: string;
  website1: string;
  website2: string;
}

const INIT_FORM: FormData = {
  title: '',
  detail: '',
  company: '',
  email: '',
  tel: '',
  website1: '',
  website2: '',
};

function validateForm(form: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!form.title.trim()) errors.title = 'กรุณากรอกชื่อบูธ';
  if (!form.company.trim()) errors.company = 'กรุณากรอกชื่อบริษัท/องค์กร';
  
  if (!form.email.trim()) {
    errors.email = 'กรุณากรอกอีเมล';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }
  
  if (!form.tel.trim()) {
    errors.tel = 'กรุณากรอกเบอร์โทรศัพท์';
  } else if (!/^[0-9]{10}$/.test(form.tel.replace(/-/g, ''))) {
    errors.tel = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
  }
  
  return errors;
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function CreateBoothForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>(INIT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ─── Handlers ─────────────────────────────────────────────────
  
  const handleInputChange = (field: keyof FormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfilePic(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstError = Object.keys(validationErrors)[0];
      document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);
    
    try {
      await createBoothGlobal({
        title: formData.title,
        detail: formData.detail || undefined,
        company: formData.company,
        email: formData.email,
        tel: formData.tel.replace(/-/g, ''),
        website1: formData.website1 || undefined,
        website2: formData.website2 || undefined,
        profile_pic: profilePic || undefined,
      });
      
      router.push('/booths/my-booth');
      
    } catch (error: any) {
      console.error('Failed to create booth:', error);
      alert(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* ══════ Header ══════ */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">ย้อนกลับ</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-2xl flex items-center justify-center shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">สร้างบูธของคุณ</h1>
              <p className="text-gray-500 mt-1">กรอกข้อมูลเพื่อเริ่มต้นใช้งานบูธ</p>
            </div>
          </div>
        </div>

        {/* ══════ Form Card ══════ */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            
            <div className="grid md:grid-cols-3 gap-8 p-8">
              
              {/* ══════ Left Column: Image Upload ══════ */}
              <div className="md:col-span-1">
                <div className="sticky top-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    รูปโปรไฟล์บูธ
                  </label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {previewUrl ? (
                    <div className="relative group">
                      <div className="aspect-square w-full rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          เปลี่ยน
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          ลบ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-2xl hover:border-[#3674B5] hover:bg-blue-50/50 transition group flex flex-col items-center justify-center gap-4 p-6"
                    >
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="M21 15l-5-5L5 21"/>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 group-hover:text-[#3674B5] transition mb-1">
                          อัปโหลดรูปภาพ
                        </p>
                        <p className="text-xs text-gray-400">
                          JPG, PNG (สูงสุด 5MB)
                        </p>
                      </div>
                    </button>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    รูปโปรไฟล์ช่วยให้บูธของคุณน่าสนใจมากขึ้น
                  </p>
                </div>
              </div>

              {/* ══════ Right Column: Form Fields ══════ */}
              <div className="md:col-span-2 space-y-8">
                
                {/* Section 1: ข้อมูลพื้นฐาน */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    ข้อมูลพื้นฐาน
                  </h2>
                  
                  <div className="space-y-5 mt-5">
                    {/* Booth Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ชื่อบูธ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange('title')}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                          errors.title
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#3674B5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                        placeholder="เช่น บูธสินค้าเทคโนโลยี"
                      />
                      {errors.title && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ชื่อบริษัท / องค์กร <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange('company')}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                          errors.company
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#3674B5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                        placeholder="เช่น บริษัท เทคโนโลยี จำกัด"
                      />
                      {errors.company && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {errors.company}
                        </p>
                      )}
                    </div>

                    {/* Detail */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        รายละเอียดบูธ
                        <span className="text-gray-400 font-normal text-xs ml-2">(ไม่บังคับ)</span>
                      </label>
                      <textarea
                        name="detail"
                        value={formData.detail}
                        onChange={handleInputChange('detail')}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition resize-none"
                        placeholder="บอกเล่าเกี่ยวกับบูธของคุณ..."
                        maxLength={500}
                      />
                      <p className="mt-1.5 text-xs text-gray-400 text-right">
                        {formData.detail.length}/500
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: ข้อมูลติดต่อ */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    ข้อมูลติดต่อ
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-5 mt-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        อีเมล <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#3674B5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                        placeholder="example@company.com"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="tel"
                        value={formData.tel}
                        onChange={handleInputChange('tel')}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                          errors.tel
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:border-[#3674B5]'
                        } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                        placeholder="0812345678"
                        maxLength={10}
                      />
                      {errors.tel && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          {errors.tel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: เว็บไซต์ */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    เว็บไซต์
                    <span className="text-sm font-normal text-gray-400">(ไม่บังคับ)</span>
                  </h2>
                  
                  <div className="space-y-5 mt-5">
                    {/* Website 1 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        เว็บไซต์ 1
                      </label>
                      <input
                        type="url"
                        name="website1"
                        value={formData.website1}
                        onChange={handleInputChange('website1')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition"
                        placeholder="https://www.example.com"
                      />
                    </div>

                    {/* Website 2 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        เว็บไซต์ 2
                      </label>
                      <input
                        type="url"
                        name="website2"
                        value={formData.website2}
                        onChange={handleInputChange('website2')}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition"
                        placeholder="https://www.facebook.com/example"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ Action Buttons ══════ */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-8 py-6 flex items-center justify-between border-t-2 border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 border-2 border-gray-200 transition shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"/>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
                    </svg>
                    กำลังสร้างบูธ...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    สร้างบูธ
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}