// src/features/products/components/products/CreateProductModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { createProduct } from '../../api/productApi';

interface CreateProductModalProps {
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductModal({
  expoId,
  boothId,
  onClose,
  onSuccess,
}: CreateProductModalProps) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_DETAIL_IMAGES = 10;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('กรุณาเลือกไฟล์ JPEG, PNG หรือ WebP เท่านั้น');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        e.target.value = '';
        return;
      }
      
      setThumbnailFile(file);
    }
  };

  const handleDetailFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (detailFiles.length + files.length > MAX_DETAIL_IMAGES) {
      alert(`สามารถอัปโหลดรูปรายละเอียดได้สูงสุด ${MAX_DETAIL_IMAGES} รูป`);
      e.target.value = '';
      return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name}: รองรับเฉพาะ JPEG, PNG, WebP`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}: ขนาดไฟล์ต้องไม่เกิน 5MB`);
        return false;
      }
      return true;
    });
    
    setDetailFiles([...detailFiles, ...validFiles]);
    e.target.value = '';
  };

  const removeDetailFile = (index: number) => {
    setDetailFiles(detailFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }

    if (!thumbnailFile) {
      alert('กรุณาเลือกรูปภาพปก');
      return;
    }

    const priceNum = price ? parseFloat(price) : undefined;
    if (price && (isNaN(priceNum!) || priceNum! < 0)) {
      alert('กรุณาระบุราคาที่ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);

      await createProduct(expoId, {
        booth_id: boothId,
        title: title.trim(),
        detail: detail.trim() || undefined,
        price: priceNum,
        thumbnail_file: thumbnailFile,
        files: detailFiles.length > 0 ? detailFiles : undefined,
      });

      alert('เพิ่มสินค้าสำเร็จ');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถเพิ่มสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">เพิ่มสินค้า</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อสินค้า <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อสินค้า"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดสินค้า
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="ระบุรายละเอียดสินค้า"
              disabled={isSubmitting}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] outline-none transition disabled:bg-gray-100 resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ราคา (บาท)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพปก <span className="text-red-500">*</span>
            </label>
            
            {!thumbnailFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3674B5] hover:bg-blue-50 transition">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">คลิกเพื่อเลือกรูปภาพปก</span>
                <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (สูงสุด 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Detail Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปรายละเอียดสินค้า (สูงสุด {MAX_DETAIL_IMAGES} รูป)
            </label>
            
            {detailFiles.length < MAX_DETAIL_IMAGES && (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3674B5] hover:bg-blue-50 transition mb-4">
                <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-600">เลือกรูปรายละเอียด</span>
                <span className="text-xs text-gray-400">({detailFiles.length}/{MAX_DETAIL_IMAGES})</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleDetailFilesChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            )}

            {detailFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {detailFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Detail ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailFile(index)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !thumbnailFile}
              className="flex-1 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}