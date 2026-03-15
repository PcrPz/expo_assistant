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

export function PaymentDepositSection({ eventId, onPaymentSuccess }: PaymentDepositSectionProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (showPaymentModal && !paymentId) fetchPaymentId();
  }, [showPaymentModal]);

  const fetchPaymentId = async () => {
    try {
      console.log('🔍 Fetching payment ID for expo:', eventId);
      const payment = await getPayments(eventId);
      if (payment) {
        if (payment.Title === 'initial_fee' || payment.title === 'initial_fee') {
          const paymentID = payment.PaymentID || payment.payment_id;
          const status = payment.Status || payment.status;
          if (status === 'paid') { console.log('✅ Payment already completed'); setError('ชำระเงินเรียบร้อยแล้ว'); return; }
          if (paymentID) {
            setPaymentId(paymentID);
            setTotalPrice(payment.TotalPrice || payment.total_price || null);
            console.log('✅ Found payment ID:', paymentID);
          } else { console.warn('⚠️ No PaymentID in response'); setError('ไม่พบรหัสการชำระเงิน'); }
        } else { console.warn('⚠️ Not initial_fee payment'); setError('ไม่พบรายการชำระเงินเริ่มต้น'); }
      } else { console.warn('⚠️ No payment found'); setError('ไม่พบรายการชำระเงิน'); }
    } catch (err) { console.error('❌ Failed to fetch payment ID:', err); setError('ไม่สามารถดึงข้อมูลการชำระเงินได้'); }
  };

  const handlePayment = async () => {
    if (!selectedMethod) { setError('กรุณาเลือกช่องทางชำระเงิน'); return; }
    if (!paymentId) { setError('ไม่พบรหัสการชำระเงิน กรุณาลองใหม่อีกครั้ง'); return; }
    if (selectedMethod === 'Credit Card' && (!cardNumber || !cardName || !expiryDate || !cvv)) {
      setError('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน'); return;
    }
    setLoading(true); setError('');
    try {
      await confirmPayment(eventId, paymentId, selectedMethod);
      console.log('✅ Payment successful');
      setShowPaymentModal(false); resetModal(); onPaymentSuccess();
    } catch (err: any) { console.error('❌ Payment error:', err); setError(err.message || 'เกิดข้อผิดพลาดในการชำระเงิน'); }
    finally { setLoading(false); }
  };

  const resetModal = () => {
    setSelectedMethod(null); setCardNumber(''); setCardName('');
    setExpiryDate(''); setCvv(''); setError(''); setPaymentId(null); setTotalPrice(null);
  };

  const handleCloseModal = () => { if (!loading) { resetModal(); setShowPaymentModal(false); } };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(cleaned.match(/.{1,4}/g)?.join(' ') || cleaned);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setExpiryDate(cleaned.length >= 3 ? cleaned.slice(0, 2) + '/' + cleaned.slice(2) : cleaned);
  };

  return (
    <>
      {/* Banner — 🟡 Amber */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 mb-1">งานยังไม่พร้อมเผยแพร่</h3>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              งานของคุณอยู่ในสถานะรอดำเนินการ กรุณาชำระเงินมัดจำเพื่อเปลี่ยนสถานะเป็น "พร้อมเผยแพร่"
              ผู้จัดบูธจะสามารถเห็นงานและขอเข้าร่วมได้หลังจากชำระเงิน
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-200 transition-all flex items-center gap-1.5 border border-amber-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              ชำระเงินมัดจำ{totalPrice ? ` — ฿${Number(totalPrice).toLocaleString()}` : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-amber-400 p-5 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">เลือกช่องทางชำระเงิน</h3>
                  <p className="text-amber-50 text-xs mt-0.5">กรุณาเลือกวิธีการชำระเงินที่สะดวก</p>
                </div>
                <button onClick={handleCloseModal} disabled={loading}
                  className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg disabled:opacity-50 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">เลือกช่องทางชำระเงิน</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'QRscan' as const, label: 'QR Code', sub: 'สแกน QR เพื่อชำระเงิน' },
                    { id: 'Credit Card' as const, label: 'บัตรเครดิต', sub: 'Visa, Mastercard, JCB' },
                  ].map(m => (
                    <button key={m.id} type="button" onClick={() => setSelectedMethod(m.id)} disabled={loading}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedMethod === m.id ? 'border-amber-300 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedMethod === m.id ? 'border-amber-400 bg-amber-400' : 'border-gray-300'
                        }`}>
                          {selectedMethod === m.id && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-gray-900">{m.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMethod === 'QRscan' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
                  <h4 className="font-bold text-gray-900">สแกน QR Code เพื่อชำระเงิน</h4>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl shadow-md">
                      <Image src="/images/QrCode.jpg" alt="QR Code Payment" width={200} height={200} className="rounded-lg" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    กรุณาสแกน QR Code ด้วยแอปธนาคารของคุณ<br />
                    หลังจากชำระเงินแล้ว กดปุ่ม "ยืนยันการชำระ" ด้านล่าง
                  </p>
                </div>
              )}

              {selectedMethod === 'Credit Card' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                  <h4 className="font-bold text-gray-900">กรอกข้อมูลบัตรเครดิต</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเลขบัตร</label>
                    <input type="text" value={cardNumber} onChange={e => formatCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456" maxLength={19} disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ถือบัตร</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE" disabled={loading}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase text-sm bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">วันหมดอายุ</label>
                      <input type="text" value={expiryDate} onChange={e => formatExpiry(e.target.value)}
                        placeholder="MM/YY" maxLength={5} disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                      <input type="text" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123" maxLength={3} disabled={loading}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0 z-10">
              <button onClick={handleCloseModal} disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition disabled:opacity-50 text-sm">
                ยกเลิก
              </button>
              <button onClick={handlePayment} disabled={loading || !selectedMethod}
                className="flex-1 px-4 py-2.5 bg-amber-100 text-amber-700 font-semibold rounded-xl hover:bg-amber-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm border border-amber-200">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle className="opacity-25" cx="12" cy="12" r="10" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>กำลังดำเนินการ...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>ยืนยันการชำระ</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}