// src/features/booths/components/queue/QueueListItem.tsx
'use client';

import { useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { deleteQueue } from '../../api/queueApi';
import { canEditQueue, canDeleteQueue } from '../../utils/permissions';
import type { BoothQueue } from '../../types/queue.types';
import type { EventRole } from '@/src/features/events/types/event.types';

interface QueueListItemProps {
  queue: BoothQueue;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  expoId: string;
  boothId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function QueueListItem({
  queue,
  isSelected,
  onClick,
  onEdit,
  onRefresh,
  expoId,
  boothId,
  userRole,
  isAssignedStaff,
}: QueueListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = canEditQueue(userRole, isAssignedStaff);
  const canDelete = canDeleteQueue(userRole, isAssignedStaff);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteQueue(expoId, boothId, queue.QueueID);
      alert('ลบคิวสำเร็จ');
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถลบคิวได้');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isActive = queue.Status === 'publish';

  return (
    <>
      <div
        onClick={onClick}
        className={`
          relative px-4 py-3 cursor-pointer transition-all border-l-[3px]
          ${isSelected 
            ? 'bg-[#EBF3FC] border-[#3674B5]' 
            : 'border-transparent hover:bg-[#FAFBFC]'
          }
        `}
      >
        {/* Header: Title + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h5 className="text-sm font-semibold text-gray-800">
            {queue.Title}
          </h5>

          {/* Action Buttons */}
          {(canEdit || canDelete) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="w-7 h-7 rounded-[7px] bg-[#F0F4F8] text-gray-400 hover:text-gray-600 flex items-center justify-center transition"
                  title="ตั้งค่า"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}

              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  disabled={isDeleting}
                  className="w-7 h-7 rounded-[7px] bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center transition disabled:opacity-50"
                  title="ลบ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="space-y-1 text-xs">
          {/* Row 1: Status */}
          <div className="flex items-center gap-2">
            {isActive ? (
              <span className="text-emerald-600 font-medium">● เปิดรับคิว</span>
            ) : (
              <span className="text-slate-500">● ปิดรับคิว</span>
            )}
          </div>

          {/* Row 2: Current Queue */}
          {queue.CurrentQueue !== null && (
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>คิวปัจจุบัน: {queue.CurrentQueue}</span>
            </div>
          )}

          {/* Row 3: Waiting Count */}
          {queue.NextQueue && queue.NextQueue > 0 && (
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>คิวถัดไป : {queue.NextQueue} </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ลบคิว</h3>
                  <p className="text-xs text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-slate-700">
                คุณต้องการลบคิว <span className="font-semibold text-slate-900">"{queue.Title}"</span> หรือไม่?
              </p>
            </div>

            <div className="px-5 py-[18px] border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}