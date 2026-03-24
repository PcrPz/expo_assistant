// src/features/booths/components/announcements/EditAnnouncementModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { X, Trash2, RotateCcw, Megaphone } from 'lucide-react';
import { updateBoothAnnouncement } from '../../api/announcementApi';

import type { BoothAnnouncementDetail } from '../../types/announcement.types';
import { getAnnouncementImageUrl } from '../../utils/annoucement-helper';

interface EditAnnouncementModalProps {
  expoID: string;
  boothID: string;
  announcement: BoothAnnouncementDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditAnnouncementModal({
  expoID,
  boothID,
  announcement,
  open,
  onClose,
  onSuccess,
}: EditAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.Title);
      setDetail(announcement.Detail || '');
      setNewImageFile(null);
      setDeletedPics([]);
      setError(null);
    }
  }, [announcement]);

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    setNewImageFile(file); setError(null);
    e.target.value = '';
  };

  const handleDeleteExistingPic = (picId: string) => {
    setDeletedPics((prev) => [...prev, picId]);
  };

  const handleRestoreDeletedPic = (picId: string) => {
    setDeletedPics((prev) => prev.filter((id) => id !== picId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!announcement) return;

    if (!title.trim()) {
      setError('กรุณากรอกชื่อประกาศ');
      return;
    }

    setIsLoading(true);

    try {
      await updateBoothAnnouncement(expoID, boothID, {
        noti_id: announcement.NotiID,
        title: title.trim(),
        detail: detail.trim() || undefined,
        status: announcement.Status,
        deleted_pics: deletedPics.length > 0 ? deletedPics : undefined,
        files: newImageFile ? [newImageFile] : undefined,
      });

      toast.success('แก้ไขประกาศสำเร็จ');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      toast.success('แก้ไขประกาศไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !announcement) return null;

  const existingPics = announcement.Pics.filter(
    (picId) => !deletedPics.includes(picId)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขประกาศ</h2>
                <p className="text-xs text-gray-400">แก้ไขรายละเอียดของประกาศ</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                ชื่อประกาศ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น โปรโมชั่นพิเศษ ลด 50%"
                disabled={isLoading}
                maxLength={200}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition"
              />
              <p className="text-xs text-gray-500">
                {title.length}/200 ตัวอักษร
              </p>
            </div>

            {/* Detail */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รายละเอียดประกาศ
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="เพิ่มรายละเอียดเกี่ยวกับประกาศของคุณ..."
                rows={4}
                disabled={isLoading}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none disabled:opacity-50 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                {detail.length}/1000 ตัวอักษร
              </p>
            </div>

            {/* รูปภาพ — รูปปัจจุบัน หรือ รูปใหม่ */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รูปภาพ <span className="text-xs font-normal text-gray-400">— ไม่บังคับ</span>
              </label>

              {/* แสดงรูปปัจจุบันถ้ายังไม่ได้ถูกลบและยังไม่มีรูปใหม่ */}
              {existingPics.length > 0 && !newImageFile ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer" style={{ height: '160px' }}>
                  <img src={getAnnouncementImageUrl(existingPics[0]) || ''} alt="current" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" disabled={isLoading} />
                    </label>
                    <button type="button"
                      onClick={() => handleDeleteExistingPic(existingPics[0])}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      ลบ
                    </button>
                  </div>
                </div>
              ) : newImageFile ? (
                /* รูปใหม่ที่เลือก */
                <div className="relative group rounded-xl overflow-hidden border-2 border-[#3674B5] cursor-pointer" style={{ height: '160px' }}>
                  <img src={URL.createObjectURL(newImageFile)} alt="new" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-[#3674B5] text-white text-xs px-2 py-0.5 rounded-md font-semibold">ใหม่</div>
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" disabled={isLoading} />
                    </label>
                    <button type="button" onClick={() => setNewImageFile(null)} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      ลบ
                    </button>
                  </div>
                </div>
              ) : (
                /* ไม่มีรูป — Dashed Zone */
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#B8D0EA] rounded-xl bg-gray-50 cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center" style={{ height: '160px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-sm font-medium text-gray-500">คลิกเพื่อเลือกรูปภาพ</span>
                  <span className="text-xs text-gray-400">PNG, JPG · สูงสุด 5MB</span>
                  <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" disabled={isLoading} />
                </label>
              )}

              {/* แสดงว่ารูปปัจจุบันจะถูกลบ */}
              {deletedPics.length > 0 && !newImageFile && (
                <div className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">รูปเดิมจะถูกลบออก</p>
                  <button type="button" onClick={() => handleRestoreDeletedPic(deletedPics[0])}
                    className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> กู้คืน
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Actions - สีจาง */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
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
                  <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการแก้ไข'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}