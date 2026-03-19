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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}>
              {isComplete ? <CheckCircle className="w-5 h-5 text-white" /> : <SkipForward className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{isComplete ? 'ทำคิวเสร็จสิ้น?' : 'ข้ามคิว?'}</h3>
              <p className="text-xs text-gray-400">คิวหมายเลข #{queueNumber}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-3">
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
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 ${
              isComplete ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-amber-500 text-white hover:bg-amber-600'
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