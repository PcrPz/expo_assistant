// src/features/events/components/PublishEventSection.tsx
'use client';

import { useState } from 'react';
import { updateEventStatus } from '../api/eventApi';

interface PublishEventSectionProps {
  eventId: string;
  onPublishSuccess: () => void;
}

export function PublishEventSection({ eventId, onPublishSuccess }: PublishEventSectionProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await updateEventStatus(eventId, 'publish');
      setShowConfirmModal(false);
      onPublishSuccess();
    } catch (error) {
      console.error('❌ Failed to publish event:', error);
      alert('ไม่สามารถเผยแพร่งานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* Banner — 🟢 Emerald */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1">งานพร้อมเผยแพร่แล้ว</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              คุณได้ชำระเงินมัดจำเรียบร้อยแล้ว งานนี้พร้อมที่จะเผยแพร่ต่อสาธารณะ
              เมื่อกด "เผยแพร่งาน" งานจะแสดงให้ผู้เข้าร่วมและบูธสามารถเห็นได้
            </p>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-1.5 border border-emerald-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              เผยแพร่งานตอนนี้
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-emerald-500 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">ยืนยันการเผยแพร่งาน</h3>
                  <p className="text-emerald-100 text-xs mt-0.5">งานจะแสดงต่อสาธารณะทันที</p>
                </div>
                <button onClick={() => !isPublishing && setShowConfirmModal(false)} disabled={isPublishing}
                  className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-50 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-gray-700 font-semibold text-sm">คุณต้องการเผยแพร่งานนี้หรือไม่?</p>
                <p className="text-xs text-gray-400">หลังจากเผยแพร่แล้ว:</p>
                <ul className="text-xs text-gray-600 space-y-1.5 text-left bg-emerald-50 rounded-lg p-3">
                  {['งานจะแสดงในหน้าค้นหาและรายการงาน', 'ผู้เข้าร่วมสามารถเห็นและลงทะเบียนได้', 'บูธสามารถสมัครเข้าร่วมได้'].map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500">✓</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowConfirmModal(false)} disabled={isPublishing}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition disabled:opacity-50 text-sm">
                ยกเลิก
              </button>
              <button onClick={handlePublish} disabled={isPublishing}
                className="flex-1 px-4 py-2.5 bg-emerald-100 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm border border-emerald-200">
                {isPublishing ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>กำลังเผยแพร่...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>ยืนยันเผยแพร่</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}