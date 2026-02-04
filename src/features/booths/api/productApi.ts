// src/features/products/api/productApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type { 
  Product, 
  ProductDetail, 
  CreateProductRequest, 
  UpdateProductRequest 
} from '../types/product.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Get products list for a booth
 * GET /booth-product/:expoID/get-products/:boothID
 */
export async function getBoothProducts(
  expoId: string, 
  boothId: string
): Promise<Product[]> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-product/${expoId}/get-products/${boothId}`
    );

    if (!response.ok) {
      console.error(`Failed to get products: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

/**
 * Get product detail
 * GET /booth-product/:expoID/get/:productID
 */
export async function getProductDetail(
  expoId: string, 
  productId: string
): Promise<ProductDetail | null> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-product/${expoId}/get/${productId}`
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting product detail:', error);
    return null;
  }
}

/**
 * Create product
 * POST /booth-product/:expoID/:boothID/create
 * ✅ FIXED: Added /${data.booth_id} to path
 */
export async function createProduct(
  expoId: string,
  data: CreateProductRequest
): Promise<{ productID: string }> {
  const formData = new FormData();
  
  formData.append('booth_id', data.booth_id);
  formData.append('title', data.title);
  
  if (data.detail) {
    formData.append('detail', data.detail);
  }
  
  if (data.price !== undefined) {
    formData.append('price', data.price.toString());
  }
  
  if (data.thumbnail_file) {
    formData.append('thumbnail_file', data.thumbnail_file);
  }
  
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // ✅ FIXED: Added /${data.booth_id} to path
  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/${data.booth_id}/create`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create product');
  }

  return await response.json();
}

/**
 * Update product
 * PUT /booth-product/:expoID/:boothID/update
 * ✅ FIXED: Added /${data.booth_id} to path
 */
export async function updateProduct(
  expoId: string,
  data: UpdateProductRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  
  formData.append('product_id', data.product_id);
  formData.append('booth_id', data.booth_id); // ✅ เพิ่ม booth_id
  formData.append('title', data.title);
  
  if (data.detail) {
    formData.append('detail', data.detail);
  }
  
  if (data.price !== undefined) {
    formData.append('price', data.price.toString());
  }
  
  if (data.thumbnail) {
    formData.append('thumbnail', data.thumbnail);
  }
  
  if (data.thumbnail_file) {
    formData.append('thumbnail_file', data.thumbnail_file);
  }
  
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }
  
  if (data.deleted_pics && data.deleted_pics.length > 0) {
    data.deleted_pics.forEach((pic) => {
      formData.append('deleted_pics', pic);
    });
  }

  // ✅ FIXED: Added /${data.booth_id} to path
  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/${data.booth_id}/update`,
    {
      method: 'PUT',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update product');
  }

  return await response.json();
}

/**
 * Delete product
 * DELETE /booth-product/:expoID/:boothID/delete/:productID
 * ✅ FIXED: Added boothId parameter and /${boothId} to path
 */
export async function deleteProduct(
  expoId: string,
  boothId: string, // ✅ เพิ่ม parameter
  productId: string
): Promise<{ message: string }> {
  // ✅ FIXED: Added /${boothId} to path
  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/${boothId}/delete/${productId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete product');
  }

  return await response.json();
}