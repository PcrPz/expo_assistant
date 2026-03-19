// src/features/queues/components/queue/QueueHeader.tsx
'use client';

import { Plus, RefreshCw } from 'lucide-react';

interface QueueHeaderProps {
  canCreate: boolean;
  onCreateClick: () => void;
  onRefresh: () => void;
}

export function QueueHeader({
  canCreate,
  onCreateClick,
  onRefresh,
}: QueueHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900">ระบบคิว</h3>
        <p className="text-sm text-gray-400 mt-0.5">
          จัดการคิวและเรียกลำดับผู้เข้าชมบูธ
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 border border-[#E2E8F0] text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          รีเฟรช
        </button>

        {canCreate && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5a8f] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            สร้างระบบคิว
          </button>
        )}
      </div>
    </div>
  );
}