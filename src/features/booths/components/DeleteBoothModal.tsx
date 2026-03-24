'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { deleteBooth } from '../api/boothApi';

interface DeleteBoothModalProps {
  expoId: string;
  boothId: string;
  boothNo: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteBoothModal({ expoId, boothId, boothNo, onClose, onSuccess }: DeleteBoothModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const success = await deleteBooth(expoId, boothId);
      if (success) {
        onSuccess();
      } else {
        toast.error('เกิดข้อผิดพลาดในการลบบูธ');
      }
    } catch (error) {
      console.error('Failed to delete booth:', error);
      toast.error('เกิดข้อผิดพลาดในการลบบูธ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ลบบูธ</h2>
                <p className="text-xs text-gray-400">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-6 py-6 space-y-4">

            {/* Icon + ชื่อ */}
            <div className="flex flex-col items-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm text-gray-500">ลบ</p>
                <p className="text-[15px] font-bold text-gray-900 mt-0.5">บูธ "{boothNo}"</p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3.5">
              <p className="text-sm text-red-700 font-semibold mb-1.5">สิ่งที่จะถูกลบทั้งหมด</p>
              <ul className="space-y-1">
                {[
                  'ข้อมูลบูธและรูปภาพทั้งหมด',
                  'เอกสาร สินค้า และประกาศ',
                  'แบบสอบถามและคำตอบ',
                  'ผู้ร่วมออกบูธจะถูกนำออกจากระบบ',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-red-600">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
            <button onClick={onClose} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button onClick={handleDelete} disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังลบ...</>
              ) : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>ยืนยันการลบ</>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}