// src/features/booths/components/documents/DocumentsTab.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { getBoothDocuments } from '../../api/documentApi';
import { canManageDocuments } from '../../utils/permissions';
import type { BoothDocument } from '../../types/document.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { DocumentCard } from './DocumentCard';
import { CreateDocumentModal } from './CreateDocumentModal';
import { EditDocumentModal } from './EditDocumentModal';

interface DocumentsTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function DocumentsTab({ boothId, expoId, userRole, isAssignedStaff }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<BoothDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<BoothDocument | null>(null);

  const canManage = canManageDocuments(userRole, isAssignedStaff);

  useEffect(() => { loadDocuments(); }, [boothId, expoId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getBoothDocuments(expoId, boothId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter(d => (d.Title || '').toLowerCase().includes(q));
  }, [documents, search]);

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Tab header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">เอกสารบูธ</h2>
          <p className="text-sm text-gray-400 mt-0.5">จัดการเอกสารและไฟล์ PDF ของบูธนี้</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            เพิ่มเอกสาร
          </button>
        )}
      </div>

      {/* Empty state */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">ยังไม่มีเอกสาร</p>
          <p className="text-xs text-gray-400 mt-1">
            {canManage ? 'เริ่มต้นโดยการเพิ่มเอกสารเข้าบูธนี้' : 'ยังไม่มีเอกสารในบูธนี้'}
          </p>
          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
            >
              <Plus className="h-4 w-4" />
              เพิ่มเอกสาร
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาเอกสารจากชื่อ..."
              className="w-full pl-9 pr-4 py-2.5 text-[14px] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Results count when searching */}
          {search && (
            <p className="text-xs text-gray-400">
              พบ {filtered.length} รายการ{filtered.length !== documents.length && ` จาก ${documents.length} ทั้งหมด`}
            </p>
          )}

          {/* Document grid */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
              <p className="text-sm text-gray-400">ไม่พบเอกสารที่ค้นหา</p>
              <button onClick={() => setSearch('')} className="mt-3 text-xs text-[#3674B5] hover:underline">
                ล้างการค้นหา
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((doc) => (
                <DocumentCard
                  key={doc.DocID}
                  document={doc}
                  boothId={boothId}
                  canManage={canManage}
                  onEdit={() => setEditingDoc(doc)}
                  onRefresh={loadDocuments}
                  expoId={expoId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDocumentModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadDocuments(); }}
        />
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          expoId={expoId}
          boothId={boothId}
          onClose={() => setEditingDoc(null)}
          onSuccess={() => { setEditingDoc(null); loadDocuments(); }}
        />
      )}
    </div>
  );
}