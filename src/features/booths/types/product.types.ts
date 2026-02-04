// src/features/booths/types/product.types.ts

/**
 * Product - สินค้าในบูธ
 * Backend Response ใช้ PascalCase
 *
 * Note: Backend ส่ง empty string ("") แทน null สำหรับ Detail และ Thumbnail
 */
export interface Product {
  ProductID: string;
  BoothID: string;
  Title: string;
  Detail: string;        // Backend ส่ง "" ถ้าไม่มีค่า (ไม่ใช่ null)
  Price: string;
  Thumbnail: string;     // Backend ส่ง "" ถ้าไม่มีรูป (ไม่ใช่ null)
  CreatedAt: string;
  UpdatedAt: string;
}

/**
 * ProductDetail - รายละเอียดสินค้าแบบเต็ม
 * รวมรูปรายละเอียดด้วย
 */
export interface ProductDetail extends Product {
  Pics: string[];        // รูปรายละเอียด (URLs encrypted)
}

/**
 * CreateProductRequest - สร้างสินค้า
 */
export interface CreateProductRequest {
  booth_id: string;
  title: string;
  detail?: string;
  price?: number;
  thumbnail_file?: File;
  files?: File[];
}

/**
 * UpdateProductRequest - แก้ไขสินค้า
 */
export interface UpdateProductRequest {
  product_id: string;
  booth_id: string;
  title: string;
  detail?: string;
  price?: number;
  thumbnail?: string;
  thumbnail_file?: File;
  files?: File[];
  deleted_pics?: string[];
}

/**
 * DeleteProductRequest - ลบสินค้า
 */
export interface DeleteProductRequest {
  product_id: string;
  booth_id: string;
}