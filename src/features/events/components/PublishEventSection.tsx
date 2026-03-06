// src/features/events/components/PublishEventSection.tsx
'use client';

import { useState } from 'react';
import { updateEventStatus } from '../api/eventApi';

interface PublishEventSectionProps {
  eventId: string;
  onPublishSuccess: () => void;
}

/**
 * Publish Event Section
 * แสดงเมื่อ: status = 'unpublished' + (Owner/Admin)
 * สีเข้าธีมเว็บ - เบาลง
 */
export function PublishEventSection({ eventId, onPublishSuccess }: PublishEventSectionProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      
      await updateEventStatus(eventId, 'publish');
      
      console.log('✅ Event publish successfully');
      
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
      {/* Alert Banner - สีเข้าธีม #3674B5 แบบเบา */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              งานพร้อมเผยแพร่แล้ว
            </h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              คุณได้ชำระเงินมัดจำเรียบร้อยแล้ว งานนี้พร้อมที่จะเผยแพร่ต่อสาธารณะ
              <br />
              เมื่อกด "เผยแพร่งาน" งานจะแสดงให้ผู้เข้าร่วมและบูธสามารถเห็นได้
            </p>

            {/* Publish Button - สีเข้าธีม */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              เผยแพร่งานตอนนี้
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header - สีเข้าธีม */}
            <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">ยืนยันการเผยแพร่งาน</h3>
                  <p className="text-blue-100 text-sm mt-1">งานจะแสดงต่อสาธารณะทันที</p>
                </div>
                <button
                  onClick={() => !isPublishing && setShowConfirmModal(false)}
                  disabled={isPublishing}
                  className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-3">
                <p className="text-gray-700 font-semibold">
                  คุณต้องการเผยแพร่งานนี้หรือไม่?
                </p>
                <p className="text-sm text-gray-600">
                  หลังจากเผยแพร่แล้ว:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 text-left bg-blue-50 rounded-lg p-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#3674B5] mt-0.5">✓</span>
                    <span>งานจะแสดงในหน้าค้นหาและรายการงาน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3674B5] mt-0.5">✓</span>
                    <span>ผู้เข้าร่วมสามารถเห็นและลงทะเบียนได้</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3674B5] mt-0.5">✓</span>
                    <span>บูธสามารถสมัครเข้าร่วมได้</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isPublishing}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังเผยแพร่...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ยืนยันเผยแพร่
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}