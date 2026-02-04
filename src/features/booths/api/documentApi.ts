// src/features/booths/api/documentApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type { 
  BoothDocument, 
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateMultipleDocumentsRequest,
} from '../types/document.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * ดึงรายการเอกสารทั้งหมดในบูธ
 * GET /booth-doc/:expoID/get-docs/:boothID
 */
export async function getBoothDocuments(
  expoId: string, 
  boothId: string
): Promise<BoothDocument[]> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-doc/${expoId}/get-docs/${boothId}`
    );
    
    if (!response.ok) {
      console.error(`Failed to get documents: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

/**
 * ดึงรายละเอียดเอกสาร 1 ไฟล์
 * GET /booth-doc/:expoID/get/:docID
 */
export async function getDocumentDetail(
  expoId: string,
  docId: string
): Promise<BoothDocument | null> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-doc/${expoId}/get/${docId}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting document detail:', error);
    return null;
  }
}

/**
 * สร้างเอกสาร 1 ไฟล์
 * POST /booth-doc/:expoID/:boothID/create
 * ✅ เพิ่ม boothID ใน path
 */
export async function createDocument(
  expoId: string,
  boothId: string, // ✅ เพิ่ม parameter
  request: CreateDocumentRequest
): Promise<string> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('booth_id', request.booth_id);
  formData.append('status', request.status);
  
  if (request.title) {
    formData.append('title', request.title);
  }
  
  const response = await fetchWithAuth(
    `${API_URL}/booth-doc/${expoId}/${boothId}/create`, // ✅ เพิ่ม boothId
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create document');
  }
  
  const data = await response.json();
  return data.docID;
}

/**
 * สร้างหลายเอกสารพร้อมกัน
 * POST /booth-doc/:expoID/:boothID/multi-create
 * ✅ เพิ่ม boothID ใน path
 */
export async function createMultipleDocuments(
  expoId: string,
  boothId: string, // ✅ เพิ่ม parameter
  request: CreateMultipleDocumentsRequest
): Promise<string[]> {
  const formData = new FormData();
  
  request.files.forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('booth_id', request.booth_id);
  formData.append('status', request.status);
  
  const response = await fetchWithAuth(
    `${API_URL}/booth-doc/${expoId}/${boothId}/multi-create`, // ✅ เพิ่ม boothId
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create documents');
  }
  
  const data = await response.json();
  return data.docIDs || [];
}

/**
 * แก้ไขเอกสาร
 * PUT /booth-doc/:expoID/:boothID/update
 * ✅ เพิ่ม boothID ใน path
 */
export async function updateDocument(
  expoId: string,
  boothId: string, // ✅ เพิ่ม parameter
  request: UpdateDocumentRequest
): Promise<void> {
  const formData = new FormData();
  formData.append('doc_id', request.doc_id);
  formData.append('title', request.title);
  formData.append('status', request.status);
  
  if (request.file) {
    formData.append('file', request.file);
  }
  
  const response = await fetchWithAuth(
    `${API_URL}/booth-doc/${expoId}/${boothId}/update`, // ✅ เพิ่ม boothId
    {
      method: 'PUT',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update document');
  }
}

/**
 * ลบเอกสาร (รองรับลบหลายไฟล์)
 * POST /booth-doc/:expoID/:boothID/remove
 * ✅ เพิ่ม boothID ใน path
 */
export async function deleteDocuments(
  expoId: string,
  boothId: string, // ✅ เพิ่ม parameter
  docIds: string[]
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-doc/${expoId}/${boothId}/remove`, // ✅ เพิ่ม boothId
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doc_list: docIds,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete documents');
  }
}

/**
 * ดาวน์โหลดเอกสาร
 * GET /booth-doc/:expoID/download/:docID
 * ✅ Path นี้ไม่ต้องแก้ (ไม่มี boothID)
 */
export async function downloadDocument(
  expoId: string,
  docId: string,
  filename: string
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-doc/${expoId}/download/${docId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to download document');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'document.pdf';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}