// src/features/events/components/PaymentDepositSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { confirmPayment, getPayments } from '../api/eventApi';

interface PaymentDepositSectionProps {
  eventId: string;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'QRscan' | 'Credit Card' | null;

/**
 * Payment Deposit Section
 * Fetch PaymentID first, then confirm payment
 */
export function PaymentDepositSection({ eventId, onPaymentSuccess }: PaymentDepositSectionProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);
  
  // Credit Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // ✅ Fetch PaymentID when modal opens
  useEffect(() => {
    if (showPaymentModal && !paymentId) {
      fetchPaymentId();
    }
  }, [showPaymentModal]);

  const fetchPaymentId = async () => {
    try {
      console.log('🔍 Fetching payment ID for expo:', eventId);
      const payment = await getPayments(eventId);
      
      // ✅ Response is now a single object, not an array
      if (payment) {
        // Check if it's the initial payment
        if (payment.Title === 'initial_fee' || payment.title === 'initial_fee') {
          const paymentID = payment.PaymentID || payment.payment_id;
          const status = payment.Status || payment.status;
          
          if (status === 'paid') {
            console.log('✅ Payment already completed');
            setError('ชำระเงินเรียบร้อยแล้ว');
            return;
          }
          
          if (paymentID) {
            setPaymentId(paymentID);
            setTotalPrice(payment.TotalPrice || payment.total_price || null);
            console.log('✅ Found payment ID:', paymentID);
          } else {
            console.warn('⚠️ No PaymentID in response');
            setError('ไม่พบรหัสการชำระเงิน');
          }
        } else {
          console.warn('⚠️ Not initial_fee payment');
          setError('ไม่พบรายการชำระเงินเริ่มต้น');
        }
      } else {
        console.warn('⚠️ No payment found');
        setError('ไม่พบรายการชำระเงิน');
      }
    } catch (err) {
      console.error('❌ Failed to fetch payment ID:', err);
      setError('ไม่สามารถดึงข้อมูลการชำระเงินได้');
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('กรุณาเลือกช่องทางชำระเงิน');
      return;
    }

    if (!paymentId) {
      setError('ไม่พบรหัสการชำระเงิน กรุณาลองใหม่อีกครั้ง');
      return;
    }

    // Validate Credit Card
    if (selectedMethod === 'Credit Card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setError('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // ✅ เรียกใช้ confirmPayment พร้อม paymentId
      await confirmPayment(eventId, paymentId, selectedMethod);
      
      console.log('✅ Payment successful');
      setShowPaymentModal(false);
      resetModal();
      onPaymentSuccess();
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setError('');
    setPaymentId(null);
    setTotalPrice(null);
  };

  const handleCloseModal = () => {
    if (!loading) {
      resetModal();
      setShowPaymentModal(false);
    }
  };

  // Format card number: 1234 5678 9012 3456
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    setCardNumber(formatted);
  };

  // Format expiry: MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 4);
    if (limited.length >= 3) {
      setExpiryDate(limited.slice(0, 2) + '/' + limited.slice(2));
    } else {
      setExpiryDate(limited);
    }
  };

  return (
    <>
      {/* Payment Alert */}
      <div className="bg-gradient-to-r from-[#FFFEF5] to-[#FFFCF0] border-2 border-[#FFE9A8] rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Icon */}
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

            {/* Payment Button */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#FFE9A8] to-[#FFDC82] text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2 border border-[#FFDC82] hover:from-[#FFDC82] hover:to-[#FCD34D]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <span>ชำระเงินมัดจำ{totalPrice ? ` — ฿${Number(totalPrice).toLocaleString()}` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FFE9A8] to-[#FFDC82] p-6 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">เลือกช่องทางชำระเงิน</h3>
                  <p className="text-gray-700 text-sm mt-1">กรุณาเลือกวิธีการชำระเงินที่สะดวก</p>
                </div>
                <button
                  onClick={handleCloseModal}
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
            <div className="p-6 space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  เลือกช่องทางชำระเงิน
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* QR Code */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('QRscan')}
                    disabled={loading}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedMethod === 'QRscan'
                        ? 'border-[#FFDC82] bg-[#FFFEF5] shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedMethod === 'QRscan'
                          ? 'border-[#FFDC82] bg-[#FFDC82]'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === 'QRscan' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-lg">QR Code</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>สแกน QR เพื่อชำระเงิน</span>
                    </div>
                  </button>

                  {/* Credit Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Credit Card')}
                    disabled={loading}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedMethod === 'Credit Card'
                        ? 'border-[#FFDC82] bg-[#FFFEF5] shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedMethod === 'Credit Card'
                          ? 'border-[#FFDC82] bg-[#FFDC82]'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === 'Credit Card' && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-lg">บัตรเครดิต</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                      <span>Visa, Mastercard, JCB</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* QR Code Display */}
              {selectedMethod === 'QRscan' && (
                <div className="bg-[#FFFEF5] border-2 border-[#FFE9A8] rounded-xl p-6">
                  <div className="text-center space-y-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      สแกน QR Code เพื่อชำระเงิน
                    </h4>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl shadow-lg">
                        <Image
                          src="/images/QrCode.jpg"
                          alt="QR Code Payment"
                          width={250}
                          height={250}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      กรุณาสแกน QR Code ด้วยแอปธนาคารของคุณ<br />
                      หลังจากชำระเงินแล้ว กดปุ่ม "ยืนยันการชำระ" ด้านล่าง
                    </p>
                  </div>
                </div>
              )}

              {/* Credit Card Form */}
              {selectedMethod === 'Credit Card' && (
                <div className="bg-[#FFFEF5] border-2 border-[#FFE9A8] rounded-xl p-6 space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    กรอกข้อมูลบัตรเครดิต
                  </h4>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      หมายเลขบัตร
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => formatCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFDC82] focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อผู้ถือบัตร
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFDC82] focus:border-transparent uppercase"
                      disabled={loading}
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        วันหมดอายุ
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => formatExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFDC82] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FFDC82] focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePayment}
                disabled={loading || !selectedMethod}
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