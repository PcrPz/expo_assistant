// src/features/booths/components/forms/FormsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { getBoothForm, updateFormStatus, deleteBoothForm } from '../../api/formApi';

import type { EventRole } from '@/src/features/events/types/event.types';
import type { GetFormResponse } from '../../types/form.types';
import { FormCard } from './FormCard';
import { CreateFormModal } from './CreateFormModal';
import { EditFormModal } from './EditFormModal';
import { FormPreviewModal } from './FormPreviewModal';
import { FormResultsModal } from './FormResultsModal';
import { canManageForms } from '../../utils/form-permission';

interface FormsTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function FormsTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
}: FormsTabProps) {
  const [form, setForm] = useState<GetFormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManage = canManageForms(userRole, isAssignedStaff);

  useEffect(() => {
    loadForm();
  }, [boothId, expoId]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      const data = await getBoothForm(expoId, boothId);
      setForm(data);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!form) return;
    
    // ✅ ถ้าเผยแพร่แล้ว ห้าม unpublish
    if (form.status === 'publish') {
      alert('ไม่สามารถยกเลิกการเผยแพร่ได้\nหากต้องการเปลี่ยนแปลง กรุณาลบและสร้างแบบสอบถามใหม่');
      return;
    }
    
    // Confirm ก่อนเผยแพร่
    const confirmed = window.confirm(
      'คุณแน่ใจหรือไม่ว่าต้องการเผยแพร่แบบสอบถาม?\n\n' +
      '⚠️ หมายเหตุ:\n' +
      '- เมื่อเผยแพร่แล้ว ผู้เข้าชมจะสามารถตอบแบบสอบถามได้ทันที\n' +
      '- คุณจะไม่สามารถแก้ไขหรือยกเลิกการเผยแพร่ได้\n' +
      '- หากต้องการเปลี่ยนแปลง ต้องลบและสร้างใหม่'
    );
    
    if (!confirmed) return;
    
    try {
      await updateFormStatus(expoId, boothId, 'publish');
      alert('✓ เผยแพร่แบบสอบถามสำเร็จ!\nผู้เข้าชมสามารถตอบแบบสอบถามได้แล้ว');
      loadForm();
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBoothForm(expoId, boothId);
      alert('ลบแบบสอบถามสำเร็จ');
      setShowDeleteConfirm(false);
      loadForm();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบแบบสอบถามได้');
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
          <h3 className="text-lg font-semibold text-gray-900">แบบสอบถาม</h3>
          <p className="text-sm text-gray-500 mt-1">
            รับ feedback จากผู้เข้าชมงาน
          </p>
        </div>
      </div>

      {/* Empty State */}
      {!form && (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              ยังไม่มีแบบสอบถาม
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {canManage
                ? 'สร้างแบบสอบถามเพื่อรับ feedback จากผู้เข้าชม'
                : 'ยังไม่มีแบบสอบถามในบูธนี้'}
            </p>
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition"
              >
                <Plus className="h-4 w-4" />
                สร้างแบบสอบถาม
              </button>
            )}
          </div>
        </div>
      )}

      {/* Form Card */}
      {form && (
        <FormCard
          status={form.status}
          totalQuestions={form.questions.length}
          totalResponses={0}
          updatedAt={new Date().toISOString()}
          canManage={canManage}
          onView={() => setShowPreviewModal(true)}
          onEdit={() => setShowEditModal(true)}
          onViewResults={() => setShowResultsModal(true)}
          onDelete={() => setShowDeleteConfirm(true)}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateFormModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadForm();
          }}
        />
      )}

      {showEditModal && form && (
        <EditFormModal
          expoId={expoId}
          boothId={boothId}
          existingQuestions={form.questions}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadForm();
          }}
        />
      )}

      {showPreviewModal && form && (
        <FormPreviewModal
          questions={form.questions}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {showResultsModal && (
        <FormResultsModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowResultsModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ลบแบบสอบถาม</h3>
            <p className="text-gray-600 mb-4">
              คุณแน่ใจหรือไม่ว่าต้องการลบแบบสอบถามนี้?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ลบแบบสอบถาม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}