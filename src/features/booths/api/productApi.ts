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
 * POST /booth-product/:expoID/create
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

  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/create`,
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
 * PUT /booth-product/:expoID/update
 */
export async function updateProduct(
  expoId: string,
  data: UpdateProductRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  
  formData.append('product_id', data.product_id);
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

  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/update`,
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
 * DELETE /booth-product/:expoID/delete/:productID
 */
export async function deleteProduct(
  expoId: string,
  productId: string
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-product/${expoId}/delete/${productId}`,
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