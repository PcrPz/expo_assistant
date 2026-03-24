// src/features/booths/components/booth-global/EditBoothForm.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBoothGlobal, updateBoothGlobal } from '@/src/features/booths/api/boothGlobalApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

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

export function EditBoothForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [boothId, setBoothId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    detail: '',
    company: '',
    email: '',
    tel: '',
    website1: '',
    website2: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // ─── Load Existing Booth Data ─────────────────────────────────
  
  useEffect(() => {
    loadBoothData();
  }, []);

  const loadBoothData = async () => {
    try {
      setLoading(true);
      const { booth, role } = await getMyBoothGlobal();
      
      if (!booth) {
        toast.warning('ไม่พบข้อมูลบูธ');
        router.push('/booths/my-booth');
        return;
      }
      
      // Check permission
      if (role !== 'booth_group_owner') {
        toast.error('คุณไม่มีสิทธิ์แก้ไขบูธนี้');
        router.push('/booths/my-booth');
        return;
      }
      
      setBoothId(booth.id);
      setFormData({
        title: booth.title || '',
        detail: booth.detail || '',
        company: booth.company || '',
        email: booth.email || '',
        tel: booth.tel || '',
        website1: booth.website1 || '',
        website2: booth.website2 || '',
      });
      
      // Set existing image
      if (booth.profilePic) {
        setExistingImageUrl(getMinioFileUrl(booth.profilePic));
      }
      
    } catch (error) {
      console.error('Failed to load booth data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลบูธได้');
      router.push('/booths/my-booth');
    } finally {
      setLoading(false);
    }
  };

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
      toast.warning('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.warning('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }
    
    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setProfilePic(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSaving(true);
    
    try {
      await updateBoothGlobal(boothId, {
        title: formData.title,
        detail: formData.detail || undefined,
        company: formData.company,
        email: formData.email,
        tel: formData.tel.replace(/-/g, ''),
        website1: formData.website1 || undefined,
        website2: formData.website2 || undefined,
        profile_pic: profilePic || undefined,
      });
      
      toast.success('บันทึกข้อมูลสำเร็จ');
      router.push('/booths/my-booth');
      
    } catch (error: any) {
      console.error('Failed to update booth:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-12 h-12 text-[#3674B5] mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle className="opacity-25" cx="12" cy="12" r="10"/>
            <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
          </svg>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // ─── Render Form ──────────────────────────────────────────────
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* ══════ Header ══════ */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/booths/my-booth')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="font-medium">กลับหน้าบูธ</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-2xl flex items-center justify-center shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">แก้ไขบูธ</h1>
              <p className="text-gray-500 mt-1">อัปเดตข้อมูลบูธของคุณ</p>
            </div>
          </div>
        </div>

        {/* ══════ Form Card ══════ */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            <div className="p-8 space-y-8">
              
              {/* ══════ Section 1: ข้อมูลพื้นฐาน ══════ */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                  </svg>
                  ข้อมูลพื้นฐาน
                </h2>
                
                <div className="space-y-6">
                  {/* Booth Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อบูธ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange('title')}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                        errors.title
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#3674B5]'
                      } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                      placeholder="เช่น บูธสินค้าเทคโนโลยี"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
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
                      value={formData.company}
                      onChange={handleInputChange('company')}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                        errors.company
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#3674B5]'
                      } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                      placeholder="เช่น บริษัท เทคโนโลยี จำกัด"
                    />
                    {errors.company && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
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
                      <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
                    </label>
                    <textarea
                      value={formData.detail}
                      onChange={handleInputChange('detail')}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition resize-none"
                      placeholder="บอกเล่าเกี่ยวกับบูธของคุณ"
                      maxLength={500}
                    />
                    <p className="mt-2 text-xs text-gray-400">
                      {formData.detail.length}/500 ตัวอักษร
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ══════ Section 2: ข้อมูลติดต่อ ══════ */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  ข้อมูลติดต่อ
                </h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#3674B5]'
                      } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                      placeholder="example@company.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
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
                      value={formData.tel}
                      onChange={handleInputChange('tel')}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition ${
                        errors.tel
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-[#3674B5]'
                      } focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20`}
                      placeholder="0812345678"
                      maxLength={10}
                    />
                    {errors.tel && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
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

              <div className="border-t border-gray-100" />

              {/* ══════ Section 3: รูปภาพและเว็บไซต์ ══════ */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                  รูปภาพและเว็บไซต์
                </h2>
                
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      รูปโปรไฟล์บูธ
                      <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
                    </label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {(previewUrl || existingImageUrl) ? (
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg">
                          <img
                            src={previewUrl || existingImageUrl || ''}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-[#3674B5] hover:bg-blue-50/50 transition group"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="17 8 12 3 7 8"/>
                              <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-gray-700 group-hover:text-[#3674B5] transition">
                              คลิกเพื่ออัปโหลดรูปภาพใหม่
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              รองรับไฟล์ JPG, PNG (สูงสุด 5MB)
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Website 1 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เว็บไซต์ 1
                      <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
                    </label>
                    <input
                      type="url"
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
                      <span className="text-gray-400 font-normal ml-1">(ไม่บังคับ)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.website2}
                      onChange={handleInputChange('website2')}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 transition"
                      placeholder="https://www.facebook.com/example"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══════ Action Buttons ══════ */}
            <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/booths/my-booth')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 border-2 border-gray-200 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                ยกเลิก
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"/>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
                    </svg>
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    บันทึกการเปลี่ยนแปลง
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