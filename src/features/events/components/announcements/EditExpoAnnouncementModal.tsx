// src/features/events/components/announcements/EditExpoAnnouncementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw, AlertCircle, Save } from 'lucide-react';
import { updateExpoAnnouncement } from '../../api/expoAnnouncementApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { ExpoAnnouncementDetail } from '../../types/expoAnnouncement.types';

interface Props {
  expoID: string;
  announcement: ExpoAnnouncementDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MegaphoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

export function EditExpoAnnouncementModal({ expoID, announcement, open, onClose, onSuccess }: Props) {
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
      setNewImageFile(null); setDeletedPics([]); setError(null);
    }
  }, [announcement]);

  function handleNewFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return; }
    setNewImageFile(file); setError(null);
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!announcement) return;
    if (!title.trim()) { setError('กรุณากรอกหัวข้อประกาศ'); return; }
    setIsLoading(true);
    try {
      await updateExpoAnnouncement(expoID, {
        noti_id: announcement.NotiID,
        title: title.trim(),
        detail: detail.trim() || undefined,
        status: announcement.Status,
        deleted_pics: deletedPics.length ? deletedPics : undefined,
        files: newImageFile ? [newImageFile] : undefined,
      });
      onClose(); onSuccess?.();
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  }

  if (!open || !announcement) return null;

  const existingPics = announcement.Pics.filter(p => !deletedPics.includes(p));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[88vh]" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                <MegaphoneIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">แก้ไขประกาศ</h3>
                <p className="text-xs text-gray-400 mt-0.5 max-w-[260px] truncate">{announcement.Title}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                หัวข้อประกาศ <span className="text-red-400">*</span>
              </label>
              <input type="text" value={title}
                onChange={e => { setTitle(e.target.value); setError(null); }}
                disabled={isLoading} maxLength={200}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors disabled:opacity-50" />
              <p className="text-xs text-gray-400 text-right">{title.length}/200</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                รายละเอียด <span className="text-xs font-normal text-gray-400">— ไม่บังคับ</span>
              </label>
              <textarea value={detail} onChange={e => setDetail(e.target.value)}
                rows={4} disabled={isLoading} maxLength={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors resize-none disabled:opacity-50" />
              <p className="text-xs text-gray-400 text-right">{detail.length}/1,000</p>
            </div>

            {/* รูปภาพ */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รูปภาพ <span className="text-xs font-normal text-gray-400">— ไม่บังคับ</span>
              </label>
              {existingPics.length > 0 && !newImageFile ? (
                <div className="relative group rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer" style={{ height: '160px' }}>
                  <img src={getMinioFileUrl(existingPics[0]) || ''} alt="current" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      เปลี่ยน
                      <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" disabled={isLoading} />
                    </label>
                    <button type="button" onClick={() => setDeletedPics(prev => [...prev, existingPics[0]])} disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition disabled:opacity-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      ลบ
                    </button>
                  </div>
                </div>
              ) : newImageFile ? (
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
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#B8D0EA] rounded-xl bg-gray-50 cursor-pointer hover:border-[#3674B5] hover:bg-[#EEF4FB] transition text-center" style={{ height: '160px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-sm font-medium text-gray-500">คลิกเพื่อเลือกรูปภาพ</span>
                  <span className="text-xs text-gray-400">PNG, JPG · สูงสุด 5MB</span>
                  <input type="file" accept="image/*" onChange={handleNewFileChange} className="hidden" disabled={isLoading} />
                </label>
              )}
              {deletedPics.length > 0 && !newImageFile && (
                <div className="flex items-center justify-between px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">รูปเดิมจะถูกลบออก</p>
                  <button type="button" onClick={() => setDeletedPics([])}
                    className="text-xs text-green-600 font-semibold hover:underline flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> กู้คืน
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-[2] py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              {isLoading
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังบันทึก...</>
                : <><Save className="w-4 h-4" />บันทึกการแก้ไข</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}