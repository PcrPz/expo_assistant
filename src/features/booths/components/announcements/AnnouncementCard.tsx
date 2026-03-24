// src/features/booths/components/announcements/AnnouncementCard.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { Megaphone, Edit2, Trash2, Eye, Calendar } from 'lucide-react';
import { deleteBoothAnnouncement } from '../../api/announcementApi';
import type { BoothAnnouncement } from '../../types/announcement.types';

interface AnnouncementCardProps {
  announcement: BoothAnnouncement;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  expoId: string;
  boothId: string;
}

export function AnnouncementCard({
  announcement,
  canManage,
  onView,
  onEdit,
  onRefresh,
  expoId,
  boothId,
}: AnnouncementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      await deleteBoothAnnouncement(expoId, boothId, announcement.NotiID);
      toast.success('ลบประกาศสำเร็จ');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบประกาศได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isPublished = announcement.Status === 'publish';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Card with Blue Theme */}
      <div 
        onClick={onView}
        className="group relative bg-white rounded-2xl overflow-hidden border-[1.5px] border-[#E2E8F0] hover:border-[#3674B5] transition-colors cursor-pointer"
      >
        {/* Status Ribbon */}
        <div className="absolute top-3 right-3 z-10">
          {isPublished ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-md">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              เผยแพร่
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-xs font-semibold shadow-md">
              ฉบับร่าง
            </div>
          )}
        </div>

        {/* Top Section - Blue Gradient */}
        <div className="relative h-20 bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] p-4">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Megaphone className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Content Section */}
        <div className="p-3 space-y-2.5">
          {/* Title */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
              {announcement.Title}
            </h3>
          </div>

          {/* Date */}
          {announcement.PublishAt && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(announcement.PublishAt)}</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Action Buttons */}
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
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hover Effect Border */}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">ลบประกาศ</h3>
                  <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700">
                คุณต้องการลบประกาศ <span className="font-semibold text-gray-900">"{announcement.Title}"</span> หรือไม่?
              </p>
              <p className="text-sm text-gray-500 mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                ⚠️ ประกาศนี้จะถูกลบออกจากระบบอย่างถาวร
              </p>
            </div>

            {/* ✅ Actions - สีจาง */}
            <div className="px-5 py-[18px] border-t border-gray-100 flex gap-3">
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
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin"></div>
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