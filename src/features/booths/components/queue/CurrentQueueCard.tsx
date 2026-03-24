// src/features/queues/components/queue/CurrentQueueCard.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { Users, ArrowRight, CheckCircle, SkipForward, AlertCircle } from 'lucide-react';
import { callNext } from '../../api/queueApi';
import { canCallNextQueue } from '../../utils/permissions';
import type { BoothQueue } from '../../types/queue.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { ConfirmActionModal } from './ConfirmActionModal';

interface CurrentQueueCardProps {
  queue: BoothQueue;
  expoId: string;
  boothId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
  onRefresh: () => void;
}

export function CurrentQueueCard({
  queue,
  expoId,
  boothId,
  userRole,
  isAssignedStaff,
  onRefresh,
}: CurrentQueueCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<'complete' | 'skip' | null>(null);

  const canManage = canCallNextQueue(userRole, isAssignedStaff);
  const isActive = queue.Status === 'publish';
  const hasCurrentQueue = queue.CurrentQueue !== null && queue.CurrentQueue !== undefined;
  const hasNextQueue = queue.NextQueue !== null && queue.NextQueue !== undefined;

  // 🔍 Debug logs
  console.log('=== CurrentQueueCard Debug ===');
  console.log('Queue data:', queue);
  console.log('Status:', queue.Status);
  console.log('isActive:', isActive);
  console.log('current_queue:', queue.CurrentQueue);
  console.log('next_queue:', queue.NextQueue);
  console.log('hasCurrentQueue:', hasCurrentQueue);
  console.log('hasNextQueue:', hasNextQueue);
  console.log('============================');

  const handleCallNext = async (action: 'completed' | 'skipped') => {
    try {
      setIsProcessing(true);
      await callNext(expoId, boothId, {
        queue_id: queue.QueueID,
        status: action,
      });
      
      const actionText = action === 'completed' ? 'ทำเสร็จ' : 'ข้าม';
      toast.success(`${actionText}คิวสำเร็จ`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#3674B5] to-[#498AC3] px-5 py-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold mb-1">{queue.Title}</h4>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                      เปิดรับคิว
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-semibold">
                      ปิดรับคิว
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!isActive ? (
            /* Closed State */
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-gray-400" />
              </div>
              <h5 className="text-sm font-semibold text-gray-600 mb-1">คิวปิดอยู่</h5>
              <p className="text-xs text-gray-400">เปิดรับคิวเพื่อเริ่มใช้งาน</p>
            </div>
          ) : !hasCurrentQueue && !hasNextQueue ? (
            /* Empty Queue State */
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#EBF3FC] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-[#3674B5]" />
              </div>
              <h5 className="text-sm font-semibold text-gray-600 mb-1">ไม่มีคิว</h5>
              <p className="text-xs text-gray-400">รอผู้เข้าชมเข้าคิว</p>
            </div>
          ) : (
            /* Active Queue State */
            <>
              {/* Current Queue */}
              {hasCurrentQueue && (
                <div className="bg-[#EBF3FC] border-[1.5px] border-[#BFDBFE] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      คิวปัจจุบัน
                    </h5>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-semibold text-gray-600">กำลังให้บริการ</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-[72px] h-[72px] bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-2xl mx-auto mb-3">
                      <span className="text-[28px] font-extrabold text-white">
                        #{queue.CurrentQueue}
                      </span>
                    </div>
                    
                    {/* ✅ แสดงชื่อ-นามสกุล */}
                    {queue.CurrentFirstName && queue.CurrentLastName && (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {queue.CurrentFirstName} {queue.CurrentLastName}
                        </p>
                        {queue.CurrentEmail && (
                          <p className="text-xs text-gray-400">
                            {queue.CurrentEmail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {canManage && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setShowConfirmModal('skip')}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#FEF3C7] text-amber-600 text-sm font-semibold rounded-xl hover:bg-amber-100 transition disabled:opacity-50"
                      >
                        <SkipForward className="w-4 h-4" />
                        ข้ามคิว
                      </button>

                      <button
                        onClick={() => setShowConfirmModal('complete')}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#DCFCE7] text-green-700 text-sm font-semibold rounded-xl hover:bg-green-200 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        เสร็จสิ้น
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Next Queue */}
              {hasNextQueue && (
                <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      คิวถัดไป
                    </h5>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center w-11 h-11 bg-white border border-[#E2E8F0] rounded-xl mx-auto mb-2">
                      <span className="text-base font-bold text-gray-600">
                        #{queue.NextQueue}
                      </span>
                    </div>
                    
                    {/* ✅ แสดงชื่อ-นามสกุล */}
                    {queue.NextFirstName && queue.NextLastName && (
                      <div className="mt-0.5">
                        <p className="text-sm font-semibold text-gray-800">
                          {queue.NextFirstName} {queue.NextLastName}
                        </p>
                        {queue.NextEmail && (
                          <p className="text-xs text-gray-400">
                            {queue.NextEmail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      {showConfirmModal && (
        <ConfirmActionModal
          action={showConfirmModal}
          queueNumber={queue.CurrentQueue || 0}
          isProcessing={isProcessing}
          onConfirm={() => handleCallNext(showConfirmModal === 'complete' ? 'completed' : 'skipped')}
          onCancel={() => setShowConfirmModal(null)}
        />
      )}
    </>
  );
}