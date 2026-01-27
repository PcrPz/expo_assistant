// src/features/booths/components/DeleteBoothModal.tsx
'use client';

import { useState } from 'react';
import { deleteBooth } from '../api/boothApi';

interface DeleteBoothModalProps {
  expoId: string;
  boothId: string;
  boothNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteBoothModal({
  expoId,
  boothId,
  boothNo,
  onClose,
  onSuccess,
}: DeleteBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const success = await deleteBooth(expoId, boothId);

      if (success) {
        onSuccess();
      } else {
        alert('เกิดข้อผิดพลาดในการลบบูธ');
      }
    } catch (error) {
      console.error('Failed to delete booth:', error);
      alert('เกิดข้อผิดพลาดในการลบบูธ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                ยืนยันการลบบูธ
              </h2>
              <p className="text-sm text-gray-600">
                คุณแน่ใจหรือไม่ที่จะลบบูธ <span className="font-semibold text-gray-900">{boothNo}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ คำเตือน
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>การลบบูธจะไม่สามารถย้อนกลับได้</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>เอกสารและรูปภาพทั้งหมดจะถูกลบ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>สินค้าและประกาศทั้งหมดจะถูกลบ</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>ผู้ร่วมออกบูธจะถูกนำออกจากระบบ</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 คำแนะนำ:</span> ถ้าคุณต้องการปิดบูธชั่วคราว 
              แนะนำให้ใช้ฟีเจอร์ "ปิดการใช้งาน" แทนการลบ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>กำลังลบ...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>ลบบูธ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}