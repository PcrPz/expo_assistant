// src/features/queues/components/queue/QueueTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { getBoothQueues } from '../../api/queueApi';
import { canCreateQueue, canManageQueue } from '../../utils/permissions';
import type { BoothQueue } from '../../types/queue.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { QueueHeader } from './QueueHeader';
import { CurrentQueueCard } from './CurrentQueueCard';
import { QueueList } from './QueueList';
import { CreateQueueModal } from './CreateQueueModal';
import { QueueSettingsModal } from './QueueSettingsModal';

interface QueueTabProps {
  boothId: string;
  expoId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function QueueTab({
  boothId,
  expoId,
  userRole,
  isAssignedStaff,
}: QueueTabProps) {
  const [queues, setQueues] = useState<BoothQueue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQueue, setEditingQueue] = useState<BoothQueue | null>(null);
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  const canCreate = canCreateQueue(userRole, isAssignedStaff);

  useEffect(() => {
    loadQueues();
  }, [boothId, expoId]);

  const loadQueues = async () => {
    try {
      setIsLoading(true);
      const data = await getBoothQueues(expoId, boothId);
      
      // 🔍 Debug logs
      console.log('=== QueueTab loadQueues ===');
      console.log('Loaded queues:', data);
      console.log('Number of queues:', data.length);
      console.log('==========================');
      
      setQueues(data);
      
      // Auto-select first active queue
      if (data.length > 0 && !selectedQueueId) {
        const activeQueue = data.find(q => q.Status === 'publish');
        console.log('Auto-selecting queue:', activeQueue);
        if (activeQueue) {
          setSelectedQueueId(activeQueue.QueueID);
        }
      }
    } catch (error) {
      console.error('Failed to load queues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedQueue = queues.find(q => q.QueueID === selectedQueueId);

  // 🔍 Debug selected queue
  console.log('=== Selected Queue ===');
  console.log('selectedQueueId:', selectedQueueId);
  console.log('selectedQueue:', selectedQueue);
  console.log('=====================');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <QueueHeader
        canCreate={canCreate}
        onCreateClick={() => setShowCreateModal(true)}
        onRefresh={loadQueues}
      />

      {/* Empty State */}
      {queues.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              ยังไม่มีระบบคิว
            </h3>
            <p className="text-slate-600 mb-6">
              {canCreate 
                ? 'เริ่มต้นสร้างระบบคิวเพื่อจัดการผู้เข้าชมบูธของคุณ'
                : 'ยังไม่มีระบบคิวในบูธนี้'}
            </p>
            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                สร้างระบบคิว
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Queue List */}
          <div className="lg:col-span-1">
            <QueueList
              queues={queues}
              selectedQueueId={selectedQueueId}
              onSelectQueue={setSelectedQueueId}
              onEditQueue={setEditingQueue}
              onRefresh={loadQueues}
              expoId={expoId}
              boothId={boothId}
              userRole={userRole}
              isAssignedStaff={isAssignedStaff}
            />
          </div>

          {/* Right: Current Queue */}
          <div className="lg:col-span-2">
            {selectedQueue ? (
              <CurrentQueueCard
                queue={selectedQueue}
                expoId={expoId}
                boothId={boothId}
                userRole={userRole}
                isAssignedStaff={isAssignedStaff}
                onRefresh={loadQueues}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500">เลือกคิวเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateQueueModal
          expoId={expoId}
          boothId={boothId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadQueues();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingQueue && (
        <QueueSettingsModal
          queue={editingQueue}
          expoId={expoId}
          boothId={boothId}
          onClose={() => setEditingQueue(null)}
          onSuccess={() => {
            setEditingQueue(null);
            loadQueues();
          }}
        />
      )}
    </div>
  );
}