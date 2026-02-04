// src/features/booths/components/documents/DocumentsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { getBoothDocuments } from '../../api/documentApi';
import { canManageDocuments } from '../../utils/permissions';
import type { BoothDocument } from '../../types/document.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { DocumentCard } from './DocumentCard';
import { CreateDocumentModal } from './CreateDocumentModal';
import { EditDocumentModal } from './EditDocumentModal';
import { DocumentDetailModal } from './DocumentDetailModal';

interface DocumentsTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function DocumentsTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
}: DocumentsTabProps) {
  const [documents, setDocuments] = useState<BoothDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<BoothDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<BoothDocument | null>(null);

  const canManage = canManageDocuments(userRole, isAssignedStaff);

  useEffect(() => {
    loadDocuments();
  }, [boothId, expoId]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">เอกสารบูธ</h3>
          <p className="text-sm text-gray-500 mt-1">
            จัดการเอกสารและไฟล์ PDF ของบูธนี้
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
          >
            <Plus className="h-4 w-4" />
            เพิ่มเอกสาร
          </button>
        )}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              ยังไม่มีเอกสาร
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {canManage
                ? 'เริ่มต้นโดยการเพิ่มเอกสารเข้าบูธนี้'
                : 'ยังไม่มีเอกสารในบูธนี้'}
            </p>
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
              >
                <Plus className="h-4 w-4" />
                เพิ่มเอกสาร
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.DocID}
              document={doc}
              boothId={boothId} // ✅ ส่ง boothId
              canManage={canManage}
              onView={() => setViewingDoc(doc)}
              onEdit={() => setEditingDoc(doc)}
              onRefresh={loadDocuments}
              expoId={expoId}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDocumentModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadDocuments();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          expoId={expoId}
          boothId={boothId} // ✅ ส่ง boothId
          onClose={() => setEditingDoc(null)}
          onSuccess={() => {
            setEditingDoc(null);
            loadDocuments();
          }}
        />
      )}

      {/* Detail Modal */}
      {viewingDoc && (
        <DocumentDetailModal
          document={viewingDoc}
          expoId={expoId}
          canManage={canManage}
          onClose={() => setViewingDoc(null)}
          onEdit={() => {
            setEditingDoc(viewingDoc);
            setViewingDoc(null);
          }}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
}