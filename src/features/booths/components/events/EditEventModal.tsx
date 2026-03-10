// src/features/booths/components/events/EditEventModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, Edit2 } from 'lucide-react';
import { updateBoothEvent } from '../../api/eventApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { BoothEventDetail } from '../../types/event.types';

interface EditEventModalProps {
  expoID: string;
  boothID: string;
  event: BoothEventDetail | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function toLocalDatetimeValue(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditEventModal({
  expoID,
  boothID,
  event,
  open,
  onClose,
  onSuccess,
}: EditEventModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [detail, setDetail] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [website1, setWebsite1] = useState('');
  const [website2, setWebsite2] = useState('');

  // existing pics (pic_ids from server)
  const [existingPics, setExistingPics] = useState<string[]>([]);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [currentThumbnail, setCurrentThumbnail] = useState<string>('');

  // new files
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [newPics, setNewPics] = useState<File[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (event && open) {
      setTitle(event.Title);
      setStartDate(toLocalDatetimeValue(event.StartDate));
      setEndDate(toLocalDatetimeValue(event.EndDate));
      setDetail(event.Detail || '');
      setCompany(event.Company || '');
      setEmail(event.Email || '');
      setTel(event.Tel || '');
      setWebsite1(event.Website1 || '');
      setWebsite2(event.Website2 || '');
      setCurrentThumbnail(event.Thumbnail || '');
      setExistingPics(event.EventPics || []);
      setDeletedPics([]);
      setThumbnailFile(null);
      setNewPics([]);
      setError(null);
    }
  }, [event, open]);

  const handleDeleteExistingPic = (picId: string) => {
    setExistingPics((prev) => prev.filter((p) => p !== picId));
    setDeletedPics((prev) => [...prev, picId]);
    if (currentThumbnail === picId) setCurrentThumbnail('');
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) setThumbnailFile(file);
  };

  const handleNewPicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      setNewPics((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError('กรุณากรอกชื่อกิจกรรม');
    if (!startDate || !endDate) return setError('กรุณาระบุวันที่');
    if (new Date(endDate) <= new Date(startDate)) return setError('วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น');
    if (!event) return;

    setIsLoading(true);
    try {
      await updateBoothEvent(expoID, boothID, {
        event_id: event.EventID,
        title: title.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        detail: detail.trim() || undefined,
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        tel: tel.trim() || undefined,
        website1: website1.trim() || undefined,
        website2: website2.trim() || undefined,
        thumbnail: currentThumbnail || undefined,
        deleted_pics: deletedPics.length > 0 ? deletedPics : undefined,
        thumbnail_file: thumbnailFile || undefined,
        files: newPics.length > 0 ? newPics : undefined,
      });
      alert('แก้ไขกิจกรรมสำเร็จ');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => { if (!isLoading) onClose(); };

  if (!open || !event) return null;

  const previewThumbnail = thumbnailFile
    ? URL.createObjectURL(thumbnailFile)
    : currentThumbnail ? getMinioFileUrl(currentThumbnail) || undefined : undefined;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="relative h-28 bg-gradient-to-br from-[#3674B5] via-[#498AC3] to-[#749BC2] p-6">
            <div className="absolute inset-0 bg-white/5" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <Edit2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">แก้ไขกิจกรรม</h2>
                  <p className="text-white/80 text-sm mt-0.5 line-clamp-1">{event.Title}</p>
                </div>
              </div>
              <button type="button" onClick={handleClose} disabled={isLoading}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors flex items-center justify-center">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[calc(90vh-12rem)] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} maxLength={200}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">เริ่มต้น <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-900">สิ้นสุด <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-900">รายละเอียด</label>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} disabled={isLoading} maxLength={1000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 resize-none disabled:opacity-50 transition-all" />
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900">ข้อมูลติดต่อ</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ชื่อบริษัท" disabled={isLoading}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" disabled={isLoading}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
                <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="เบอร์โทร" disabled={isLoading}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
                <input type="url" value={website1} onChange={(e) => setWebsite1(e.target.value)} placeholder="Website 1" disabled={isLoading}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
                <input type="url" value={website2} onChange={(e) => setWebsite2(e.target.value)} placeholder="Website 2" disabled={isLoading}
                  className="col-span-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all text-sm" />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">รูป Thumbnail</label>
              <button type="button" onClick={() => document.getElementById('edit-thumb-upload')?.click()} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#498AC3] text-[#3674B5] rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50">
                <Upload className="w-5 h-5" />
                {thumbnailFile ? thumbnailFile.name : 'เปลี่ยนรูป Thumbnail'}
              </button>
              <input id="edit-thumb-upload" type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={isLoading} />
              {previewThumbnail ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-blue-200">
                  <img src={previewThumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setThumbnailFile(null); setCurrentThumbnail(''); if (event.Thumbnail) setDeletedPics(prev => [...prev, event.Thumbnail]); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">ไม่มี thumbnail</p>
                </div>
              )}
            </div>

            {/* Existing Pics */}
            {existingPics.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">รูปภาพที่มีอยู่</label>
                <div className="grid grid-cols-3 gap-3">
                  {existingPics.map((picId) => (
                    <div key={picId} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 aspect-square">
                      <img src={getMinioFileUrl(picId) || undefined} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleDeleteExistingPic(picId)}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {deletedPics.length > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    ⚠️ จะลบ {deletedPics.length} รูปเมื่อกดบันทึก
                  </p>
                )}
              </div>
            )}

            {/* New Pics */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">เพิ่มรูปภาพใหม่</label>
              <button type="button" onClick={() => document.getElementById('edit-pics-upload')?.click()} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#498AC3] text-[#3674B5] rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50">
                <Upload className="w-5 h-5" />
                <span>เพิ่มรูปภาพ</span>
                {newPics.length > 0 && <span className="text-sm">({newPics.length} ไฟล์)</span>}
              </button>
              <input id="edit-pics-upload" type="file" accept="image/*" multiple onChange={handleNewPicsChange} className="hidden" disabled={isLoading} />
              {newPics.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {newPics.map((file, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border-2 border-blue-200 aspect-square">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewPics(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition-colors disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 px-5 py-3 bg-[#3674B5] text-white rounded-xl hover:bg-[#2d5d96] font-medium transition-all shadow-md disabled:opacity-50">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังบันทึก...
                </span>
              ) : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}