// src/features/booths/components/announcements/CreateAnnouncementModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, ImageIcon, Plus, Info } from 'lucide-react';
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
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const invalidFiles = newFiles.filter((file) => !file.type.startsWith('image/'));
      
      if (invalidFiles.length > 0) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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
      files: files.length > 0 ? files : undefined,
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
    setFiles([]);
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

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">รูปภาพประกาศ</label>
              
              <button
                type="button"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#BFDBFE] text-[#3674B5] text-sm font-semibold rounded-xl hover:bg-[#EBF3FC] hover:border-[#3674B5] transition disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                <span>เลือกรูปภาพ</span>
                {files.length > 0 && <span className="text-sm">({files.length} ไฟล์)</span>}
              </button>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              {files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="relative group rounded-2xl overflow-hidden border-2 border-blue-200 bg-gray-50"
                    >
                      <div className="aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gray-50">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">ยังไม่มีรูปภาพ</p>
                  <p className="text-xs text-gray-400">คลิกปุ่มด้านบนเพื่ออัปโหลด</p>
                </div>
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