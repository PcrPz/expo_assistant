// src/features/booths/components/queue/QueueList.tsx
'use client';

import type { BoothQueue } from '../../types/queue.types';
import type { EventRole } from '@/src/features/events/types/event.types';
import { QueueListItem } from './QueueListItem';

interface QueueListProps {
  queues: BoothQueue[];
  selectedQueueId: string | null;
  onSelectQueue: (queueId: string) => void;
  onEditQueue: (queue: BoothQueue) => void;
  onRefresh: () => void;
  expoId: string;
  boothId: string;
  userRole: EventRole;
  isAssignedStaff: boolean;
}

export function QueueList({
  queues,
  selectedQueueId,
  onSelectQueue,
  onEditQueue,
  onRefresh,
  expoId,
  boothId,
  userRole,
  isAssignedStaff,
}: QueueListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-5 py-4 border-b border-slate-200">
        <h4 className="font-bold text-slate-900">รายการคิว</h4>
        <p className="text-xs text-slate-600 mt-0.5">
          {queues.length} คิว
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {queues.map((queue, index) => (
          <QueueListItem
            key={queue.QueueID || `queue-${index}`}
            queue={queue}
            isSelected={queue.QueueID === selectedQueueId}
            onClick={() => onSelectQueue(queue.QueueID)}
            onEdit={() => onEditQueue(queue)}
            onRefresh={onRefresh}
            expoId={expoId}
            boothId={boothId}
            userRole={userRole}
            isAssignedStaff={isAssignedStaff}
          />
        ))}
      </div>
    </div>
  );
}