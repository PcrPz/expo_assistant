// src/features/booths/components/forms/FormCard.tsx
'use client';

import { FileText, Eye, Edit2, BarChart3, Trash2, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { FormStatus } from '../../types/form.types';

interface FormCardProps {
  status: FormStatus;
  totalQuestions: number;
  totalResponses: number;
  updatedAt: string;
  canManage: boolean;
  onView: () => void;
  onEdit: () => void;
  onViewResults: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function FormCard({
  status, totalQuestions, totalResponses, updatedAt,
  canManage, onView, onEdit, onViewResults, onDelete, onToggleStatus,
}: FormCardProps) {
  const isPublished = status === 'publish';

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-[#E2E8F0] overflow-hidden">

      {/* Top row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FC] flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-[#3674B5]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900">แบบสอบถามของบูธ</p>
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
        {canManage && (
          <button onClick={onDelete}
            className="w-8 h-8 bg-red-50 text-red-500 rounded-[9px] flex items-center justify-center hover:bg-red-100 transition flex-shrink-0">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-[#F0F4F8] border-b border-[#F0F4F8]">
        <div className="py-4 text-center">
          <p className="text-[20px] font-bold text-[#3674B5]">{totalQuestions}</p>
          <p className="text-xs text-gray-400 mt-0.5">คำถาม</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-[20px] font-bold text-green-600">{totalResponses}</p>
          <p className="text-xs text-gray-400 mt-0.5">คำตอบ</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-xs text-gray-400">อัปเดตล่าสุด</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {new Date(updatedAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Publish banner */}
      {!isPublished && canManage && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-[#EBF3FC] border-b border-[#BFDBFE]">
          <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
            <Send className="h-4 w-4 text-[#3674B5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">พร้อมเผยแพร่แบบสอบถาม?</p>
            <p className="text-xs text-gray-500 mt-0.5">เมื่อเผยแพร่แล้ว ผู้เข้าชมจะตอบได้ทันที (เผยแพร่ได้ครั้งเดียว)</p>
          </div>
          <button onClick={onToggleStatus}
            className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex-shrink-0">
            <Send className="h-3.5 w-3.5" />
            เผยแพร่เลย
          </button>
        </div>
      )}

      {/* Published notice */}
      {isPublished && (
        <div className="flex items-center gap-2 px-5 py-3 bg-green-50 border-b border-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          <p className="text-xs font-medium text-green-700">
            แบบสอบถามนี้เผยแพร่แล้ว ผู้เข้าชมสามารถตอบแบบสอบถามได้
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 px-5 py-4">
        <button onClick={onView}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] text-gray-600 text-[12px] font-semibold rounded-[9px] hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EBF3FC] transition">
          <Eye className="h-3.5 w-3.5" />ดูตัวอย่าง
        </button>
        {canManage && (
          <button onClick={onEdit} disabled={isPublished}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0] text-gray-600 text-[12px] font-semibold rounded-[9px] hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-[#EBF3FC] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E2E8F0] disabled:hover:text-gray-600 disabled:hover:bg-[#F8FAFC]">
            <Edit2 className="h-3.5 w-3.5" />แก้ไข
          </button>
        )}
        <button onClick={onViewResults}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-[#3674B5] text-white text-[12px] font-semibold rounded-[9px] hover:bg-[#2d5a8f] transition">
          <BarChart3 className="h-3.5 w-3.5" />ผลสรุป
        </button>
      </div>

      {/* Warning */}
      {isPublished && canManage && (
        <div className="px-5 pb-4">
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">ไม่สามารถแก้ไขแบบสอบถามที่เผยแพร่แล้ว หากต้องการเปลี่ยนแปลง กรุณาลบและสร้างใหม่</p>
          </div>
        </div>
      )}
    </div>
  );
}