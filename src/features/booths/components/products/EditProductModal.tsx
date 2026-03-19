// src/features/booths/components/products/EditProductModal.tsx
'use client';

import { useState } from 'react';
import { Image as ImageIcon, RotateCcw, Trash2 } from 'lucide-react';
import { updateProduct } from '../../api/productApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { ProductDetail } from '../../types/product.types';

interface EditProductModalProps {
  product: ProductDetail;
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, expoId, boothId, onClose, onSuccess }: EditProductModalProps) {
  const [title, setTitle] = useState(product.Title);
  const [detail, setDetail] = useState(product.Detail || '');
  const [price, setPrice] = useState(product.Price);

  const [thumbnailUrl, setThumbnailUrl] = useState(product.Thumbnail);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | undefined>(undefined);

  const [existingPics, setExistingPics] = useState<string[]>(product.Pics);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [newDetailFiles, setNewDetailFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_DETAIL_IMAGES = 10;

  // ── Logic unchanged ──────────────────────────────────────────
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('กรุณาเลือกไฟล์ JPEG, PNG หรือ WebP เท่านั้น'); e.target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB'); e.target.value = ''; return;
    }
    setNewThumbnailFile(file);
  };

  const handleDetailFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = existingPics.length - deletedPics.length + newDetailFiles.length + files.length;
    if (total > MAX_DETAIL_IMAGES) {
      alert(`สามารถมีรูปรายละเอียดได้สูงสุด ${MAX_DETAIL_IMAGES} รูป`); e.target.value = ''; return;
    }
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) { alert(`${f.name}: รองรับเฉพาะ JPEG, PNG, WebP`); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name}: ขนาดไฟล์ต้องไม่เกิน 5MB`); return false; }
      return true;
    });
    setNewDetailFiles([...newDetailFiles, ...validFiles]);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { alert('กรุณาระบุชื่อสินค้า'); return; }
    const priceNum = price ? parseFloat(price) : undefined;
    if (price && (isNaN(priceNum!) || priceNum! < 0)) { alert('กรุณาระบุราคาที่ถูกต้อง'); return; }
    try {
      setIsSubmitting(true);
      await updateProduct(expoId, {
        product_id: product.ProductID, booth_id: boothId,
        title: title.trim(), detail: detail.trim() || undefined,
        price: priceNum, thumbnail: thumbnailUrl || undefined,
        thumbnail_file: newThumbnailFile,
        files: newDetailFiles.length > 0 ? newDetailFiles : undefined,
        deleted_pics: deletedPics.length > 0 ? deletedPics : undefined,
      });
      alert('แก้ไขสินค้าสำเร็จ');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถแก้ไขสินค้าได้');
    } finally { setIsSubmitting(false); }
  };

  const totalDetailImages = existingPics.length - deletedPics.length + newDetailFiles.length;
  const currentThumbnailUrl = thumbnailUrl ? getMinioFileUrl(thumbnailUrl) : null;
  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขสินค้า</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.Title}</p>
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

            {/* ชื่อ */}
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
            </div>

            {/* รูปปก */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">รูปภาพปก</label>
              {newThumbnailFile ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={URL.createObjectURL(newThumbnailFile)} alt="new" className="w-full h-44 object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded-lg">รูปใหม่</span>
                  <button type="button" onClick={() => setNewThumbnailFile(undefined)} disabled={isSubmitting}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : currentThumbnailUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={currentThumbnailUrl} alt="current" className="w-full h-44 object-cover" />
                  <label className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer hover:bg-white transition">
                    เปลี่ยนรูป
                    <input type="file" accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange} className="hidden" disabled={isSubmitting} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#D1D9E6] rounded-xl cursor-pointer hover:border-[#3674B5] hover:bg-[#F0F6FF] transition">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="mt-2 text-sm text-gray-600 font-medium">คลิกเพื่อเลือกรูปปก</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange} className="hidden" disabled={isSubmitting} />
                </label>
              )}
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียดสินค้า</label>
              <textarea value={detail} onChange={e => setDetail(e.target.value)}
                placeholder="ระบุรายละเอียดสินค้า" disabled={isSubmitting} rows={3}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition resize-none bg-white" />
            </div>

            {/* รูปรายละเอียด */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  รูปรายละเอียด <span className="text-gray-400 font-normal">({totalDetailImages}/{MAX_DETAIL_IMAGES})</span>
                </label>
                {deletedPics.length > 0 && (
                  <span className="text-xs text-red-500 font-medium">จะลบ {deletedPics.length} รูปเมื่อบันทึก</span>
                )}
              </div>

              {totalDetailImages < MAX_DETAIL_IMAGES && (
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-[#D1D9E6] rounded-xl cursor-pointer hover:border-[#3674B5] hover:bg-[#F0F6FF] transition mb-3">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">เพิ่มรูปรายละเอียด</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                    onChange={handleDetailFilesChange} className="hidden" disabled={isSubmitting} />
                </label>
              )}

              {(existingPics.length > 0 || newDetailFiles.length > 0) && (
                <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                  {existingPics.map((picUrl) => {
                    const isDeleted = deletedPics.includes(picUrl);
                    const imgUrl = getMinioFileUrl(picUrl);
                    return (
                      <div key={picUrl} className="relative group aspect-square">
                        {imgUrl && (
                          <img src={imgUrl} alt="" className={`w-full h-full object-cover rounded-lg ${isDeleted ? 'opacity-30 grayscale' : ''}`} />
                        )}
                        {isDeleted ? (
                          <>
                            <div className="absolute inset-0 bg-red-500/20 rounded-lg border-2 border-red-400" />
                            <button type="button" onClick={() => setDeletedPics(deletedPics.filter(u => u !== picUrl))}
                              disabled={isSubmitting}
                              className="absolute inset-x-1 bottom-1 py-0.5 bg-green-600 text-white text-[10px] font-semibold rounded-md flex items-center justify-center gap-1 hover:bg-green-700 transition">
                              <RotateCcw className="h-2.5 w-2.5" />ยกเลิก
                            </button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setDeletedPics([...deletedPics, picUrl])}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Trash2 className="h-2.5 w-2.5 text-white" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {newDetailFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative group aspect-square">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-lg" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-semibold rounded">ใหม่</span>
                      <button type="button" onClick={() => setNewDetailFiles(newDetailFiles.filter((_, j) => j !== i))}
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
            <button type="submit" disabled={isSubmitting || !title.trim()}
              onClick={handleSubmit as any}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังบันทึก...</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>บันทึกการเปลี่ยนแปลง</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}