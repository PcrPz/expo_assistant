// src/features/booths/components/documents/DocumentCard.tsx
'use client';

import { useState } from 'react';
import { FileText, Download, Edit2, Trash2, Eye } from 'lucide-react';
import { downloadDocument, deleteDocuments } from '../../api/documentApi';
import type { BoothDocument } from '../../types/document.types';

interface DocumentCardProps {
  document: BoothDocument;
  boothId: string; // ✅ เพิ่ม
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  expoId: string;
}

export function DocumentCard({
  document,
  boothId, // ✅ เพิ่ม
  canManage,
  onView,
  onEdit,
  onRefresh,
  expoId,
}: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      setIsDownloading(true);
      await downloadDocument(expoId, document.DocID, `${document.Title}.pdf`);
    } catch (error) {
      alert('ไม่สามารถดาวน์โหลดเอกสารได้');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      // ✅ FIXED: Added boothId parameter
      await deleteDocuments(expoId, boothId, [document.DocID]);
      alert('ลบเอกสารสำเร็จ');
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบเอกสารได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isPublished = document.Status === 'published';

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="group bg-white rounded-xl border-2 border-gray-200 hover:border-[#3674B5] hover:shadow-lg transition-all duration-200 overflow-hidden">
        {/* Header with Icon and Status */}
        <div className="relative p-4 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="h-7 w-7 text-[#3674B5]" />
            </div>
            {/* Badge "เอกสาร" */}
            <span className="px-2.5 py-1 bg-blue-400 text-white text-xs font-semibold rounded-md">
              เอกสาร
            </span>
          </div>
          
          {/* Status Badge */}
          {isPublished ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              เผยแพร่แล้ว
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              ยังไม่เผยแพร่
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title - บรรทัดเดียว */}
          <div className="mb-4">
            <h4 className="text-base font-bold text-gray-900">
              <span className="text-gray-600 font-normal">เอกสาร : </span>
              <span className="break-words">{document.Title}</span>
            </h4>
          </div>

          {/* Date (ถ้ามี) */}
          {document.PublishAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>อัปเดต: {formatDate(document.PublishAt)}</span>
            </div>
          )}

           {/* View Button - Full Width */}
          <button
            onClick={onView}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 mb-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <Eye className="h-4 w-4" />
            ดูรายละเอียด
          </button>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium disabled:opacity-50"
              title="ดาวน์โหลด"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>ดาวน์โหลด</span>
                </>
              )}
            </button>

            {canManage && (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center justify-center w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                  title="แก้ไข"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                  title="ลบ"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ลบเอกสาร</h3>
                  <p className="text-sm text-gray-500 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700">
                คุณต้องการลบเอกสาร <span className="font-semibold">"{document.Title}"</span> หรือไม่?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                เอกสารนี้จะถูกลบออกจากระบบอย่างถาวร
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังลบ...
                  </span>
                ) : (
                  'ลบเอกสาร'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}