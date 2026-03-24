// src/features/booths/components/events/EditEventModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

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
      toast.success('แก้ไขกิจกรรมสำเร็จ');
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขกิจกรรม</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{event.Title}</p>
              </div>
            </div>
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto min-h-0">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">ชื่อกิจกรรม <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} maxLength={200}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all" />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">เริ่มต้น <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">สิ้นสุด <span className="text-red-500">*</span></label>
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">รายละเอียด</label>
              <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} disabled={isLoading} maxLength={1000}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 resize-none disabled:opacity-50 transition-all" />
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">ข้อมูลติดต่อ</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ชื่อบริษัท" disabled={isLoading}
                  className="px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" disabled={isLoading}
                  className="px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
                <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="เบอร์โทร" disabled={isLoading}
                  className="px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
                <input type="url" value={website1} onChange={(e) => setWebsite1(e.target.value)} placeholder="Website 1" disabled={isLoading}
                  className="px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
                <input type="url" value={website2} onChange={(e) => setWebsite2(e.target.value)} placeholder="Website 2" disabled={isLoading}
                  className="col-span-2 px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 disabled:opacity-50 transition-all text-sm" />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">รูป Thumbnail</label>
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
                <label className="block text-sm font-semibold text-gray-700">รูปภาพที่มีอยู่</label>
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
              <label className="block text-sm font-semibold text-gray-700">เพิ่มรูปภาพใหม่</label>
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
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
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