// src/features/booths/components/forms/FormsTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">แบบสอบถาม</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            รับ feedback จากผู้เข้าชมงาน
          </p>
        </div>
      </div>

      {/* Empty State */}
      {!form && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10">
          <div className="text-center">
            <FileText className="h-6 w-6 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-500">
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
                className="mt-4 mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
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
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">ลบแบบสอบถาม</h2>
                    <p className="text-xs text-gray-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                  </div>
                </div>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-gray-400">ลบ</p>
                  <p className="text-[15px] font-bold text-gray-900 mt-0.5">แบบสอบถามของบูธ</p>
                </div>
                <ul className="space-y-1.5">
                  {['แบบสอบถามและคำตอบทั้งหมดจะถูกลบถาวร', 'ผู้เข้าชมจะไม่สามารถตอบแบบสอบถามได้อีก'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" />ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}