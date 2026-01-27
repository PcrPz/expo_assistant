// src/features/staff/components/DeleteStaffModal.tsx (สีนุ่มนวลขึ้น)
'use client';

interface DeleteStaffModalProps {
  staffName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteStaffModal({ 
  staffName, 
  onClose, 
  onConfirm, 
  isDeleting 
}: DeleteStaffModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header - สีธีมแดงพาสเทล */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-t-2xl border-b-2 border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-red-700">ลบ Staff</h3>
              <p className="text-red-600 text-sm mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 transition p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Icon - ถังขยะสีธีม */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F87171"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">
                  คุณกำลังจะลบ <span className="font-bold">{staffName}</span> ออกจากทีม
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="space-y-3 text-center">
            <p className="text-gray-700 text-sm">
              Staff คนนี้จะถูกลบออกจากงานอย่างถาวร และจะไม่สามารถเข้าถึงข้อมูลได้อีกต่อไป
            </p>
            <p className="text-gray-600 text-sm font-semibold">
              คุณแน่ใจหรือไม่ที่จะดำเนินการต่อ?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10"></circle>
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                กำลังลบ...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                ยืนยันการลบ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}