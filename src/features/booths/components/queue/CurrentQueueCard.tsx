// src/features/queues/components/queue/CurrentQueueCard.tsx
'use client';

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
      alert(`${actionText}คิวสำเร็จ`);
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#3674B5] to-[#498AC3] px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl font-bold mb-1">{queue.Title}</h4>
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
        <div className="p-6 space-y-6">
          {!isActive ? (
            /* Closed State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h5 className="text-lg font-semibold text-slate-900 mb-2">คิวปิดอยู่</h5>
              <p className="text-slate-600">เปิดรับคิวเพื่อเริ่มใช้งาน</p>
            </div>
          ) : !hasCurrentQueue && !hasNextQueue ? (
            /* Empty Queue State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#3674B5]" />
              </div>
              <h5 className="text-lg font-semibold text-slate-900 mb-2">ไม่มีคิว</h5>
              <p className="text-slate-600">รอผู้เข้าชมเข้าคิว</p>
            </div>
          ) : (
            /* Active Queue State */
            <>
              {/* Current Queue */}
              {hasCurrentQueue && (
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      คิวปัจจุบัน
                    </h5>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-slate-700">กำลังให้บริการ</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-3xl shadow-lg mb-4">
                      <span className="text-4xl font-bold text-white">
                        #{queue.CurrentQueue}
                      </span>
                    </div>
                    
                    {/* ✅ แสดงชื่อ-นามสกุล */}
                    {queue.CurrentFirstName && queue.CurrentLastName && (
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-slate-900">
                          {queue.CurrentFirstName} {queue.CurrentLastName}
                        </p>
                        {queue.CurrentEmail && (
                          <p className="text-sm text-slate-600">
                            {queue.CurrentEmail}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {canManage && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowConfirmModal('skip')}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors font-medium disabled:opacity-50"
                      >
                        <SkipForward className="w-5 h-5" />
                        ข้ามคิว
                      </button>

                      <button
                        onClick={() => setShowConfirmModal('complete')}
                        disabled={isProcessing}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-medium disabled:opacity-50"
                      >
                        <CheckCircle className="w-5 h-5" />
                        เสร็จสิ้น
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Next Queue */}
              {hasNextQueue && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      คิวถัดไป
                    </h5>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl shadow-sm mb-3">
                      <span className="text-2xl font-bold text-slate-700">
                        #{queue.NextQueue}
                      </span>
                    </div>
                    
                    {/* ✅ แสดงชื่อ-นามสกุล */}
                    {queue.NextFirstName && queue.NextLastName && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-base font-semibold text-slate-900">
                          {queue.NextFirstName} {queue.NextLastName}
                        </p>
                        {queue.NextEmail && (
                          <p className="text-xs text-slate-600">
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