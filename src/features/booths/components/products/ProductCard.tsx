// src/features/products/components/products/ProductCard.tsx
'use client';

import { Package } from 'lucide-react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onView: () => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  // Format price
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

  const thumbnailUrl = product.Thumbnail ? getMinioFileUrl(product.Thumbnail) : null;

  return (
    <div
      onClick={onView}
      className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#3674B5] hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Image - ไม่ยืด aspect-square */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl || undefined}
            alt={product.Title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.placeholder')?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Placeholder Icon */}
        <div className={`placeholder ${thumbnailUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center`}>
          <Package className="h-16 w-16 text-gray-300" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
          {product.Title}
        </h4>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-[#3674B5]">
            ฿{formatPrice(product.Price)}
          </span>
        </div>
      </div>

      {/* View Button - ด้านล่างสุด */}
      <div className="px-4 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="w-full py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition text-sm font-medium"
        >
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
}