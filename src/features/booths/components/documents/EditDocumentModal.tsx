// src/features/booths/components/documents/EditDocumentModal.tsx
'use client';

import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { updateDocument } from '../../api/documentApi';
import type { BoothDocument } from '../../types/document.types';

interface EditDocumentModalProps {
  document: BoothDocument;
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDocumentModal({
  document,
  expoId,
  boothId,
  onClose,
  onSuccess,
}: EditDocumentModalProps) {
  const [title, setTitle] = useState(document.Title);
  const [status, setStatus] = useState<'published' | 'unpublished'>(document.Status);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  // ✅ ขนาดไฟล์สูงสุด 20MB
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    // Clear previous errors
    setFileError('');
    
    if (selectedFile) {
      // ✅ ตรวจสอบประเภทไฟล์
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('กรุณาเลือกไฟล์ PDF, JPEG หรือ PNG เท่านั้น');
        e.target.value = '';
        return;
      }
      
      // ✅ ตรวจสอบขนาดไฟล์
      if (selectedFile.size > MAX_FILE_SIZE) {
        const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
        setFileError(`ไฟล์มีขนาด ${sizeMB} MB ซึ่งเกินขนาดที่อนุญาต (20 MB)`);
        e.target.value = '';
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('กรุณาระบุชื่อเอกสาร');
      return;
    }

    // ✅ Double check ขนาดไฟล์ก่อน submit (ถ้ามีไฟล์ใหม่)
    if (file && file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      setFileError(`ไฟล์มีขนาด ${sizeMB} MB ซึ่งเกินขนาดที่อนุญาต (20 MB)`);
      return;
    }

    try {
      setIsSubmitting(true);

      await updateDocument(expoId, boothId, {
        doc_id: document.DocID,
        title: title.trim(),
        status,
        file: file || undefined,
      });

      alert('แก้ไขเอกสารสำเร็จ');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถแก้ไขเอกสารได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type === 'image/jpeg') return 'JPEG';
    if (file.type === 'image/png') return 'PNG';
    return 'ไฟล์';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">แก้ไขเอกสาร</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อเอกสาร <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อเอกสาร"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] outline-none transition disabled:bg-gray-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะ <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="unpublished"
                  checked={status === 'unpublished'}
                  onChange={(e) => setStatus(e.target.value as 'unpublished')}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[#3674B5]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">ยังไม่เผยแพร่</p>
                  <p className="text-xs text-gray-500">เก็บไว้ภายในระบบ</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'published')}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[#3674B5]"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">เผยแพร่</p>
                  <p className="text-xs text-gray-500">แสดงให้ผู้เข้าชมเห็น</p>
                </div>
              </label>
            </div>
          </div>

          {/* File Upload (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เปลี่ยนไฟล์ (ถ้าต้องการ)
            </label>
            
            {!file ? (
              <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition
                ${fileError 
                  ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                  : 'border-gray-300 hover:border-[#3674B5] hover:bg-blue-50'
                }`}>
                <Upload className={`h-6 w-6 mb-1 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
                <span className="text-xs text-gray-600">คลิกเพื่อเลือกไฟล์ใหม่</span>
                <span className="text-xs text-gray-400">PDF, JPEG, PNG</span>
                <span className="text-xs text-[#3674B5] font-medium mt-0.5">ขนาดสูงสุด 20 MB</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileTypeLabel(file)} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFileError('');
                  }}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700 transition disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* ✅ Error Message */}
            {fileError && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">ไม่สามารถอัปโหลดไฟล์ได้</p>
                  <p className="text-sm text-red-600 mt-1">{fileError}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              ถ้าไม่เลือกไฟล์ใหม่ ไฟล์เดิมจะไม่เปลี่ยนแปลง
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!fileError}
              className="flex-1 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการเปลี่ยนแปลง'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}