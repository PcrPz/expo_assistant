// src/features/booths/components/documents/DocumentCard.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { Download, Edit2, Trash2 } from 'lucide-react';
import { downloadDocument, deleteDocuments } from '../../api/documentApi';
import type { BoothDocument } from '../../types/document.types';

interface DocumentCardProps {
  document: BoothDocument;
  boothId: string;
  canManage: boolean;
  onEdit: () => void;
  onRefresh: () => void;
  expoId: string;
}

export function DocumentCard({
  document,
  boothId,
  canManage,
  onEdit,
  onRefresh,
  expoId,
}: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Logic unchanged ──────────────────────────────────────────
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDownloading(true);
      await downloadDocument(expoId, document.DocID, `${document.Title}.pdf`);
    } catch {
      toast.error('ไม่สามารถดาวน์โหลดเอกสารได้');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDocuments(expoId, boothId, [document.DocID]);
      toast.success('ลบเอกสารสำเร็จ');
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบเอกสารได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const isPublished = document.Status === 'publish';

  return (
    <>
      {/* ── Card — Option C: left accent strip ─────────────────── */}
      <div className="bg-white rounded-[14px] border-[1.5px] border-[#E2E8F0] overflow-hidden flex hover:border-[#3674B5] transition-colors">

        {/* Accent strip — น้ำเงินถ้า publish, เทาถ้าไม่ */}
        <div
          className="w-1 flex-shrink-0"
          style={{ background: isPublished ? '#3674B5' : '#D1D5DB' }}
        />

        {/* Card content */}
        <div className="flex-1 px-4 py-3.5 min-w-0">
          {/* Top row: name + status badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-[14px] font-bold text-gray-900 truncate leading-snug">
              {document.Title}
            </p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${
              isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isPublished ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              {isPublished ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่'}
            </span>
          </div>

          {/* Sub label */}
          <p className="text-[11px] text-gray-400 mb-3">PDF / เอกสาร</p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#EBF3FC] text-[#3674B5] rounded-[9px] text-[12px] font-semibold hover:bg-[#DBEAFE] transition disabled:opacity-50"
            >
              {isDownloading ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              ดาวน์โหลด
            </button>

            {canManage && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-[#FEF3C7] text-amber-600 hover:bg-amber-100 transition flex-shrink-0"
                  title="แก้ไข"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50 flex-shrink-0"
                  title="ลบ"
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"/>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Modal ─────────────────────────────────────────── */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowDeleteModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ลบเอกสาร</h2>
                    <p className="text-xs text-gray-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                  </div>
                </div>
                <button onClick={() => setShowDeleteModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-gray-400">ลบเอกสาร</p>
                  <p className="text-[15px] font-bold text-gray-900 mt-0.5">"{document.Title}"</p>
                </div>
                <ul className="space-y-1.5">
                  {['เอกสารจะถูกลบออกจากระบบอย่างถาวร', 'ผู้เข้าชมจะไม่สามารถดาวน์โหลดได้อีก'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                  ยกเลิก
                </button>
                <button onClick={handleConfirmDelete} disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isDeleting ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังลบ...</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>ยืนยันการลบ</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}