// src/features/booths/components/events/EventCard.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { Edit2, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { deleteBoothEvent } from '../../api/eventApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { BoothEvent } from '../../types/event.types';

interface EventCardProps {
  event: BoothEvent;
  canManage: boolean;
  expoID: string;
  boothID: string;
  onView: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}



function getEventStatus(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > now) return { label: 'กำลังจะมาถึง', color: 'bg-blue-500' };
  if (end < now)   return { label: 'ผ่านไปแล้ว',   color: 'bg-gray-400' };
  return            { label: 'กำลังดำเนินการ',      color: 'bg-emerald-500' };
}

function formatDateTH(dateString: string): string {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeTH(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventCard({
  event,
  canManage,
  expoID,
  boothID,
  onView,
  onEdit,
  onRefresh,
}: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const thumbnailUrl = event.Thumbnail ? getMinioFileUrl(event.Thumbnail) : null;
  const status = getEventStatus(event.StartDate, event.EndDate);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBoothEvent(expoID, boothID, event.EventID);
      toast.success('ลบกิจกรรมสำเร็จ');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบกิจกรรมได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        onClick={onView}
        className="group relative bg-white rounded-2xl overflow-hidden border-[1.5px] border-[#E2E8F0] hover:border-[#3674B5] transition-colors cursor-pointer"
      >
        {/* Thumbnail / Blue Header */}
        <div className="relative h-28 overflow-hidden">
          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${status.color} text-white rounded-full text-xs font-semibold shadow-md`}>
              {status.label === 'กำลังดำเนินการ' && (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              )}
              {status.label}
            </div>
          </div>

          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={event.Title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] flex items-center justify-center">
              {/* Calendar icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
          )}
          {/* Overlay gradient */}
          {thumbnailUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          )}
          {/* Decorative circles when no thumbnail */}
          {!thumbnailUrl && (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
            {event.Title}
          </h3>

          {/* Dates */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#3674B5]" />
              <span>{formatDateTH(event.StartDate)}</span>
              <span className="text-gray-300">–</span>
              <span>{formatDateTH(event.EndDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatTimeTH(event.StartDate)} – {formatTimeTH(event.EndDate)}</span>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#EBF3FC] text-[#3674B5] rounded-[9px] text-[12px] font-semibold hover:bg-[#DBEAFE] transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ดูรายละเอียด</span>
            </button>

            {canManage && (
              <>
                <button
                  onClick={handleEdit}
                  className="w-8 h-8 bg-[#FEF3C7] text-amber-600 rounded-[9px] flex items-center justify-center hover:bg-amber-100 transition flex-shrink-0"
                  title="แก้ไข"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-[9px] flex items-center justify-center hover:bg-red-100 transition disabled:opacity-50 flex-shrink-0"
                  title="ลบ"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hover border */}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">ลบกิจกรรม</h3>
                  <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                คุณต้องการลบกิจกรรม{' '}
                <span className="font-semibold text-gray-900">"{event.Title}"</span> หรือไม่?
              </p>
              <p className="text-sm text-gray-500 mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                ⚠️ กิจกรรมนี้จะถูกลบออกจากระบบอย่างถาวร
              </p>
            </div>
            <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                    กำลังลบ...
                  </span>
                ) : (
                  'ยืนยันลบ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}