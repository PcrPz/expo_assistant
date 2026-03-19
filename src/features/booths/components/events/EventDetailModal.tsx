// src/features/booths/components/events/EventDetailModal.tsx
'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Building2, Mail, Phone, Globe, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BoothEventDetail } from '../../types/event.types';
import { deleteBoothEvent } from '../../api/eventApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

interface EventDetailModalProps {
  event: BoothEventDetail;
  expoID: string;
  boothID: string;
  open: boolean;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

function formatDateTimeTH(dateString: string): string {
  return new Date(dateString).toLocaleString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function EventDetailModal({
  event,
  expoID,
  boothID,
  open,
  canManage,
  onClose,
  onEdit,
  onRefresh,
}: EventDetailModalProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPicIndex, setCurrentPicIndex] = useState(0);

  const allPics = [
    ...(event.Thumbnail ? [event.Thumbnail] : []),
    ...event.EventPics.filter((p) => p !== event.Thumbnail),
  ];

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBoothEvent(expoID, boothID, event.EventID);
      alert('ลบกิจกรรมสำเร็จ');
      onRefresh();
      onClose();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบกิจกรรมได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          
          {/* Blue Header */}
          <div className="relative bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] px-6 py-5 flex-shrink-0">
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white line-clamp-1">{event.Title}</h2>
                  <p className="text-white/70 text-xs mt-0.5">รายละเอียดกิจกรรม</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-5 space-y-5">

            {/* Image Gallery */}
            {allPics.length > 0 && (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                  <img src={getMinioFileUrl(allPics[currentPicIndex]) || undefined} alt="event" className="w-full h-full object-cover" />
                  {allPics.length > 1 && (
                    <>
                      <button onClick={() => setCurrentPicIndex((i) => (i - 1 + allPics.length) % allPics.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentPicIndex((i) => (i + 1) % allPics.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allPics.map((_, i) => (
                          <button key={i} onClick={() => setCurrentPicIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentPicIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {allPics.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allPics.map((pic, i) => (
                      <button key={i} onClick={() => setCurrentPicIndex(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentPicIndex ? 'border-[#3674B5]' : 'border-gray-200 opacity-60'}`}>
                        <img src={getMinioFileUrl(pic) || undefined} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="bg-[#EBF3FC] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="w-5 h-5 text-[#3674B5] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">เริ่มต้น</p>
                  <p>{formatDateTimeTH(event.StartDate)}</p>
                </div>
              </div>
              <div className="border-t border-blue-100" />
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-5 h-5 text-[#3674B5] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">สิ้นสุด</p>
                  <p>{formatDateTimeTH(event.EndDate)}</p>
                </div>
              </div>
            </div>

            {/* Detail */}
            {event.Detail && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900">รายละเอียด</h4>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{event.Detail}</p>
              </div>
            )}

            {/* Contact Info */}
            {(event.Company || event.Email || event.Tel || event.Website1 || event.Website2) && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900">ข้อมูลติดต่อ</h4>
                <div className="space-y-2">
                  {event.Company && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-[#3674B5] flex-shrink-0" />
                      <span>{event.Company}</span>
                    </div>
                  )}
                  {event.Email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-[#3674B5] flex-shrink-0" />
                      <a href={`mailto:${event.Email}`} className="hover:text-[#3674B5] transition-colors">{event.Email}</a>
                    </div>
                  )}
                  {event.Tel && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-[#3674B5] flex-shrink-0" />
                      <a href={`tel:${event.Tel}`} className="hover:text-[#3674B5] transition-colors">{event.Tel}</a>
                    </div>
                  )}
                  {event.Website1 && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-[#3674B5] flex-shrink-0" />
                      <a href={event.Website1} target="_blank" rel="noopener noreferrer" className="hover:text-[#3674B5] transition-colors truncate">{event.Website1}</a>
                    </div>
                  )}
                  {event.Website2 && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-[#3674B5] flex-shrink-0" />
                      <a href={event.Website2} target="_blank" rel="noopener noreferrer" className="hover:text-[#3674B5] transition-colors truncate">{event.Website2}</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              ปิด
            </button>
            {canManage && (
              <>
                <button onClick={onEdit}
                  className="flex-1 py-2.5 rounded-xl bg-[#FEF3C7] text-amber-600 text-sm font-semibold hover:bg-amber-100 transition flex items-center justify-center gap-2 border border-amber-200">
                  <Edit2 className="w-4 h-4" />
                  แก้ไข
                </button>
                <button onClick={() => setShowDeleteModal(true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2 border border-red-200">
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">ลบกิจกรรม?</h3>
                  <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700">คุณต้องการลบกิจกรรม <span className="font-semibold">"{event.Title}"</span> หรือไม่?</p>
              <p className="text-sm text-gray-500 mt-3 bg-red-50 border border-red-100 rounded-xl p-3">⚠️ กิจกรรมจะถูกลบอย่างถาวร</p>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-3xl">
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting}
                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium disabled:opacity-50">ยกเลิก</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium disabled:opacity-50">
                {isDeleting ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />กำลังลบ...</span> : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}