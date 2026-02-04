// src/features/booths/components/announcements/AnnouncementCard.tsx
'use client';

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
      alert('ลบประกาศสำเร็จ');
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบประกาศได้');
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
        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
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
        <div className="relative h-28 bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] p-5">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
              <Megaphone className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#3674B5] transition-colors">
              {announcement.Title}
            </h3>
          </div>

          {/* Date */}
          {announcement.PublishAt && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(announcement.PublishAt)}</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3674B5] text-white rounded-xl font-medium hover:bg-[#2d5d96] transition-all shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span>ดูรายละเอียด</span>
            </button>

            {canManage && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center w-11 h-11 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                  title="แก้ไข"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex items-center justify-center w-11 h-11 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="ลบ"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#749BC2] rounded-2xl transition-colors pointer-events-none"></div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900">ลบประกาศ?</h3>
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
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium transition-colors disabled:opacity-50"
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