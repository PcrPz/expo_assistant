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
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-slate-900">ระบบคิว</h3>
        <p className="text-sm text-slate-600 mt-1">
          จัดการคิวและเรียกลำดับผู้เข้าชมบูธ
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </button>

        {canCreate && (
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            สร้างระบบคิว
          </button>
        )}
      </div>
    </div>
  );
}