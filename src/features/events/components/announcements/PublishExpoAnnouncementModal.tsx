// src/features/events/components/announcements/PublishExpoAnnouncementModal.tsx
'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { publishExpoAnnouncement } from '../../api/expoAnnouncementApi';
import type { ExpoAnnouncement } from '../../types/expoAnnouncement.types';

interface Props {
  expoID: string;
  announcement: ExpoAnnouncement;
  onClose: () => void;
  onSuccess: () => void;
}

export function PublishExpoAnnouncementModal({ expoID, announcement, onClose, onSuccess }: Props) {
  const [isPublishing, setIsPublishing] = useState(false);

  async function handlePublish() {
    setIsPublishing(true);
    try {
      await publishExpoAnnouncement(expoID, announcement.NotiID);
      onSuccess();
    } catch { alert('เผยแพร่ไม่สำเร็จ กรุณาลองใหม่'); }
    finally { setIsPublishing(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">เผยแพร่ประกาศ</h3>
              <p className="text-xs text-gray-400 mt-0.5">ประกาศจะแสดงให้ผู้เข้าร่วมเห็น</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isPublishing}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-[#EEF4FB] rounded-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
            เผยแพร่ <span className="font-semibold">"{announcement.Title}"</span>
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            ประกาศนี้จะแสดงให้ผู้เข้าร่วมงานเห็นทันที<br/>หลังจากเผยแพร่แล้ว
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100">
          <button onClick={onClose} disabled={isPublishing}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={handlePublish} disabled={isPublishing}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
            {isPublishing
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังเผยแพร่...</>
              : <><Send className="w-3.5 h-3.5" />เผยแพร่ประกาศ</>}
          </button>
        </div>
      </div>
    </div>
  );
}