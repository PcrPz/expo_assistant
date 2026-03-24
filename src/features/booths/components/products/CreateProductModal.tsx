// src/features/booths/components/products/CreateProductModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import { createProduct } from '../../api/productApi';

interface CreateProductModalProps {
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductModal({ expoId, boothId, onClose, onSuccess }: CreateProductModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_DETAIL_IMAGES = 10;

  // ── Logic unchanged ──────────────────────────────────────────
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.warning('กรุณาเลือกไฟล์ JPEG, PNG หรือ WebP เท่านั้น'); e.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('ขนาดไฟล์ต้องไม่เกิน 5MB'); e.target.value = ''; return;
    }
    setThumbnailFile(file);
  };

  const handleDetailFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (detailFiles.length + files.length > MAX_DETAIL_IMAGES) {
      toast.warning(`สามารถอัปโหลดรูปรายละเอียดได้สูงสุด ${MAX_DETAIL_IMAGES} รูป`); e.target.value = ''; return;
    }
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { toast.warning(`${f.name}: รองรับเฉพาะ JPEG, PNG, WebP`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.warning(`${f.name}: ขนาดไฟล์ต้องไม่เกิน 5MB`); return false; }
      return true;
    });
    setDetailFiles([...detailFiles, ...validFiles]);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.warning('กรุณาระบุชื่อสินค้า'); return; }
    if (!thumbnailFile) { toast.warning('กรุณาเลือกรูปภาพปก'); return; }
    const priceNum = price ? parseFloat(price) : undefined;
    if (price && (isNaN(priceNum!) || priceNum! < 0)) { toast.warning('กรุณาระบุราคาที่ถูกต้อง'); return; }
    try {
      setIsSubmitting(true);
      await createProduct(expoId, {
        booth_id: boothId, title: title.trim(),
        detail: detail.trim() || undefined, price: priceNum,
        thumbnail_file: thumbnailFile,
        files: detailFiles.length > 0 ? detailFiles : undefined,
      });
      toast.success('เพิ่มสินค้าสำเร็จ');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถเพิ่มสินค้าได้');
    } finally { setIsSubmitting(false); }
  };

  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  <line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">เพิ่มสินค้า</h2>
                <p className="text-xs text-gray-400">เพิ่มสินค้าเข้าบูธ</p>
              </div>
            </div>
            <button onClick={onClose} disabled={isSubmitting}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ชื่อสินค้า */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อสินค้า <span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="ระบุชื่อสินค้า" disabled={isSubmitting} className={inputCls} />
            </div>

            {/* ราคา */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ราคา (บาท)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">฿</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="0.00" step="0.01" min="0" disabled={isSubmitting}
                  className={`${inputCls} pl-7`} />
              </div>
              <p className="mt-1 text-xs text-gray-400">ใส่ 0 = ฟรี</p>
            </div>

            {/* รูปปก */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                รูปภาพปก <span className="text-red-500">*</span>
              </label>
              {!thumbnailFile ? (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#D1D9E6] rounded-xl cursor-pointer hover:border-[#3674B5] hover:bg-[#F0F6FF] transition">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="mt-2 text-sm text-gray-600 font-medium">คลิกเพื่อเลือกรูปปก</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP · สูงสุด 5MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange} className="hidden" disabled={isSubmitting} />
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(thumbnailFile)} alt="preview"
                    className="w-full h-44 object-cover" />
                  <button type="button" onClick={() => setThumbnailFile(null)} disabled={isSubmitting}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียดสินค้า</label>
              <textarea value={detail} onChange={e => setDetail(e.target.value)}
                placeholder="ระบุรายละเอียดสินค้า (ไม่บังคับ)"
                disabled={isSubmitting} rows={3}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition resize-none bg-white" />
            </div>

            {/* รูปรายละเอียด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                รูปรายละเอียด <span className="text-gray-400 font-normal">(สูงสุด {MAX_DETAIL_IMAGES} รูป)</span>
              </label>
              {detailFiles.length < MAX_DETAIL_IMAGES && (
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-[#D1D9E6] rounded-xl cursor-pointer hover:border-[#3674B5] hover:bg-[#F0F6FF] transition mb-3">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">เลือกรูปรายละเอียด ({detailFiles.length}/{MAX_DETAIL_IMAGES})</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                    onChange={handleDetailFilesChange} className="hidden" disabled={isSubmitting} />
                </label>
              )}
              {detailFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {detailFiles.map((file, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => setDetailFiles(detailFiles.filter((_, j) => j !== i))}
                        disabled={isSubmitting}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting || !title.trim() || !thumbnailFile}
              onClick={handleSubmit as any}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังเพิ่ม...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>เพิ่มสินค้า</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}