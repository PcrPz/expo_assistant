// src/features/booths/components/events/CreateEventModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, ImageIcon, Plus, Info } from 'lucide-react';
import { createBoothEvent } from '../../api/eventApi';

interface CreateEventModalProps {
  expoID: string;
  boothID: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreateEventModal({
  expoID,
  boothID,
  open,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(toLocalDatetimeValue(now));
  const [endDate, setEndDate] = useState(toLocalDatetimeValue(later));
  const [detail, setDetail] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [website1, setWebsite1] = useState('');
  const [website2, setWebsite2] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [pics, setPics] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setError(null);
    }
  };

  const handlePicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      setPics((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemovePic = (index: number) => {
    setPics((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError('กรุณากรอกชื่อกิจกรรม');
    if (!startDate) return setError('กรุณาระบุวันที่เริ่มต้น');
    if (!endDate) return setError('กรุณาระบุวันที่สิ้นสุด');
    if (new Date(endDate) <= new Date(startDate)) return setError('วันที่สิ้นสุดต้องหลังวันที่เริ่มต้น');

    setIsLoading(true);
    try {
      await createBoothEvent(expoID, boothID, {
        booth_id: boothID,
        title: title.trim(),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        detail: detail.trim() || undefined,
        company: company.trim() || undefined,
        email: email.trim() || undefined,
        tel: tel.trim() || undefined,
        website1: website1.trim() || undefined,
        website2: website2.trim() || undefined,
        thumbnail_file: thumbnailFile || undefined,
        files: pics.length > 0 ? pics : undefined,
      });
      alert('สร้างกิจกรรมสำเร็จ');
      handleReset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitle(''); setStartDate(toLocalDatetimeValue(new Date())); setEndDate(toLocalDatetimeValue(later));
    setDetail(''); setCompany(''); setEmail(''); setTel('');
    setWebsite1(''); setWebsite2(''); setThumbnailFile(null); setPics([]); setError(null);
  };

  const handleClose = () => { if (!isLoading) { handleReset(); onClose(); } };

  if (!open) return null;

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
                  <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">สร้างกิจกรรมใหม่</h2>
                  <p className="text-white/80 text-sm mt-0.5">เพิ่มกิจกรรมหรืออีเวนต์ให้กับบูธของคุณ</p>
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
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น Demo สินค้าใหม่ / Mini Concert" disabled={isLoading} maxLength={200}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 disabled:opacity-50 transition-all" />
              <p className="text-xs text-gray-500">{title.length}/200 ตัวอักษร</p>
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
                placeholder="อธิบายกิจกรรมนี้..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-4 focus:ring-[#3674B5]/20 resize-none disabled:opacity-50 transition-all" />
              <p className="text-xs text-gray-500">{detail.length}/1,000 ตัวอักษร</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-900">ข้อมูลติดต่อ (ไม่บังคับ)</p>
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
              <button type="button" onClick={() => document.getElementById('thumb-upload')?.click()} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#498AC3] text-[#3674B5] rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50">
                <Upload className="w-5 h-5" />
                {thumbnailFile ? thumbnailFile.name : 'เลือกรูป Thumbnail'}
              </button>
              <input id="thumb-upload" type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" disabled={isLoading} />
              {thumbnailFile && (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-blue-200">
                  <img src={URL.createObjectURL(thumbnailFile)} alt="thumbnail" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setThumbnailFile(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Event Pics */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-900">รูปภาพกิจกรรม</label>
              <button type="button" onClick={() => document.getElementById('pics-upload')?.click()} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#498AC3] text-[#3674B5] rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-50">
                <Upload className="w-5 h-5" />
                <span>เพิ่มรูปภาพ</span>
                {pics.length > 0 && <span className="text-sm">({pics.length} ไฟล์)</span>}
              </button>
              <input id="pics-upload" type="file" accept="image/*" multiple onChange={handlePicsChange} className="hidden" disabled={isLoading} />

              {pics.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {pics.map((file, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-blue-200 aspect-square">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemovePic(index)}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center bg-gray-50">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">ยังไม่มีรูปภาพ</p>
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
              className="flex-1 px-5 py-3 bg-[#3674B5] text-white rounded-xl hover:bg-[#2d5d96] font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังสร้าง...
                </span>
              ) : 'สร้างกิจกรรม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}