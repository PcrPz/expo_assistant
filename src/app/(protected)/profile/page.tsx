// src/app/(protected)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/store/authStore';
import { updateUser, getUserDetail } from '@/src/features/auth/api/authApi';
import { getProfilePicUrl } from '@/src/features/minio/api/minioApi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    tel: '',
    dob: '',
    gender: '',
    career: '',
    company: '',
    detail: '',
    profile_pic: undefined as File | undefined,
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // ข้อมูลเดือนสำหรับแสดงผล
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // โหลดข้อมูล User เมื่อ Component mount
  useEffect(() => {
    if (user) {
      
      // ✅ ดึง DOB จาก Backend (ถ้ามี)
      const dob = (user as any).DOB || (user as any).Dob || (user as any).dob || '';
      

      setFormData({
        firstname: user.Firstname || '',
        lastname: user.Lastname || '',
        email: user.Email || '',
        tel: user.Tel || '',
        dob: dob || '', // ✅ เก็บเป็น YYYY-MM-DD ตรงๆ
        gender: user.Gender || '',
        career: user.Career || '',
        company: user.Company || '',
        detail: user.Detail || '',
        profile_pic: undefined,
      });
      
    }
  }, [user]);

  const profilePicUrl = getProfilePicUrl(user?.ProfilePic);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview รูปภาพ
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      handleChange('profile_pic', file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // ✅ เช็ค Token ก่อน
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('กรุณา Login ใหม่');
        router.push('/login');
        return;
      }

      await updateUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        tel: formData.tel,
        gender: formData.gender,
        dob: formData.dob || undefined, // ✅ ส่ง dob ตรงๆ
        career: formData.career || undefined,
        company: formData.company || undefined,
        detail: formData.detail || undefined,
        profile_pic: formData.profile_pic,
      });

      // โหลดข้อมูล User ใหม่
      const updatedUser = await getUserDetail();
      setUser(updatedUser);


      setIsEditing(false);
      setPreviewImage(null);
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      
      // ✅ จัดการ Error แยกตาม Status Code
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
  
        router.push('/login');
      } else if (error.message?.includes('400')) {
  
      } else {
  
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.password) {
      setPasswordError('กรุณากรอกรหัสผ่านใหม่');
      return;
    }
    if (passwordData.password.length < 6) {
      setPasswordError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (passwordData.password !== passwordData.confirm_password) {
      setPasswordError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsSavingPassword(true);
    try {
      await updateUser({
        firstname: formData.firstname || user?.Firstname || '',
        lastname:  formData.lastname  || user?.Lastname  || '',
        email:     formData.email     || user?.Email     || '',
        tel:       formData.tel       || user?.Tel       || '',
        gender:    formData.gender    || user?.Gender    || '',
        password:         passwordData.password,
        confirm_password: passwordData.confirm_password,
      });
      setPasswordSuccess('เปลี่ยนรหัสผ่านสำเร็จ');
      setPasswordData({ password: '', confirm_password: '' });
    } catch (error: any) {
      if (error.message?.includes('401')) {
        setPasswordError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
        router.push('/login');
      } else {
        setPasswordError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    if (user) {
      const dob = (user as any).DOB || (user as any).Dob || (user as any).dob || '';

      setFormData({
        firstname: user.Firstname || '',
        lastname: user.Lastname || '',
        email: user.Email || '',
        tel: user.Tel || '',
        dob: dob || '',
        gender: user.Gender || '',
        career: user.Career || '',
        company: user.Company || '',
        detail: user.Detail || '',
        profile_pic: undefined,
      });
    }
    setPreviewImage(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4A8BC2] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-[#4A8BC2] via-[#5B9BD5] to-[#4A8BC2]">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Profile Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="relative -mt-32 bg-white rounded-2xl shadow-xl p-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {(previewImage || profilePicUrl) ? (
                  <img
                    src={previewImage || profilePicUrl!}
                    alt={user.Firstname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-4xl">
                    {user.Firstname?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              {/* Edit Photo Overlay */}
              {isEditing && (
                <label
                  htmlFor="profile-pic-input"
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="text-center text-white">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mx-auto mb-1"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span className="text-xs">เปลี่ยนรูป</span>
                  </div>
                  <input
                    id="profile-pic-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900 mt-4">
              {user.Firstname} {user.Lastname}
            </h1>
            
            {/* Role Badge */}
            <div className="mt-2 px-4 py-1.5 bg-blue-100 text-[#4A8BC2] rounded-full text-sm font-semibold">
              {user.Role || 'User'}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditing && (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#4A8BC2] text-white font-semibold rounded-lg hover:bg-[#3A7AB2] transition shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                แก้ไขโปรไฟล์
              </button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={formData.firstname}
                  onChange={(e) => handleChange('firstname', e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                  placeholder="ชื่อ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => handleChange('lastname', e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                * อีเมลไม่สามารถเปลี่ยนได้
              </p>
            </div>

            {/* Tel & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทร
                </label>
                <input
                  type="tel"
                  value={formData.tel}
                  onChange={(e) => handleChange('tel', e.target.value)}
                  disabled={!isEditing}
                  maxLength={10}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                  placeholder="0812345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เพศ
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
            </div>

            {/* Career & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อาชีพ
                </label>
                <input
                  type="text"
                  value={formData.career}
                  onChange={(e) => handleChange('career', e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                  placeholder="อาชีพ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  บริษัท
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  disabled={!isEditing}
                  className={`
                    w-full px-4 py-3 border rounded-lg
                    ${isEditing 
                      ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                    }
                  `}
                  placeholder="บริษัท"
                />
              </div>
            </div>

            {/* About / Detail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เกี่ยวกับคุณ
              </label>
              <textarea
                value={formData.detail}
                onChange={(e) => handleChange('detail', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className={`
                  w-full px-4 py-3 border rounded-lg resize-none
                  ${isEditing 
                    ? 'border-gray-300 focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent' 
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                  }
                `}
                placeholder="เขียนบางอย่างเกี่ยวกับตัวคุณ..."
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-3 bg-[#4A8BC2] text-white font-semibold rounded-lg hover:bg-[#3A7AB2] transition shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      บันทึก
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">เปลี่ยนรหัสผ่าน</h2>

          <div className="space-y-4">
            {/* Error */}
            {passwordError && (
              <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{passwordError}</p>
              </div>
            )}
            {/* Success */}
            {passwordSuccess && (
              <div className="p-3.5 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-sm text-green-600 font-medium">{passwordSuccess}</p>
              </div>
            )}

            {/* รหัสผ่านใหม่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.password}
                  onChange={e => {
                    setPasswordData(p => ({ ...p, password: e.target.value }));
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent"
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* ยืนยันรหัสผ่านใหม่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={e => {
                    setPasswordData(p => ({ ...p, confirm_password: e.target.value }));
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A8BC2] focus:border-transparent"
                  placeholder="ยืนยันรหัสผ่านใหม่"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* match indicator */}
              {passwordData.confirm_password && (
                <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${passwordData.password === passwordData.confirm_password ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordData.password === passwordData.confirm_password
                    ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>รหัสผ่านตรงกัน</>
                    : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>รหัสผ่านไม่ตรงกัน</>
                  }
                </p>
              )}
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={isSavingPassword}
              className="w-full px-6 py-3 bg-[#4A8BC2] text-white font-semibold rounded-lg hover:bg-[#3A7AB2] transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSavingPassword ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังบันทึก...</>
              ) : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}