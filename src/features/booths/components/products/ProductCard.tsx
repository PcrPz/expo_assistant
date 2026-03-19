// src/features/booths/components/products/ProductCard.tsx
'use client';

import { Package } from 'lucide-react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}

export function ProductCard({ product, canManage, onView, onEdit, onDeleteClick }: ProductCardProps) {
  const formatPrice = (price: string) => {
    try {
      const num = parseFloat(price);
      if (num === 0) return 'ฟรี';
      return `฿${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    } catch { return price; }
  };

  const thumbnailUrl = product.Thumbnail ? getMinioFileUrl(product.Thumbnail) : null;
  const isFree = parseFloat(product.Price) === 0;

  return (
    <div className="bg-white rounded-[14px] border-[1.5px] border-[#E2E8F0] overflow-hidden hover:border-[#3674B5] transition-colors">

      {/* Top — รูปซ้าย (square) + ข้อมูลขวา */}
      <div className="flex items-stretch" style={{ minHeight: '96px' }}>

        {/* รูป — square เท่ากับความสูง card */}
        <div
          className="flex-shrink-0 bg-[#F8FAFC] flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ width: '96px', minHeight: '96px' }}
          onClick={onView}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={product.Title}
              className="w-full h-full object-cover"
              style={{ aspectRatio: '1/1' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Package className={`h-9 w-9 text-gray-300 ${thumbnailUrl ? 'hidden' : ''}`} />
        </div>

        {/* ข้อมูล */}
        <div
          className="flex-1 px-3 py-3 min-w-0 cursor-pointer flex flex-col justify-center"
          onClick={onView}
        >
          <p className="text-[13px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">
            {product.Title}
          </p>
          <p className={`text-[15px] font-bold leading-none ${isFree ? 'text-green-600' : 'text-[#3674B5]'}`}>
            {formatPrice(product.Price)}
          </p>
        </div>
      </div>

      {/* Bottom — actions */}
      <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-[#F0F4F8]">
        <button
          onClick={onView}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-[#EBF3FC] text-[#3674B5] rounded-[9px] text-[12px] font-semibold hover:bg-[#DBEAFE] transition"
        >
          ดูรายละเอียด
        </button>
        {canManage && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-8 h-8 bg-[#FEF3C7] text-amber-600 rounded-[9px] flex items-center justify-center hover:bg-amber-100 transition flex-shrink-0"
              title="แก้ไข"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
              className="w-8 h-8 bg-red-50 text-red-500 rounded-[9px] flex items-center justify-center hover:bg-red-100 transition flex-shrink-0"
              title="ลบ"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}