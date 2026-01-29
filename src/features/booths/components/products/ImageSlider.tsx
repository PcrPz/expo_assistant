// src/features/products/components/products/ImageSlider.tsx
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

interface ImageSliderProps {
  images: string[];  // URLs (encrypted) - รูปรายละเอียด
  thumbnail?: string;  // รูปปก
}

export function ImageSlider({ images, thumbnail }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ แก้ไข: ไม่รวมรูปปกซ้ำ ใช้เฉพาะรูปรายละเอียด
  // ถ้าไม่มีรูปรายละเอียด ให้ใช้รูปปก
  const allImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (allImages.length === 0) {
    // No images - show placeholder
    return (
      <div className="w-full">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <Package className="h-24 w-24 text-gray-300" />
        </div>
      </div>
    );
  }

  const currentImageUrl = getMinioFileUrl(allImages[currentIndex]);

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={`Product image ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.error-placeholder')?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Error Placeholder */}
        <div className={`error-placeholder ${currentImageUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
          <Package className="h-24 w-24 text-gray-300" />
        </div>

        {/* Navigation Arrows (แสดงเมื่อมีรูปมากกว่า 1) */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails (แสดงเมื่อมีรูปมากกว่า 1) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => {
            const thumbUrl = getMinioFileUrl(image);
            
            return (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-[#3674B5] ring-2 ring-[#3674B5]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.thumb-placeholder')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`thumb-placeholder ${thumbUrl ? 'hidden' : ''} w-full h-full bg-gray-100 flex items-center justify-center`}>
                  <Package className="h-8 w-8 text-gray-300" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}