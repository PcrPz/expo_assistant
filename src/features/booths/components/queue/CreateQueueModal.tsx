// src/features/queues/components/queue/CreateQueueModal.tsx
'use client';

import { useState } from 'react';
import { X, Users } from 'lucide-react';
import { createQueue } from '../../api/queueApi';
import type { QueueStatus } from '../../types/queue.types';

interface CreateQueueModalProps {
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateQueueModal({
  expoId,
  boothId,
  onClose,
  onSuccess,
}: CreateQueueModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<QueueStatus>('unpublish');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !title.trim()) {
      setError('กรุณากรอกชื่อคิว');
      return;
    }

    try {
      setIsSubmitting(true);
      await createQueue(expoId, boothId, {
        booth_id: boothId,
        title: title.trim(),
        status,
      });
      alert('สร้างคิวสำเร็จ');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
      alert('สร้างคิวไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#3674B5] to-[#5B9BD5] px-6 py-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">สร้างระบบคิว</h2>
                  <p className="text-blue-100 text-sm mt-1">เพิ่มระบบคิวใหม่สำหรับบูธ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Queue Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                ชื่อคิว <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น คิวปรึกษาผลิตภัณฑ์"
                disabled={isSubmitting}
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                {title?.length || 0}/100 ตัวอักษร
              </p>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                สถานะเริ่มต้น <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Publish Option */}
                <button
                  type="button"
                  onClick={() => setStatus('publish')}
                  disabled={isSubmitting}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    status === 'publish'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      status === 'publish'
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300'
                    }`}>
                      {status === 'publish' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${
                        status === 'publish' ? 'text-emerald-700' : 'text-gray-700'
                      }`}>
                        เปิดรับคิว
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        เปิดให้เข้าคิวได้ทันที
                      </p>
                    </div>
                  </div>
                </button>

                {/* Unpublish Option */}
                <button
                  type="button"
                  onClick={() => setStatus('unpublish')}
                  disabled={isSubmitting}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    status === 'unpublish'
                      ? 'border-gray-500 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      status === 'unpublish'
                        ? 'border-gray-500 bg-gray-500'
                        : 'border-gray-300'
                    }`}>
                      {status === 'unpublish' && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${
                        status === 'unpublish' ? 'text-gray-700' : 'text-gray-700'
                      }`}>
                        ปิดรับคิว
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ยังไม่เปิดให้ใช้งาน
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white font-medium transition disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !title.trim()}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-[#3674B5] to-[#5B9BD5] text-white rounded-xl hover:shadow-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังสร้าง...
                </span>
              ) : (
                'สร้างคิว'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}