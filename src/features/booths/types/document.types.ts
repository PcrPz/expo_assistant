// src/features/booths/types/document.types.ts

/**
 * BoothDocument - เอกสารบูธ
 * ✅ ใช้ PascalCase ตรงกับ Backend Response
 */
export interface BoothDocument {
  DocID: string;
  BoothID: string;
  Title: string;
  Status: 'publish' | 'unpublish';
  PublishAt: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  Thumbnail: string | null;
  AccessLevel: 'public' | 'private';
  DocExtension: string;
}

/**
 * CreateDocumentRequest - สร้างเอกสาร
 */
export interface CreateDocumentRequest {
  booth_id: string;
  title?: string;
  status: 'publish' | 'unpublish';
  file: File;
  thumbnail_file?: File;
  access_level: 'public' | 'private';
}

/**
 * UpdateDocumentRequest - แก้ไขเอกสาร
 * ⚠️ Note: booth_id ไม่อยู่ใน request body แต่อยู่ใน API path
 */
export interface UpdateDocumentRequest {
  doc_id: string;
  title: string;
  status: 'publish' | 'unpublish';
  file?: File;
  thumbnail?: string;
  thumbnail_file?: File;
  access_level: 'public' | 'private';
}

/**
 * DeleteDocumentsRequest - ลบเอกสาร
 * ⚠️ Note: booth_id ไม่อยู่ใน request body แต่อยู่ใน API path
 */
export interface DeleteDocumentsRequest {
  doc_list: string[];
}

/**
 * CreateMultipleDocumentsRequest - สร้างหลายเอกสาร
 */
export interface CreateMultipleDocumentsRequest {
  booth_id: string;
  status: 'publish' | 'unpublish';
  files: File[];
}