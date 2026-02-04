// src/features/booths/components/announcements/EditAnnouncementModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Trash2, RotateCcw, Megaphone } from 'lucide-react';
import { updateBoothAnnouncement } from '../../api/announcementApi';

import type { BoothAnnouncementDetail } from '../../types/announcement.types';
import { getAnnouncementImageUrl } from '../../utils/annoucement-helper';

interface EditAnnouncementModalProps {
  expoID: string;
  boothID: string;
  announcement: BoothAnnouncementDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditAnnouncementModal({
  expoID,
  boothID,
  announcement,
  open,
  onClose,
  onSuccess,
}: EditAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.Title);
      setDetail(announcement.Detail || '');
      setNewFiles([]);
      setDeletedPics([]);
      setError(null);
    }
  }, [announcement]);

  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith('image/')
      );
      
      if (invalidFiles.length > 0) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      setNewFiles((prev) => [...prev, ...files]);
      setError(null);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingPic = (picId: string) => {
    setDeletedPics((prev) => [...prev, picId]);
  };

  const handleRestoreDeletedPic = (picId: string) => {
    setDeletedPics((prev) => prev.filter((id) => id !== picId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!announcement) return;

    if (!title.trim()) {
      setError('กรุณากรอกชื่อประกาศ');
      return;
    }

    setIsLoading(true);

    try {
      await updateBoothAnnouncement(expoID, boothID, {
        noti_id: announcement.NotiID,
        title: title.trim(),
        detail: detail.trim() || undefined,
        status: announcement.Status,
        deleted_pics: deletedPics.length > 0 ? deletedPics : undefined,
        files: newFiles.length > 0 ? newFiles : undefined,
      });

      alert('แก้ไขประกาศสำเร็จ');
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      alert('แก้ไขประกาศไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !announcement) return null;

  const existingPics = announcement.Pics.filter(
    (picId) => !deletedPics.includes(picId)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">แก้ไขประกาศ</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  แก้ไขรายละเอียดของประกาศ (การแก้ไขจะไม่เปลี่ยนสถานะการเผยแพร่)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                ชื่อประกาศ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น โปรโมชั่นพิเศษ ลด 50%"
                disabled={isLoading}
                maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                {title.length}/200 ตัวอักษร
              </p>
            </div>

            {/* Detail */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                รายละเอียดประกาศ
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="เพิ่มรายละเอียดเกี่ยวกับประกาศของคุณ..."
                rows={4}
                disabled={isLoading}
                maxLength={1000}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none disabled:opacity-50 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                {detail.length}/1000 ตัวอักษร
              </p>
            </div>

            {/* Existing Images */}
            {existingPics.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  รูปภาพปัจจุบัน ({existingPics.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingPics.map((picId) => {
                    const imageUrl = getAnnouncementImageUrl(picId);
                    if (!imageUrl) return null;
                    
                    return (
                      <div
                        key={picId}
                        className="relative group rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={imageUrl}
                            alt="Announcement"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingPic(picId)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isLoading}
                          title="ลบรูปนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deleted Images */}
            {deletedPics.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-red-600">
                  รูปภาพที่จะลบ ({deletedPics.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {deletedPics.map((picId) => {
                    const imageUrl = getAnnouncementImageUrl(picId);
                    if (!imageUrl) return null;
                    
                    return (
                      <div
                        key={picId}
                        className="relative group rounded-lg border-2 border-red-300 overflow-hidden bg-gray-50 opacity-60"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={imageUrl}
                            alt="Deleted"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreDeletedPic(picId)}
                          className="absolute top-2 right-2 p-1.5 bg-green-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isLoading}
                          title="กู้คืนรูปนี้"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-500 text-white text-xs px-3 py-1 rounded-md font-semibold">
                            จะลบ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                เพิ่มรูปภาพใหม่
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('new-file-upload')?.click()}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  เลือกรูปภาพ
                </button>
                <input
                  id="new-file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                {newFiles.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ({newFiles.length} ไฟล์ใหม่)
                  </span>
                )}
              </div>

              {newFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {newFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg border-2 border-green-300 overflow-hidden bg-gray-50"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs p-1.5 text-center font-semibold">
                        ใหม่
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Actions - สีจาง */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition disabled:opacity-50 font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการแก้ไข'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}