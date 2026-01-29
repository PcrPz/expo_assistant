// src/features/products/components/products/ProductDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { getProductDetail, deleteProduct } from '../../api/productApi';
import type { ProductDetail } from '../../types/product.types';
import { ImageSlider } from './ImageSlider';

interface ProductDetailModalProps {
  productId: string;
  expoId: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: (product: ProductDetail) => void;
  onRefresh: () => void;
}

export function ProductDetailModal({
  productId,
  expoId,
  canManage,
  onClose,
  onEdit,
  onRefresh,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId, expoId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const data = await getProductDetail(expoId, productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      alert('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduct(expoId, productId);
      alert('ลบสินค้าสำเร็จ');
      onRefresh();
      onClose();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบสินค้าได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatPrice = (price: string) => {
    try {
      const numPrice = parseFloat(price);
      return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numPrice);
    } catch {
      return price;
    }
  };

  if (isLoading || !product) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8">
          <div className="w-8 h-8 border-4 border-[#3674B5] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-5xl my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">รายละเอียดสินค้า</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Image Slider */}
              <div>
                <ImageSlider
                  images={product.Pics || []}
                  thumbnail={product.Thumbnail}
                />
              </div>

        <div className="flex flex-col h-full">
        {/* Content */}
        <div className="space-y-6">
            {/* Title */}
            <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {product.Title}
            </h3>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#3674B5]">
                ฿{formatPrice(product.Price)}
            </span>
            </div>

            <div className="border-t border-gray-200"></div>

            {product.Detail && (
            <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                รายละเอียดสินค้า
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.Detail}
                </p>
            </div>
            )}
        </div>
                {canManage && (
                <div className="pt-6 mt-auto">
                    <div className="flex gap-3">
                    <button
                        onClick={() => onEdit(product)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition font-medium"
                    >
                        <Edit2 className="h-4 w-4" />
                        แก้ไขสินค้า
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        ลบสินค้า
                    </button>
                    </div>
                </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ลบสินค้า</h3>
                  <p className="text-sm text-gray-500 mt-0.5">ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                คุณต้องการลบสินค้า <span className="font-semibold">"{product.Title}"</span> หรือไม่?
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบสินค้า'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}