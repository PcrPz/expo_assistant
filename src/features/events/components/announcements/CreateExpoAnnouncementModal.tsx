// src/features/events/components/announcements/CreateExpoAnnouncementModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, ImageIcon, Plus, AlertCircle } from 'lucide-react';
import { createExpoAnnouncement } from '../../api/expoAnnouncementApi';

interface Props {
  expoID: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MegaphoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
  </svg>
);

export function CreateExpoAnnouncementModal({ expoID, open, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (newFiles.some(f => !f.type.startsWith('image/'))) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น'); return;
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  }

  function reset() { setTitle(''); setDetail(''); setFiles([]); setError(null); }
  function handleClose() { if (!isLoading) { reset(); onClose(); } }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('กรุณากรอกหัวข้อประกาศ'); return; }
    setIsLoading(true);
    try {
      await createExpoAnnouncement(expoID, {
        title: title.trim(),
        detail: detail.trim() || undefined,
        status: 'unpublish',
        files: files.length ? files : undefined,
      });
      reset(); onSuccess?.();
    } catch {
      setError('สร้างประกาศไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) return null;

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
                <h3 className="text-base font-bold text-gray-900">สร้างประกาศใหม่</h3>
                <p className="text-xs text-gray-400 mt-0.5">บันทึกเป็นฉบับร่างก่อน เผยแพร่ได้ภายหลัง</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} disabled={isLoading}
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
                placeholder="เช่น ประกาศเปลี่ยนแปลงตารางเวลา"
                disabled={isLoading} maxLength={200}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors disabled:opacity-50" />
              <p className="text-xs text-gray-400 text-right">{title.length}/200</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">
                รายละเอียด <span className="text-xs font-normal text-gray-400">— ไม่บังคับ</span>
              </label>
              <textarea value={detail} onChange={e => setDetail(e.target.value)}
                placeholder="รายละเอียดของประกาศ..." rows={4}
                disabled={isLoading} maxLength={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors resize-none disabled:opacity-50" />
              <p className="text-xs text-gray-400 text-right">{detail.length}/1,000</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รูปภาพ <span className="text-xs font-normal text-gray-400">— ไม่บังคับ</span>
              </label>
              <button type="button"
                onClick={() => document.getElementById('expo-ann-create-file')?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#B8D0EA] text-[#3674B5] rounded-xl hover:bg-[#EEF4FB] text-sm font-semibold transition disabled:opacity-50">
                <Upload className="w-4 h-4" />
                เลือกรูปภาพ {files.length > 0 && `(${files.length} ไฟล์)`}
              </button>
              <input id="expo-ann-create-file" type="file" accept="image/*" multiple
                className="hidden" onChange={handleFileChange} disabled={isLoading} />

              {files.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center bg-gray-50">
                  <ImageIcon className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">ยังไม่มีรูปภาพ</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-[2] py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              {isLoading
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังสร้าง...</>
                : <><Plus className="w-4 h-4" />สร้างประกาศ</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}