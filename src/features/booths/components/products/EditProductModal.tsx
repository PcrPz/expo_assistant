// src/features/products/components/products/EditProductModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, RotateCcw } from 'lucide-react';
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

export function EditProductModal({
  product,
  expoId,
  boothId,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [title, setTitle] = useState(product.Title);
  const [detail, setDetail] = useState(product.Detail || '');
  const [price, setPrice] = useState(product.Price);

  // รูปปก
  const [thumbnailUrl, setThumbnailUrl] = useState(product.Thumbnail);
  const [newThumbnailFile, setNewThumbnailFile] = useState<File | undefined>(undefined);

  // รูปรายละเอียด
  const [existingPics, setExistingPics] = useState<string[]>(product.Pics);
  const [deletedPics, setDeletedPics] = useState<string[]>([]);
  const [newDetailFiles, setNewDetailFiles] = useState<File[]>([]);

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
      
      setNewThumbnailFile(file);
    }
  };

  const handleDetailFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = existingPics.length - deletedPics.length + newDetailFiles.length + files.length;
    if (totalImages > MAX_DETAIL_IMAGES) {
      alert(`สามารถมีรูปรายละเอียดได้สูงสุด ${MAX_DETAIL_IMAGES} รูป`);
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
    
    setNewDetailFiles([...newDetailFiles, ...validFiles]);
    e.target.value = '';
  };

  const removeExistingPic = (picUrl: string) => {
    setDeletedPics([...deletedPics, picUrl]);
  };

  const undoRemoveExistingPic = (picUrl: string) => {
    setDeletedPics(deletedPics.filter((url) => url !== picUrl));
  };

  const removeNewDetailFile = (index: number) => {
    setNewDetailFiles(newDetailFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }

    const priceNum = price ? parseFloat(price) : undefined;
    if (price && (isNaN(priceNum!) || priceNum! < 0)) {
      alert('กรุณาระบุราคาที่ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);

      await updateProduct(expoId, {
        product_id: product.ProductID,
        booth_id: boothId,
        title: title.trim(),
        detail: detail.trim() || undefined,
        price: priceNum,
        thumbnail: thumbnailUrl || undefined,
        thumbnail_file: newThumbnailFile,
        files: newDetailFiles.length > 0 ? newDetailFiles : undefined,
        deleted_pics: deletedPics.length > 0 ? deletedPics : undefined,
      });

      alert('แก้ไขสินค้าสำเร็จ');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถแก้ไขสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDetailImages = existingPics.length - deletedPics.length + newDetailFiles.length;
  const currentThumbnailUrl = thumbnailUrl ? getMinioFileUrl(thumbnailUrl) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* ✅ Modal Container - Flex Column + Max Height */}
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        
        {/* ✅ Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขสินค้า</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* ✅ Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
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
                รูปภาพปก
              </label>
              
              {newThumbnailFile ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newThumbnailFile)}
                    alt="New thumbnail"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setNewThumbnailFile(undefined)}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                    รูปใหม่
                  </div>
                </div>
              ) : currentThumbnailUrl ? (
                <div className="relative">
                  <img
                    src={currentThumbnailUrl}
                    alt="Current thumbnail"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <label className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-white transition">
                    เปลี่ยนรูป
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3674B5] hover:bg-blue-50 transition">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">คลิกเพื่อเลือกรูปภาพปก</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            {/* Detail Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  รูปรายละเอียดสินค้า ({totalDetailImages}/{MAX_DETAIL_IMAGES})
                </label>
                {deletedPics.length > 0 && (
                  <span className="text-xs text-red-600">
                    ⚠️ จะลบ {deletedPics.length} รูป เมื่อกด "บันทึก"
                  </span>
                )}
              </div>
              
              {totalDetailImages < MAX_DETAIL_IMAGES && (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#3674B5] hover:bg-blue-50 transition mb-4">
                  <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600">เพิ่มรูปรายละเอียด</span>
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

              {/* ✅ Grid with Max Height and Scroll */}
              {(existingPics.length > 0 || newDetailFiles.length > 0) && (
                <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1">
                  {/* Existing Images */}
                  {existingPics.map((picUrl) => {
                    const isDeleted = deletedPics.includes(picUrl);
                    const imageUrl = getMinioFileUrl(picUrl);
                    
                    return (
                      <div key={picUrl} className="relative group">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="Detail"
                            className={`w-full aspect-square object-cover rounded-lg ${
                              isDeleted ? 'opacity-30 grayscale' : ''
                            }`}
                          />
                        )}
                        
                        {isDeleted ? (
                          <>
                            <div className="absolute inset-0 bg-red-500/20 rounded-lg border-2 border-red-500"></div>
                            <div className="absolute top-1 left-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded">
                              จะลบ
                            </div>
                            <button
                              type="button"
                              onClick={() => undoRemoveExistingPic(picUrl)}
                              disabled={isSubmitting}
                              className="absolute bottom-1 left-1 right-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              ยกเลิกการลบ
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeExistingPic(picUrl)}
                            disabled={isSubmitting}
                            className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* New Images */}
                  {newDetailFiles.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New detail ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute top-1 left-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                        ใหม่
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewDetailFile(index)}
                        disabled={isSubmitting}
                        className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* คำอธิบาย */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 วิธีจัดการรูป:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 ml-4 list-disc">
                  <li><strong>ลบรูปเดิม:</strong> คลิก 🗑️ → รูปจะมีสีแดง "จะลบ"</li>
                  <li><strong>ยกเลิกการลบ:</strong> คลิก "ยกเลิกการลบ" ที่รูปสีแดง</li>
                  <li><strong>เพิ่มรูปใหม่:</strong> คลิก "เพิ่มรูปรายละเอียด"</li>
                  <li><strong>บันทึก:</strong> กด "บันทึกการเปลี่ยนแปลง" เพื่อยืนยัน</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
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
                disabled={isSubmitting || !title.trim()}
                className="flex-1 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}