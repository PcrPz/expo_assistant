// src/features/booths/components/documents/DocumentDetailModal.tsx
'use client';

import { X, Download, Edit2, FileText, Calendar, Eye } from 'lucide-react';
import { downloadDocument } from '../../api/documentApi';
import type { BoothDocument } from '../../types/document.types';
import { useState } from 'react';

interface DocumentDetailModalProps {
  document: BoothDocument;
  expoId: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

export function DocumentDetailModal({
  document,
  expoId,
  canManage,
  onClose,
  onEdit,
  onRefresh,
}: DocumentDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadDocument(expoId, document.DocID, `${document.Title}.pdf`);
    } catch (error) {
      alert('ไม่สามารถดาวน์โหลดเอกสารได้');
    } finally {
      setIsDownloading(false);
    }
  };

  const isPublished = document.Status === 'published';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="h-6 w-6 text-[#3674B5] flex-shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {document.Title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition ml-4"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">สถานะ:</span>
            </div>
            {isPublished ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                เผยแพร่แล้ว
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                ยังไม่เผยแพร่
              </span>
            )}
          </div>

          {/* Publish Date */}
          {document.PublishAt && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">วันที่เผยแพร่:</span>
              </div>
              <span className="text-sm text-gray-900 font-medium">
                {new Date(document.PublishAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* PDF Preview Placeholder */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-12 text-center">
            <FileText className="h-20 w-20 text-[#3674B5] mx-auto mb-4" />
            <p className="text-gray-600 mb-2">เอกสาร PDF</p>
            <p className="text-sm text-gray-500">
              คลิก "ดาวน์โหลด" เพื่อดูเอกสารฉบับเต็ม
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition"
            >
              ปิด
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังดาวน์โหลด...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </>
              )}
            </button>

            {canManage && (
              <button
                onClick={onEdit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition"
              >
                <Edit2 className="h-4 w-4" />
                แก้ไข
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}