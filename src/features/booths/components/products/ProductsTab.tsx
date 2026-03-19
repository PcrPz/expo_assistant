// src/features/booths/components/products/ProductsTab.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { canManageProducts } from '../../utils/permissions';
import type { EventRole } from '@/src/features/events/types/event.types';
import { ProductCard } from './ProductCard';
import { CreateProductModal } from './CreateProductModal';
import { ProductDetailModal } from './ProductDetailModal';
import { Product, ProductDetail } from '../../types/product.types';
import { EditProductModal } from './EditProductModal';
import { getBoothProducts, deleteProduct } from '../../api/productApi';

interface ProductsTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function ProductsTab({ boothId, expoId, userRole, isAssignedStaff }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);

  // Delete state — จัดการใน Tab แทน DetailModal เพื่อให้ใช้ได้จาก Card โดยตรง
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = canManageProducts(userRole, isAssignedStaff);

  useEffect(() => { loadProducts(); }, [boothId, expoId]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getBoothProducts(expoId, boothId);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p => (p.Title || '').toLowerCase().includes(q));
  }, [products, search]);

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      await deleteProduct(expoId, boothId, deletingProduct.ProductID);
      alert('ลบสินค้าสำเร็จ');
      loadProducts();
      setDeletingProduct(null);
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบสินค้าได้');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Tab header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">สินค้าและบริการ</h2>
          <p className="text-sm text-gray-400 mt-0.5">จัดการสินค้าและบริการของบูธนี้</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </button>
        )}
      </div>

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">ยังไม่มีสินค้า</p>
          <p className="text-xs text-gray-400 mt-1">
            {canManage ? 'เริ่มต้นโดยการเพิ่มสินค้าเข้าบูธนี้' : 'ยังไม่มีสินค้าในบูธนี้'}
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
            >
              <Plus className="h-4 w-4" />
              เพิ่มสินค้า
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้าจากชื่อ..."
              className="w-full pl-9 pr-10 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {search && (
            <p className="text-xs text-gray-400">
              พบ {filtered.length} รายการ{filtered.length !== products.length && ` จาก ${products.length} ทั้งหมด`}
            </p>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
              <p className="text-sm text-gray-400">ไม่พบสินค้าที่ค้นหา</p>
              <button onClick={() => setSearch('')} className="mt-2 text-xs text-[#3674B5] hover:underline">
                ล้างการค้นหา
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.ProductID}
                  product={product}
                  canManage={canManage}
                  onView={() => setViewingProductId(product.ProductID)}
                  onEdit={() => setViewingProductId(product.ProductID)}
                  onDeleteClick={() => setDeletingProduct(product)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProductModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadProducts(); }}
        />
      )}

      {/* Detail Modal */}
      {viewingProductId && (
        <ProductDetailModal
          productId={viewingProductId}
          expoId={expoId}
          boothId={boothId}
          canManage={canManage}
          onClose={() => setViewingProductId(null)}
          onEdit={(product) => { setViewingProductId(null); setEditingProduct(product); }}
          onRefresh={() => { loadProducts(); setViewingProductId(null); }}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          expoId={expoId}
          boothId={boothId}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => { setEditingProduct(null); loadProducts(); }}
        />
      )}

      {/* ── Delete Modal ─────────────────────────────────────── */}
      {deletingProduct && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDeletingProduct(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ลบสินค้า</h2>
                    <p className="text-xs text-gray-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                  </div>
                </div>
                <button onClick={() => setDeletingProduct(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-gray-400">ลบสินค้า</p>
                  <p className="text-[15px] font-bold text-gray-900 mt-0.5">"{deletingProduct.Title}"</p>
                </div>
                <ul className="space-y-1.5">
                  {['สินค้าและรูปภาพจะถูกลบออกจากระบบถาวร', 'ผู้เข้าชมจะไม่เห็นสินค้านี้อีกต่อไป'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
                <button onClick={() => setDeletingProduct(null)} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                  ยกเลิก
                </button>
                <button onClick={handleConfirmDelete} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังลบ...</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>ยืนยันการลบ</>
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}