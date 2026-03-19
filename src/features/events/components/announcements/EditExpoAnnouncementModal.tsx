// src/features/events/components/announcements/EditExpoAnnouncementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, RotateCcw, AlertCircle, Save } from 'lucide-react';
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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.Title);
      setDetail(announcement.Detail || '');
      setNewFiles([]); setDeletedPics([]); setError(null);
    }
  }, [announcement]);

  function handleNewFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.some(f => !f.type.startsWith('image/'))) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return;
    }
    setNewFiles(prev => [...prev, ...files]); setError(null);
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
        files: newFiles.length ? newFiles : undefined,
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

            {existingPics.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">รูปภาพปัจจุบัน ({existingPics.length})</label>
                <div className="grid grid-cols-3 gap-2">
                  {existingPics.map(picId => {
                    const url = getMinioFileUrl(picId);
                    if (!url) return null;
                    return (
                      <div key={picId} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setDeletedPics(prev => [...prev, picId])}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {deletedPics.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-red-500">รูปที่จะลบ ({deletedPics.length})</label>
                <div className="grid grid-cols-3 gap-2">
                  {deletedPics.map(picId => {
                    const url = getMinioFileUrl(picId);
                    if (!url) return null;
                    return (
                      <div key={picId} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-red-300 opacity-60">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setDeletedPics(prev => prev.filter(id => id !== picId))}
                          className="absolute top-1 right-1 w-6 h-6 bg-emerald-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">จะลบ</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">เพิ่มรูปภาพใหม่</label>
              <button type="button"
                onClick={() => document.getElementById('expo-ann-edit-file')?.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
                <Upload className="w-4 h-4" />
                เลือกรูปภาพ {newFiles.length > 0 && `(${newFiles.length} ไฟล์ใหม่)`}
              </button>
              <input id="expo-ann-edit-file" type="file" accept="image/*" multiple
                className="hidden" onChange={handleNewFileChange} disabled={isLoading} />
              {newFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {newFiles.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-emerald-300">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[10px] text-center py-0.5 font-bold">ใหม่</div>
                    </div>
                  ))}
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