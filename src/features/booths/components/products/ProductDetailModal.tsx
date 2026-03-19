// src/features/booths/components/products/ProductDetailModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getProductDetail } from '../../api/productApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { ProductDetail } from '../../types/product.types';

interface ProductDetailModalProps {
  productId: string;
  expoId: string;
  boothId: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: (product: ProductDetail) => void;
  onRefresh: () => void;
}

export function ProductDetailModal({
  productId, expoId, boothId, canManage, onClose, onEdit, onRefresh,
}: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => { loadProduct(); }, [productId, expoId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const data = await getProductDetail(expoId, productId);
      setProduct(data);
      setActiveIdx(0);
    } catch {
      alert('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    try {
      const num = parseFloat(price);
      if (num === 0) return 'ฟรี';
      return `฿${new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    } catch { return price; }
  };

  // ✅ รวม Thumbnail + Pics[] เป็น gallery เดียว — thumbnail อยู่หน้าสุด
  const buildGallery = (p: ProductDetail): string[] => {
    const pics = p.Pics?.filter(Boolean) ?? [];
    if (p.Thumbnail) {
      // ป้องกัน thumbnail ซ้ำกับ Pics
      const hasDup = pics.some(pic => pic === p.Thumbnail);
      return hasDup ? pics : [p.Thumbnail, ...pics];
    }
    return pics;
  };

  const allImages = product ? buildGallery(product) : [];
  const isFree = product ? parseFloat(product.Price) === 0 : false;

  const prev = () => setActiveIdx(i => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () => setActiveIdx(i => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* ขยายเป็น max-w-3xl เพื่อให้ไม่แน่นเกิน */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full flex flex-col"
          style={{ maxWidth: '780px', maxHeight: '90vh' }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-[16px] font-bold text-gray-900">รายละเอียดสินค้า</h2>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Loading ── */}
          {isLoading || !product ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-7 w-7 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : (
            <>
              {/* ── Body: 2 col ── */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-[1fr_1fr] min-h-[360px]">

                  {/* ── LEFT: รูปภาพ ── */}
                  <div className="p-5 bg-[#FAFBFC] flex flex-col gap-3 border-r border-[#F0F4F8]">

                    {/* Main image — ใหญ่ขึ้น */}
                    <div
                      className="relative rounded-xl overflow-hidden bg-[#F0F4F8] flex items-center justify-center group w-full"
                      style={{ aspectRatio: '1/1' }}
                    >
                      {allImages.length > 0 ? (
                        <>
                          <img
                            src={getMinioFileUrl(allImages[activeIdx]) || ''}
                            alt={product.Title}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          {allImages.length > 1 && (
                            <>
                              <button onClick={prev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                              </button>
                              <button onClick={next}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                              </button>
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-[11px] rounded-full">
                                {activeIdx + 1} / {allImages.length}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <Package className="h-20 w-20 text-gray-300" />
                      )}
                    </div>

                    {/* Thumbnail strip */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {allImages.map((img, i) => (
                          <button key={i} onClick={() => setActiveIdx(i)}
                            className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                              i === activeIdx ? 'border-[#3674B5]' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{ width: '52px', height: '52px' }}>
                            <img
                              src={getMinioFileUrl(img) || ''}
                              alt={`รูป ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── RIGHT: ข้อมูล ── */}
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto">

                    {/* ชื่อ */}
                    <h3 className="text-[17px] font-bold text-gray-900 leading-snug">
                      {product.Title}
                    </h3>

                    {/* ราคา */}
                    <div className="bg-[#EBF3FC] rounded-xl px-5 py-4">
                      <p className="text-[10px] font-bold text-[#3674B5]/70 uppercase tracking-[.06em] mb-1">ราคา</p>
                      <p className={`text-[26px] font-extrabold leading-none ${isFree ? 'text-green-600' : 'text-[#3674B5]'}`}>
                        {formatPrice(product.Price)}
                      </p>
                    </div>

                    {/* รายละเอียด */}
                    <div className="border-t border-[#F0F4F8] pt-4 flex-1">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[.06em] mb-2">รายละเอียด</p>
                      {product.Detail ? (
                        <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {product.Detail}
                        </p>
                      ) : (
                        <p className="text-[14px] text-gray-300 italic">ยังไม่มีรายละเอียดสินค้า</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* ── Footer ── */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                  ปิด
                </button>
                {canManage && (
                  <button onClick={() => onEdit(product)}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    แก้ไขสินค้า
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}