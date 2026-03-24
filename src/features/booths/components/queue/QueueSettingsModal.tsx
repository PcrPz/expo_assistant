// src/features/queues/components/queue/QueueSettingsModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { updateQueue } from '../../api/queueApi';
import type { BoothQueue, QueueStatus } from '../../types/queue.types';

interface QueueSettingsModalProps {
  queue: BoothQueue;
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function QueueSettingsModal({
  queue,
  expoId,
  boothId,
  onClose,
  onSuccess,
}: QueueSettingsModalProps) {
  const [title, setTitle] = useState(queue.Title);
  const [status, setStatus] = useState<QueueStatus>(queue.Status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(queue.Title);
    setStatus(queue.Status);
  }, [queue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !title.trim()) {
      setError('กรุณากรอกชื่อคิว');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateQueue(expoId, boothId, {
        queue_id: queue.QueueID,
        title: title.trim(),
        status,
      });
      toast.success('อัปเดตคิวสำเร็จ');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
      toast.success('อัปเดตคิวไม่สำเร็จ');
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ตั้งค่าคิว</h2>
                <p className="text-xs text-gray-400">แก้ไขข้อมูลและสถานะคิว</p>
              </div>
            </div>
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition disabled:opacity-50 disabled:bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                {title?.length || 0}/100 ตัวอักษร
              </p>
            </div>

            {/* Status Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                สถานะคิว
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Publish */}
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
                        ผู้ใช้สามารถเข้าคิวได้
                      </p>
                    </div>
                  </div>
                </button>

                {/* Unpublish */}
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
                        ไม่เปิดให้เข้าคิว
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {status !== queue.Status && (
              <div className={`border rounded-xl p-4 ${
                status === 'publish'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex gap-3">
                  <div className={status === 'publish' ? 'text-emerald-600' : 'text-amber-600'}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className={`text-sm ${status === 'publish' ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {status === 'publish' ? (
                      <>
                        <p className="font-medium mb-1">เปิดรับคิว</p>
                        <p className="text-emerald-700">
                          ผู้ใช้จะสามารถเข้าคิวได้ทันที
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium mb-1">ปิดรับคิว</p>
                        <p className="text-amber-700">
                          ผู้ใช้จะไม่สามารถเข้าคิวใหม่ได้
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50"
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
                  กำลังบันทึก...
                </span>
              ) : (
                'บันทึกการเปลี่ยนแปลง'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}