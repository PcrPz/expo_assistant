// src/features/events/components/announcements/ExpoAnnouncementDetailModal.tsx
'use client';

import { useState } from 'react';
import { X, Edit2, Send, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { publishExpoAnnouncement } from '../../api/expoAnnouncementApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { ExpoAnnouncementDetail } from '../../types/expoAnnouncement.types';
import { DeleteExpoAnnouncementModal } from './DeleteExpoAnnouncementModal';


interface Props {
  announcement: ExpoAnnouncementDetail;
  expoID: string;
  canManage: boolean;
  canPublish: boolean;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ExpoAnnouncementDetailModal({
  announcement, expoID, canManage, canPublish, open, onClose, onEdit, onRefresh,
}: Props) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const isPublished = announcement.Status === 'publish';
  const pics = announcement.Pics ?? [];

  async function handlePublish() {
    setIsPublishing(true);
    try {
      await publishExpoAnnouncement(expoID, announcement.NotiID);
      onRefresh();
    } catch { alert('เผยแพร่ไม่สำเร็จ'); }
    finally { setIsPublishing(false); }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[88vh]" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPublished ? 'bg-[#EEF4FB]' : 'bg-gray-50'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={isPublished ? '#3674B5' : '#9CA3AF'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">รายละเอียดประกาศ</p>
                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />เผยแพร่แล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />ฉบับร่าง
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
            <h2 className="text-base font-bold text-gray-900 leading-snug">{announcement.Title}</h2>

            {announcement.PublishAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                เผยแพร่เมื่อ {formatDate(announcement.PublishAt)}
              </div>
            )}

            {announcement.Detail && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{announcement.Detail}</p>
              </div>
            )}

            {pics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">รูปภาพ ({pics.length})</p>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  {getMinioFileUrl(pics[imgIndex]) ? (
                    <img src={getMinioFileUrl(pics[imgIndex])!} alt="" className="w-full h-full object-cover" />
                  ) : null}
                  {pics.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex(i => (i - 1 + pics.length) % pics.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setImgIndex(i => (i + 1) % pics.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                        {pics.map((_, i) => (
                          <button key={i} onClick={() => setImgIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition ${i === imgIndex ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {pics.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {pics.map((p, i) => {
                      const url = getMinioFileUrl(p);
                      return (
                        <button key={i} onClick={() => setImgIndex(i)}
                          className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${i === imgIndex ? 'border-[#3674B5]' : 'border-transparent'}`}>
                          {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {canManage && (
            <div className="flex gap-2 px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
              {!isPublished && canPublish && (
                <button onClick={handlePublish} disabled={isPublishing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                  {isPublishing
                    ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />กำลังเผยแพร่...</>
                    : <><Send className="w-3.5 h-3.5" />เผยแพร่</>}
                </button>
              )}
              <button onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#EEF4FB] text-[#3674B5] text-sm font-semibold hover:bg-[#ddeaf5] transition">
                <Edit2 className="w-3.5 h-3.5" />แก้ไข
              </button>
              <button onClick={() => setShowDeleteModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteExpoAnnouncementModal
          expoID={expoID}
          announcement={{ NotiID: announcement.NotiID, Title: announcement.Title, Status: announcement.Status, PublishAt: announcement.PublishAt }}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => { setShowDeleteModal(false); onClose(); onRefresh(); }}
        />
      )}
    </>
  );
}