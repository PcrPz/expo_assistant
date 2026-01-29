// src/features/products/components/products/ProductsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, RefreshCw } from 'lucide-react';
import { getBoothProducts } from '../../api/productApi';
import { canManageProducts } from '../../utils/permissions';
import type { Product, ProductDetail } from '../../types/product.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { CreateProductModal } from './CreateProductModal';
import { EditProductModal } from './EditProductModal';

interface ProductsTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function ProductsTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
}: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);

  const canManage = canManageProducts(userRole, isAssignedStaff);

  useEffect(() => {
    loadProducts();
  }, [boothId, expoId]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">สินค้าบูธ</h3>
          <p className="text-sm text-gray-500 mt-1">
            จัดการสินค้าและแสดงรายละเอียดสินค้าของบูธนี้
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
          >
            <Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </button>
        )}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              ยังไม่มีสินค้า
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {canManage
                ? 'เริ่มต้นโดยการเพิ่มสินค้าเข้าบูธนี้'
                : 'ยังไม่มีสินค้าในบูธนี้'}
            </p>
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
              >
                <Plus className="h-4 w-4" />
                เพิ่มสินค้า
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.ProductID}
              product={product}
              onView={() => setViewingProductId(product.ProductID)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProductModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadProducts();
          }}
        />
      )}

      {/* Detail Modal */}
      {viewingProductId && (
        <ProductDetailModal
          productId={viewingProductId}
          expoId={expoId}
          canManage={canManage}
          onClose={() => setViewingProductId(null)}
          onEdit={(product) => {
            setViewingProductId(null);
            setEditingProduct(product);
          }}
          onRefresh={() => {
            loadProducts();
            setViewingProductId(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          expoId={expoId}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}