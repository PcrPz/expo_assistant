// src/features/staff/components/DeleteStaffModal.tsx
'use client';

interface DeleteStaffModalProps {
  staffName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteStaffModal({ staffName, onClose, onConfirm, isDeleting }: DeleteStaffModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">ลบ Staff</h3>
              <p className="text-xs text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isDeleting}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          {/* Icon กลาง */}
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>

          {/* Name box */}
          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 text-center">
            ลบ <span className="font-semibold">"{staffName}"</span> ออกจากทีม
          </div>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Staff คนนี้จะถูกลบออกจากงานอย่างถาวร<br/>และไม่สามารถเข้าถึงข้อมูลได้อีกต่อไป
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting
              ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>กำลังลบ...</>
              : 'ยืนยันการลบ'}
          </button>
        </div>
      </div>
    </div>
  );
}