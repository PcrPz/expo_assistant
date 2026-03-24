// src/features/events/components/JoinExpoModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinExpoByCode } from '../api/joinApi';

interface JoinExpoModalProps {
  onClose: () => void;
}

export function JoinExpoModal({ onClose }: JoinExpoModalProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validate
    if (!inviteCode.trim()) {
      setError('กรุณากรอกโค้ดเชิญ');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await joinExpoByCode(inviteCode.trim());

      if (result.success && result.expoId) {
        // ✅ Success: Navigate to the expo page
        onClose();
        
        // แสดง success message
        setTimeout(() => {
          toast.success('✅ เข้าร่วมงานสำเร็จ! กำลังพาคุณไปยังงาน... 🎉');
        }, 100);
        
        // Navigate หลัง alert (ให้เห็น message ก่อน)
        setTimeout(() => {
          router.push(`/events/${result.expoId}`);
        }, 600);
        
      } else {
        // ❌ Error: Show error message
        setError(result.message);
        
        // Optional: แสดง alert สำหรับ error ด้วย
        setTimeout(() => {
          toast.error(`❌ ${result.message}`);
        }, 100);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
      toast.error('❌ เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header - ✅ เพิ่ม gradient ตามธีม */}
        <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">เข้าร่วมงาน Expo</h3>
              <p className="text-blue-100 text-sm mt-1">กรอกโค้ดเชิญเพื่อเข้าร่วมงาน</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Illustration - ✅ สีธีม */}
          <div className="flex justify-center py-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border-2 border-blue-100 shadow-lg">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3674B5"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            </div>
          </div>

          {/* Input - ✅ สีธีม */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              โค้ดเชิญ
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setError(''); // Clear error on input
              }}
              onKeyPress={handleKeyPress}
              placeholder="ระบุโค้ด เช่น ABC123"
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-[#3674B5] disabled:bg-gray-100 disabled:cursor-not-allowed uppercase transition"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              โค้ดเชิญมีอายุ 24 ชั่วโมง
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F87171"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="text-sm text-red-700 flex-1 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Info - ✅ สีธีม */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3674B5"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <p className="text-sm text-[#3674B5] font-semibold">
                ขอโค้ดเชิญจากผู้จัดงานเพื่อเข้าร่วมเป็น Staff หรือ Exhibitor
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !inviteCode.trim()}
            className="px-8 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-xl hover:shadow-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10"></circle>
                </svg>
                กำลังตรวจสอบ...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                เข้าร่วมงาน
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}