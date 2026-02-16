// src/features/booths/components/forms/FormCard.tsx
'use client';

import { 
  FileText, 
  Eye, 
  Edit2, 
  BarChart3, 
  Trash2, 
  Send,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
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
  status,
  totalQuestions,
  totalResponses,
  updatedAt,
  canManage,
  onView,
  onEdit,
  onViewResults,
  onDelete,
  onToggleStatus,
}: FormCardProps) {
  const isPublished = status === 'publish';

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header with gradient */}
      <div className={`p-6 ${
        isPublished 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isPublished 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-[#3674B5]'
            }`}>
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                แบบสอบถามของบูธ
              </h3>
              <div className="flex items-center gap-3">
                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    เผยแพร่แล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    ฉบับร่าง
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          {canManage && (
            <button
              onClick={onDelete}
              className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="ลบแบบสอบถาม"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#3674B5] mb-1">
              {totalQuestions}
            </div>
            <div className="text-sm text-gray-600">คำถาม</div>
          </div>
          <div className="text-center border-l border-r border-gray-300">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {totalResponses}
            </div>
            <div className="text-sm text-gray-600">คำตอบ</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">อัปเดตล่าสุด</div>
            <div className="text-sm font-semibold text-gray-900">
              {new Date(updatedAt).toLocaleDateString('th-TH', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Section - แสดงเฉพาะเมื่อ unpublish */}
      {!isPublished && canManage && (
        <div className="p-5 bg-blue-50 border-b-2 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Send className="h-5 w-5 text-[#3674B5]" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">
                พร้อมเผยแพร่แบบสอบถาม?
              </h4>
              <p className="text-sm text-gray-600">
                เมื่อเผยแพร่แล้ว ผู้เข้าชมจะตอบแบบสอบถามได้ทันที (เผยแพร่ได้ครั้งเดียว)
              </p>
            </div>
            <button
              onClick={onToggleStatus}
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Send className="h-4 w-4" />
              เผยแพร่เลย
            </button>
          </div>
        </div>
      )}

      {/* Published Notice */}
      {isPublished && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              แบบสอบถามนี้เผยแพร่แล้ว ผู้เข้าชมสามารถตอบแบบสอบถามได้
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-5 bg-white">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onView}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-blue-50 transition font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>ดูตัวอย่าง</span>
          </button>

          {canManage && (
            <button
              onClick={onEdit}
              disabled={isPublished}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white border-gray-300 text-gray-700 hover:border-[#3674B5] hover:text-[#3674B5] hover:bg-blue-50 disabled:hover:border-gray-300 disabled:hover:text-gray-700 disabled:hover:bg-white"
              title={isPublished ? 'ไม่สามารถแก้ไขแบบสอบถามที่เผยแพร่แล้ว' : 'แก้ไขแบบสอบถาม'}
            >
              <Edit2 className="h-4 w-4" />
              <span>แก้ไข</span>
            </button>
          )}

          <button
            onClick={onViewResults}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#3674B5] border-2 border-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] hover:border-[#2d5a8f] transition font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            <span>ผลสรุป</span>
          </button>
        </div>

        {/* Warning when published */}
        {isPublished && canManage && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                ไม่สามารถแก้ไขแบบสอบถามที่เผยแพร่แล้ว หากต้องการเปลี่ยนแปลง กรุณาลบและสร้างใหม่
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}