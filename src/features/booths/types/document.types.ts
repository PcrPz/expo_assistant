// src/features/booths/types/document.types.ts

/**
 * BoothDocument - เอกสารบูธ
 * ✅ ใช้ PascalCase ตรงกับ Backend Response
 */
export interface BoothDocument {
  DocID: string;      // Backend ส่งมาเป็น PascalCase
  Title: string;
  Status: 'published' | 'unpublished';
  PublishAt: string | null;  // ISO timestamp
}

/**
 * CreateDocumentRequest - สร้างเอกสาร
 */
export interface CreateDocumentRequest {
  booth_id: string;
  title?: string;  // optional - ถ้าไม่ส่งจะใช้ชื่อไฟล์
  status: 'published' | 'unpublished';
  file: File;
}

/**
 * UpdateDocumentRequest - แก้ไขเอกสาร
 */
export interface UpdateDocumentRequest {
  doc_id: string;
  title: string;
  status: 'published' | 'unpublished';
  file?: File;  // optional - ถ้าไม่ส่งจะไม่เปลี่ยนไฟล์
}

/**
 * DeleteDocumentsRequest - ลบเอกสาร
 */
export interface DeleteDocumentsRequest {
  doc_list: string[];  // array of doc_id
}

/**
 * CreateMultipleDocumentsRequest - สร้างหลายเอกสาร
 */
export interface CreateMultipleDocumentsRequest {
  booth_id: string;
  status: 'published' | 'unpublished';
  files: File[];
}