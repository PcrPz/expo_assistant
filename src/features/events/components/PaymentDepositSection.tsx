// src/features/events/components/PaymentDepositSection.tsx
'use client';

import { useState } from 'react';
import { updateEventStatus } from '../api/eventApi';

interface PaymentDepositSectionProps {
  eventId: string;
  onPaymentSuccess: () => void;
}

/**
 * Payment Deposit Section
 * แสดงเมื่อ Event status = 'pending'
 * สี: #FFDC82, #FFFBDE (ตามที่ขอ)
 */
export function PaymentDepositSection({ eventId, onPaymentSuccess }: PaymentDepositSectionProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      await updateEventStatus(eventId, 'unpublished');
      
      console.log('✅ Payment successful - Status changed to unpublished');
      setShowConfirmModal(false);
      onPaymentSuccess();
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Payment Alert - สีอ่อนลง */}
      <div className="bg-gradient-to-r from-[#FFFEF5] to-[#FFFCF0] border-2 border-[#FFE9A8] rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Icon - เปลี่ยนเป็นไอคอนบัตรเครดิต */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFE9A8] to-[#FFDC82] rounded-xl flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              งานยังไม่พร้อมเผยแพร่
            </h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              งานของคุณอยู่ในสถานะรอดำเนินการ กรุณาชำระเงินมัดจำเพื่อเปลี่ยนสถานะเป็น "พร้อมเผยแพร่" 
              ผู้จัดบูธจะสามารถเห็นงานและขอเข้าร่วมได้หลังจากชำระเงิน
            </p>

            {/* Payment Button - สีอ่อนลง */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#FFE9A8] to-[#FFDC82] text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-[#FFDC82] hover:from-[#FFDC82] hover:to-[#FCD34D]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>ชำระเงินมัดจำ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header - สีอ่อนลง */}
            <div className="bg-gradient-to-r from-[#FFE9A8] to-[#FFDC82] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">ยืนยันการชำระเงิน</h3>
                  <p className="text-gray-700 text-sm mt-1">จำลองการชำระเงินมัดจำ</p>
                </div>
                <button
                  onClick={() => !loading && setShowConfirmModal(false)}
                  disabled={loading}
                  className="text-gray-700 hover:text-gray-900 transition p-2 hover:bg-white/20 rounded-lg disabled:opacity-50"
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
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFFEF5] to-[#FFFCF0] rounded-full flex items-center justify-center border-4 border-[#FFE9A8]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div className="text-center space-y-3">
                <p className="text-gray-700 font-semibold">
                  คุณต้องการชำระเงินมัดจำหรือไม่?
                </p>
                <p className="text-sm text-gray-600">
                  หลังจากชำระเงินแล้ว งานจะเปลี่ยนสถานะเป็น "พร้อมเผยแพร่"
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FFE9A8] to-[#FFDC82] text-gray-900 font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-[#FFDC82] hover:from-[#FFDC82] hover:to-[#FCD34D]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ยืนยันการชำระ
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