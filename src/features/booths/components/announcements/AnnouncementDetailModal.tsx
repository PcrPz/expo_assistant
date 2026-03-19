// src/features/booths/components/announcements/AnnouncementDetailModal.tsx
'use client';

import { X, Edit2, Send, Trash2, Calendar, ImageIcon, AlertCircle } from 'lucide-react';
import { 
  publishBoothAnnouncement,
  deleteBoothAnnouncement 
} from '../../api/announcementApi';

import type { BoothAnnouncementDetail } from '../../types/announcement.types';
import { useState } from 'react';
import { getAnnouncementImageUrl } from '../../utils/annoucement-helper';

interface AnnouncementDetailModalProps {
  announcement: BoothAnnouncementDetail;
  expoId: string;
  boothId: string;
  canManage: boolean;
  canPublish: boolean;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export function AnnouncementDetailModal({
  announcement,
  expoId,
  boothId,
  canManage,
  canPublish,
  open,
  onClose,
  onEdit,
  onRefresh,
}: AnnouncementDetailModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await publishBoothAnnouncement(expoId, boothId, announcement);
      alert('เผยแพร่ประกาศสำเร็จ');
      setShowPublishConfirm(false);
      onRefresh();
    } catch (error) {
      alert('ไม่สามารถเผยแพร่ประกาศได้');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBoothAnnouncement(expoId, boothId, announcement.NotiID);
      alert('ลบประกาศสำเร็จ');
      onClose();
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบประกาศได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isPublished = announcement.Status === 'publish';

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 line-clamp-1">{announcement.Title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {isPublished ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>เผยแพร่แล้ว
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-gray-400">ฉบับร่าง</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 min-h-0">
            {/* Date */}
            {announcement.PublishAt && (
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#3674B5]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">วันที่เผยแพร่</p>
                  <p className="font-medium">
                    {new Date(announcement.PublishAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Detail */}
            {announcement.Detail && (
              <div className="bg-[#EBF3FC] rounded-xl p-4 border border-[#BFDBFE]">
                <h3 className="text-sm font-semibold text-[#3674B5] mb-3">รายละเอียด</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {announcement.Detail}
                </p>
              </div>
            )}

            {/* Images */}
            {announcement.Pics.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">รูปภาพ ({announcement.Pics.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {announcement.Pics.map((picId) => {
                    const imageUrl = getAnnouncementImageUrl(picId);
                    if (!imageUrl) return null;
                    
                    return (
                      <div
                        key={picId}
                        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-100 hover:scale-105 transition-transform duration-300"
                        onClick={() => setSelectedImage(picId)}
                      >
                        <div className="aspect-square">
                          <img
                            src={imageUrl}
                            alt="Announcement"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!announcement.Detail && announcement.Pics.length === 0 && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">ไม่มีรายละเอียดเพิ่มเติม</p>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-wrap flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              ปิด
            </button>

            {/* ✅ เผยแพร่ครั้งเดียว - แสดงปุ่มเผยแพร่เฉพาะเมื่อยังไม่เผยแพร่ */}
            {canPublish && !isPublished && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishing}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 text-sm font-semibold rounded-xl hover:bg-green-100 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                เผยแพร่ประกาศ
              </button>
            )}

            {canManage && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#FEF3C7] text-amber-600 border border-amber-200 text-sm font-semibold rounded-xl hover:bg-amber-100 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  แก้ไข
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {(() => {
            const imageUrl = getAnnouncementImageUrl(selectedImage);
            if (!imageUrl) return null;
            
            return (
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            );
          })()}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowPublishConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">เผยแพร่ประกาศ</h3>
                  <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                คุณต้องการเผยแพร่ประกาศ <span className="font-semibold text-gray-900">"{announcement.Title}"</span> หรือไม่?
              </p>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">⚠️ สำคัญ</p>
                    <p className="text-xs text-amber-700 mt-1">
                      เมื่อเผยแพร่แล้ว จะไม่สามารถยกเลิกการเผยแพร่ได้ โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนเผยแพร่
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-[18px] border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                disabled={isPublishing}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังเผยแพร่...
                  </span>
                ) : (
                  'ยืนยันเผยแพร่'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">ลบประกาศ?</h3>
                  <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                คุณต้องการลบประกาศ <span className="font-semibold text-gray-900">"{announcement.Title}"</span> หรือไม่?
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-700">⚠️ ประกาศนี้จะถูกลบออกจากระบบอย่างถาวร</p>
              </div>
            </div>

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