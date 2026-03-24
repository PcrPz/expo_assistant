// src/features/events/components/announcements/DeleteExpoAnnouncementModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { deleteExpoAnnouncement } from '../../api/expoAnnouncementApi';
import type { ExpoAnnouncement } from '../../types/expoAnnouncement.types';

interface Props {
  expoID: string;
  announcement: ExpoAnnouncement;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteExpoAnnouncementModal({ expoID, announcement, onClose, onSuccess }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteExpoAnnouncement(expoID, announcement.NotiID);
      onSuccess();
    } catch { toast.success('ลบไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setIsDeleting(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">ลบประกาศ</h3>
              <p className="text-xs text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isDeleting}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
            ลบ <span className="font-semibold">"{announcement.Title}"</span>
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            ประกาศนี้จะถูกลบออกอย่างถาวร<br/>และไม่สามารถกู้คืนได้
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handleDelete} disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังลบ...</>
              : 'ยืนยันลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}