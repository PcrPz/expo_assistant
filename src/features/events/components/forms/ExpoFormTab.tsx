// src/features/events/components/forms/ExpoFormTab.tsx
'use client';
import { toast } from '@/src/lib/toast';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

import { useState, useEffect } from 'react';
import { FileText, Plus, RefreshCw, Send, CheckCircle2, Clock, Eye, Edit2, BarChart3, Trash2, AlertCircle } from 'lucide-react';
import { getExpoForm, updateExpoFormStatus, deleteExpoForm } from '../../api/expoFormApi';
import type { GetExpoFormResponse } from '../../types/expoForm.types';
import type { EventRole } from '../../types/event.types';
import { ExpoCreateFormModal } from './ExpoCreateFormModal';
import { ExpoEditFormModal } from './ExpoEditFormModal';
import { ExpoFormPreviewModal } from './ExpoFormPreviewModal';
import { ExpoFormResultsModal } from './ExpoFormResultsModal';

interface ExpoFormTabProps {
  expoId: string;
  role: EventRole;
}

function canManage(role: EventRole) {
  if (!role) return false;
  return ['owner', 'admin', 'system_admin', 'staff'].includes(role);
}

export function ExpoFormTab({ expoId, role }: ExpoFormTabProps) {
  const [form, setForm]                   = useState<GetExpoFormResponse | null>(null);
  const [isLoading, setIsLoading]         = useState(true);
  const [showCreate, setShowCreate]       = useState(false);
  const [showEdit, setShowEdit]           = useState(false);
  const [showPreview, setShowPreview]     = useState(false);
  const [showResults, setShowResults]     = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const manage = canManage(role);
  const isPublished = form?.status === 'publish';

  useEffect(() => { loadForm(); }, [expoId]);

  const loadForm = async () => {
    setIsLoading(true);
    try { setForm(await getExpoForm(expoId)); }
    catch (err) { console.error('Failed to load expo form:', err); }
    finally { setIsLoading(false); }
  };

  const handleToggleStatus = async () => {
    if (!form) return;
    if (isPublished) {
      toast.warning('ไม่สามารถยกเลิกการเผยแพร่ได้', { description: 'หากต้องการเปลี่ยนแปลง กรุณาลบและสร้างแบบสอบถามใหม่' });
      return;
    }
    setShowPublishConfirm(true);
  };

  const handleConfirmPublish = async () => {
    setShowPublishConfirm(false);
    try {
      await updateExpoFormStatus(expoId, 'publish');
      toast.success('เผยแพร่แบบสอบถามสำเร็จ', { description: 'ผู้เข้าร่วมงานสามารถตอบได้แล้ว' });
      loadForm();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExpoForm(expoId);
      toast.success('ลบแบบสอบถามสำเร็จ');
      setShowDeleteConfirm(false);
      loadForm();
    } catch (err: any) {
      toast.error(err.message || 'ไม่สามารถลบแบบสอบถามได้');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">แบบสอบถาม</h2>
          <p className="text-sm text-gray-400 mt-0.5">รับ feedback จากผู้เข้าร่วมงาน</p>
        </div>
      </div>

      {/* Empty state */}
      {!form && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">ยังไม่มีแบบสอบถาม</p>
          <p className="text-xs text-gray-400 mt-1">
            {manage ? 'สร้างแบบสอบถามเพื่อรับ feedback จากผู้เข้าร่วมงาน' : 'ยังไม่มีแบบสอบถามในงานนี้'}
          </p>
          {manage && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition">
              <Plus className="h-4 w-4" />สร้างแบบสอบถาม
            </button>
          )}
        </div>
      )}

      {/* Form card */}
      {form && (
        <div className="bg-white rounded-2xl border-[1.5px] border-[#E2E8F0] overflow-hidden">

          {/* Top row */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-[#3674B5]" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900">แบบสอบถามของงาน</p>
                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 bg-green-50 text-green-700 rounded-full text-[11px] font-semibold">
                    <CheckCircle2 className="h-3 w-3" />เผยแพร่แล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-semibold">
                    <Clock className="h-3 w-3" />ฉบับร่าง
                  </span>
                )}
              </div>
            </div>
            {manage && (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="w-8 h-8 bg-red-50 text-red-500 rounded-[9px] flex items-center justify-center hover:bg-red-100 transition flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-[#F0F4F8] border-b border-[#F0F4F8]">
            <div className="py-4 text-center">
              <p className="text-[20px] font-bold text-[#3674B5]">{form.questions.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">คำถาม</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-[20px] font-bold text-green-600">
                {form.questions.filter(q => q.question_type === 'rating').length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">คำถาม Rating</p>
            </div>
          </div>

          {/* Publish banner */}
          {!isPublished && manage && (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-[#EBF3FC] border-b border-[#BFDBFE]">
              <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                <Send className="h-4 w-4 text-[#3674B5]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">พร้อมเผยแพร่แบบสอบถาม?</p>
                <p className="text-xs text-gray-500 mt-0.5">เมื่อเผยแพร่แล้ว ผู้เข้าร่วมงานจะตอบได้ทันที (เผยแพร่ได้ครั้งเดียว)</p>
              </div>
              <button onClick={handleToggleStatus}
                className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0">
                <Send className="h-3.5 w-3.5" />เผยแพร่เลย
              </button>
            </div>
          )}

          {/* Published notice */}
          {isPublished && (
            <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <p className="text-xs font-medium text-green-700">แบบสอบถามนี้เผยแพร่แล้ว ผู้เข้าร่วมงานสามารถตอบได้</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 px-5 py-4">
            <button onClick={() => setShowPreview(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] text-gray-600 text-[12px] font-semibold rounded-[9px] hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EBF3FC] transition">
              <Eye className="h-3.5 w-3.5" />ดูตัวอย่าง
            </button>
            {manage && (
              <button onClick={() => setShowEdit(true)} disabled={isPublished}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] text-gray-600 text-[12px] font-semibold rounded-[9px] hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EBF3FC] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-gray-600 disabled:hover:bg-[#F8FAFC]">
                <Edit2 className="h-3.5 w-3.5" />แก้ไข
              </button>
            )}
            <button onClick={() => setShowResults(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#3674B5] text-white text-[12px] font-semibold rounded-[9px] hover:bg-[#2d5a8f] transition">
              <BarChart3 className="h-3.5 w-3.5" />ผลสรุป
            </button>
          </div>

          {/* Warning */}
          {isPublished && manage && (
            <div className="px-5 pb-4">
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">ไม่สามารถแก้ไขแบบสอบถามที่เผยแพร่แล้ว หากต้องการเปลี่ยนแปลง กรุณาลบและสร้างใหม่</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <ExpoCreateFormModal expoId={expoId}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); loadForm(); }} />
      )}
      {showEdit && form && (
        <ExpoEditFormModal expoId={expoId} existingQuestions={form.questions}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); loadForm(); }} />
      )}
      {showPreview && form && (
        <ExpoFormPreviewModal questions={form.questions} onClose={() => setShowPreview(false)} />
      )}
      {showResults && (
        <ExpoFormResultsModal expoId={expoId} onClose={() => setShowResults(false)} />
      )}

      {/* Publish Confirm */}
      <ConfirmModal
        open={showPublishConfirm}
        onClose={() => setShowPublishConfirm(false)}
        onConfirm={handleConfirmPublish}
        title="เผยแพร่แบบสอบถาม"
        description="คุณแน่ใจหรือไม่ว่าต้องการเผยแพร่?"
        notes={[
          'เมื่อเผยแพร่แล้ว ผู้เข้าร่วมงานจะตอบแบบสอบถามได้ทันที',
          'คุณจะไม่สามารถแก้ไขหรือยกเลิกการเผยแพร่ได้',
          'หากต้องการเปลี่ยนแปลง ต้องลบและสร้างใหม่',
        ]}
        confirmLabel="เผยแพร่เลย"
        confirmColor="#3674B5"
      />

      {/* Delete Confirm */}
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-gray-400">ลบ</p>
                  <p className="text-[15px] font-bold text-gray-900 mt-0.5">แบบสอบถามของงาน</p>
                </div>
                <ul className="space-y-1.5">
                  {['แบบสอบถามและคำตอบทั้งหมดจะถูกลบถาวร', 'ผู้เข้าร่วมงานจะไม่สามารถตอบได้อีก'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />{item}
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