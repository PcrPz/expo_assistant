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
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Blue Gradient Header */}
          <div className="relative h-32 bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] p-6">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <ImageIcon className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isPublished ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        เผยแพร่แล้ว
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-white/30 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                        ฉบับร่าง
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                    {announcement.Title}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(90vh-12rem)] overflow-y-auto">
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
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100">
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
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 flex-wrap">
            <button
              onClick={onClose}
              className="px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition-colors"
            >
              ปิด
            </button>

            {/* ✅ เผยแพร่ครั้งเดียว - แสดงปุ่มเผยแพร่เฉพาะเมื่อยังไม่เผยแพร่ */}
            {canPublish && !isPublished && (
              <button
                onClick={() => setShowPublishConfirm(true)}
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 font-medium transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                เผยแพร่ประกาศ
              </button>
            )}

            {canManage && (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-5 py-3 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  แก้ไข
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium transition-colors"
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Send className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">เผยแพร่ประกาศ?</h3>
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

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-3xl">
              <button
                onClick={() => setShowPublishConfirm(false)}
                disabled={isPublishing}
                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 px-5 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-7 h-7 text-red-600" />
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