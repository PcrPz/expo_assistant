// src/features/booths/components/announcements/CreateAnnouncementModal.tsx
'use client';

import { useState } from 'react';
import { X, Plus, Info } from 'lucide-react';
import { createBoothAnnouncement } from '../../api/announcementApi';

interface CreateAnnouncementModalProps {
  expoID: string;
  boothID: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAnnouncementModal({
  expoID,
  boothID,
  open,
  onClose,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    setImageFile(file); setError(null);
    e.target.value = '';
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!title.trim()) {
    setError('กรุณากรอกชื่อประกาศ');
    return;
  }

  setIsLoading(true);

  try {
    await createBoothAnnouncement(expoID, boothID, { // ✅ เพิ่ม boothID เป็น parameter ตัวที่ 2
      booth_id: boothID,
      title: title.trim(),
      detail: detail.trim() || undefined,
      status: 'unpublish',
      files: imageFile ? [imageFile] : undefined,
    });

    alert('สร้างประกาศสำเร็จ');
    handleReset();
    onSuccess?.();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    alert('สร้างประกาศไม่สำเร็จ');
  } finally {
    setIsLoading(false);
  }
};

const handleReset = () => {
  setTitle('');
  setDetail('');
  setImageFile(null);   // ✅ แก้ตรงนี้
  setError(null);
};

  const handleClose = () => {
    if (!isLoading) {
      handleReset();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">สร้างประกาศใหม่</h2>
                <p className="text-xs text-gray-400">สร้างประกาศหรือโปรโมชั่นสำหรับบูธ</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto min-h-0">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
              </div>
            )}

            <div className="bg-[#EBF3FC] border border-[#BFDBFE] rounded-xl p-3.5">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#3674B5] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#3674B5]">สร้างเป็นฉบับร่าง</p>
                  <p className="text-xs text-gray-600 mt-1">
                    ประกาศจะถูกสร้างในสถานะ "ฉบับร่าง" คุณสามารถเผยแพร่ได้ภายหลัง
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">
                ชื่อประกาศ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น โปรโมชั่นพิเศษ ลด 50%"
                disabled={isLoading}
                maxLength={200}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition"
              />
              <p className="text-xs text-gray-500">{title.length}/200 ตัวอักษร</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">รายละเอียดประกาศ</label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="เพิ่มรายละเอียดเกี่ยวกับประกาศของคุณ..."
                rows={4}
                disabled={isLoading}
                maxLength={1000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 resize-none disabled:opacity-50 disabled:bg-gray-50 transition-all"
              />
              <p className="text-xs text-gray-500">{detail.length}/1,000 ตัวอักษร</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รูปภาพประกาศ 
              </label>
              {imageFile ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer" style={{ height: '160px' }}>
                  <img src={URL.createObjectURL(imageFile)} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
                    </label>
                    <button type="button" onClick={() => setImageFile(null)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      ลบ
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#B8D0EA] rounded-xl bg-gray-50 cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center disabled:opacity-50" style={{ height: '160px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-sm font-medium text-gray-500">คลิกเพื่อเลือกรูปภาพ</span>
                  <span className="text-xs text-gray-400">PNG, JPG · สูงสุด 5MB</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังสร้าง...
                </span>
              ) : (
                'สร้างประกาศ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}