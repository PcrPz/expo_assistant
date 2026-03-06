// src/features/booths/components/booth-global/staff/DeleteBoothStaffModal.tsx
'use client';

interface DeleteBoothStaffModalProps {
  staffName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteBoothStaffModal({ 
  staffName, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteBoothStaffModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">ลบสมาชิก</h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-700 font-semibold">
              คุณต้องการลบ <span className="text-red-600">{staffName}</span> ใช่หรือไม่?
            </p>
            <p className="text-sm text-gray-500">
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle className="opacity-25" cx="12" cy="12" r="10"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังลบ...
              </>
            ) : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}