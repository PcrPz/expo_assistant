// src/features/queues/components/queue/ConfirmActionModal.tsx
'use client';

import { CheckCircle, SkipForward, AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
  action: 'complete' | 'skip';
  queueNumber: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  action,
  queueNumber,
  isProcessing,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const isComplete = action === 'complete';

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${isComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isComplete ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              {isComplete ? (
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              ) : (
                <SkipForward className="w-7 h-7 text-amber-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900">
                {isComplete ? 'ทำคิวเสร็จสิ้น?' : 'ข้ามคิว?'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                คิวหมายเลข #{queueNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isComplete ? (
            <>
              <p className="text-gray-700">
                ยืนยันว่าได้ให้บริการคิวนี้เสร็จสิ้นแล้ว
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800">
                    <p className="font-medium mb-1">ระบบจะดำเนินการ:</p>
                    <ul className="list-disc list-inside space-y-1 text-emerald-700">
                      <li>บันทึกสถานะเป็น "เสร็จสิ้น"</li>
                      <li>เรียกคิวถัดไปอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700">
                คุณต้องการข้ามคิวนี้เนื่องจากผู้เข้าชมไม่มารายงานตัว?
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">⚠️ คำเตือน:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>คิวนี้จะถูกข้าม</li>
                      <li>ผู้ใช้จะได้รับการแจ้งเตือน</li>
                      <li>เรียกคิวถัดไปอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 px-5 py-3 rounded-xl font-medium transition disabled:opacity-50 ${
              isComplete
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className={`w-4 h-4 border-2 ${isComplete ? 'border-emerald-700' : 'border-amber-700'} border-t-transparent rounded-full animate-spin`}></div>
                กำลังดำเนินการ...
              </span>
            ) : (
              `ยืนยัน${isComplete ? 'เสร็จสิ้น' : 'ข้ามคิว'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}