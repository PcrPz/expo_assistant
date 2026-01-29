// src/features/products/types/product.types.ts

/**
 * Product - สินค้าในบูธ
 * Backend Response ใช้ PascalCase
 */
export interface Product {
  ProductID: string;
  Title: string;
  Detail: string;
  Price: string;        // decimal string จาก Backend
  Thumbnail: string;    // รูปปก (URL encrypted)
}

/**
 * ProductDetail - รายละเอียดสินค้าแบบเต็ม
 * รวมรูปรายละเอียดด้วย
 */
export interface ProductDetail extends Product {
  Pics: string[];       // รูปรายละเอียด (URLs encrypted)
}

/**
 * CreateProductRequest - สร้างสินค้า
 */
export interface CreateProductRequest {
  booth_id: string;
  title: string;
  detail?: string;
  price?: number;              // จะแปลงเป็น decimal ที่ Backend
  thumbnail_file?: File;       // รูปปก
  files?: File[];              // รูปรายละเอียด (max 10)
}

/**
 * UpdateProductRequest - แก้ไขสินค้า
 */
export interface UpdateProductRequest {
  product_id: string;
  title: string;
  detail?: string;
  price?: number;
  thumbnail?: string;          // URL เดิม (ถ้าไม่เปลี่ยน)
  thumbnail_file?: File;       // รูปปกใหม่
  files?: File[];              // รูปรายละเอียดใหม่
  deleted_pics?: string[];     // รูปที่จะลบ (URLs)
}

/**
 * DeleteProductRequest - ลบสินค้า
 */
export interface DeleteProductRequest {
  product_id: string;
}