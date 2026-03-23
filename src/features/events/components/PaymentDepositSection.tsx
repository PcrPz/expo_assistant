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
type Step = 'summary' | 'payment' | 'success';

interface PaymentDetail {
  ProductID: string;
  ProductName: string;
  Quantity: number;
  Price: string;
}

interface PaymentData {
  ExpoID: string;
  Title: string;
  TotalPrice: string;
  PaymentID: string;
  Detail: PaymentDetail[];
}

const PRODUCT_NAME_TH: Record<string, string> = {
  expo_system: 'ค่าระบบจัดการงาน ExpoAssistant',
};

export function PaymentDepositSection({ eventId, onPaymentSuccess }: PaymentDepositSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>('summary');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPayment, setFetchingPayment] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (showModal && !paymentData) fetchPaymentData();
  }, [showModal]);

  const fetchPaymentData = async () => {
    setFetchingPayment(true);
    setError('');
    try {
      const payment = await getPayments(eventId);
      if (!payment) { setError('ไม่พบรายการชำระเงิน'); return; }
      if (payment.Status === 'paid' || payment.status === 'paid') {
        setError('ชำระเงินเรียบร้อยแล้ว'); return;
      }
      setPaymentData({
        ExpoID:      payment.ExpoID      || payment.expo_id,
        Title:       payment.Title       || payment.title,
        TotalPrice:  payment.TotalPrice  || payment.total_price || '0',
        PaymentID:   payment.PaymentID   || payment.payment_id,
        Detail:      payment.Detail      || payment.detail || [],
      });
    } catch {
      setError('ไม่สามารถดึงข้อมูลการชำระเงินได้');
    } finally {
      setFetchingPayment(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod) { setError('กรุณาเลือกช่องทางชำระเงิน'); return; }
    if (!paymentData?.PaymentID) { setError('ไม่พบรหัสการชำระเงิน'); return; }
    if (selectedMethod === 'Credit Card' && (!cardNumber || !cardName || !expiryDate || !cvv)) {
      setError('กรุณากรอกข้อมูลบัตรเครดิตให้ครบถ้วน'); return;
    }
    setLoading(true); setError('');
    try {
      await confirmPayment(eventId, paymentData.PaymentID, selectedMethod);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    if (step === 'success') { onPaymentSuccess(); }
    setShowModal(false);
    setStep('summary');
    setSelectedMethod(null);
    setCardNumber(''); setCardName(''); setExpiryDate(''); setCvv('');
    setError('');
    setPaymentData(null);
  };

  const formatCardNumber = (v: string) => {
    const c = v.replace(/\D/g, '').slice(0, 16);
    setCardNumber(c.match(/.{1,4}/g)?.join(' ') || c);
  };
  const formatExpiry = (v: string) => {
    const c = v.replace(/\D/g, '').slice(0, 4);
    setExpiryDate(c.length >= 3 ? c.slice(0, 2) + '/' + c.slice(2) : c);
  };

  const totalNum = Number(paymentData?.TotalPrice || 0);

  return (
    <>
      {/* ── Banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1.5">งานยังไม่พร้อมเผยแพร่</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              กรุณาชำระเงินมัดจำเพื่อเปิดใช้งานและเผยแพร่งาน
              ผู้จัดบูธจะสามารถเห็นงานและขอเข้าร่วมได้หลังจากชำระเงิน
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-200 transition-all flex items-center gap-2 border border-amber-200"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              ชำระเงินมัดจำ
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-6 py-[18px] border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#FFBA00]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900">ชำระเงินมัดจำ</h3>
                  <p className="text-[15px] text-gray-400 mt-0.5">
                    {step === 'summary' ? 'สรุปรายการค่าใช้จ่าย'
                      : step === 'payment' ? 'เลือกช่องทางชำระเงิน'
                      : 'ชำระเงินเสร็จสิ้น'}
                  </p>
                </div>
              </div>
              <button onClick={handleClose} disabled={loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-6 pt-4 flex items-center  justify-center gap-2 flex-shrink-0">
              {([
                { key: 'summary',  label: 'สรุปรายการ' },
                { key: 'payment',  label: 'ชำระเงิน' },
                { key: 'success',  label: 'เสร็จสิ้น' },
              ] as const).map((s, i) => {
                const isDone = (s.key === 'summary' && (step === 'payment' || step === 'success'))
                            || (s.key === 'payment' && step === 'success');
                const isActive = step === s.key;
                return (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                      isDone    ? 'bg-green-100 text-green-600' :
                      isActive  ? 'bg-amber-100 text-amber-700' :
                                  'bg-gray-100 text-gray-400'
                    }`}>
                      {isDone
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span>{i + 1}</span>
                      }
                      {s.label}
                    </div>
                    {i < 2 && <div className="w-5 h-px bg-gray-200 flex-shrink-0"/>}
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 space-y-4">

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* ══ STEP 1: SUMMARY ══ */}
              {step === 'summary' && (
                <>
                  {fetchingPayment ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <svg className="animate-spin w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle className="opacity-25" cx="12" cy="12" r="10"/>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <p className="text-sm text-gray-400">กำลังดึงข้อมูล...</p>
                    </div>
                  ) : paymentData ? (
                    <>
                      {/* รายการสินค้า */}
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">รายการค่าใช้จ่าย</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {paymentData.Detail.map((item) => (
                            <div key={item.ProductID} className="px-4 py-3.5 flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">
                                  {PRODUCT_NAME_TH[item.ProductName] || item.ProductName}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">จำนวน {item.Quantity} รายการ</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 ml-4">
                                ฿{Number(item.Price).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ยอดรวม */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">ยอดชำระทั้งหมด</p>
                          <p className="text-xs text-gray-400 mt-0.5">รวม VAT แล้ว</p>
                        </div>
                        <p className="text-2xl font-black text-amber-600">
                          ฿{totalNum.toLocaleString()}
                        </p>
                      </div>
                    </>
                  ) : null}
                </>
              )}

              {/* ══ STEP 2: PAYMENT ══ */}
              {step === 'payment' && (
                <>
                  {/* ยอดสรุปเล็ก */}
                  <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-medium text-gray-600">ยอดชำระ</p>
                    <p className="text-lg font-black text-amber-600">฿{totalNum.toLocaleString()}</p>
                  </div>

                  {/* เลือกวิธีชำระ */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">เลือกช่องทางชำระเงิน</label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { id: 'QRscan' as const, label: 'QR Code', sub: 'สแกนจ่ายผ่านแบงก์' },
                        { id: 'Credit Card' as const, label: 'บัตรเครดิต', sub: 'Visa / Mastercard' },
                      ] as const).map(m => (
                        <button key={m.id} type="button" onClick={() => { setSelectedMethod(m.id); setError(''); }} disabled={loading}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedMethod === m.id ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedMethod === m.id ? 'border-amber-400 bg-amber-400' : 'border-gray-300'
                            }`}>
                              {selectedMethod === m.id && (
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              )}
                            </div>
                            <span className="font-bold text-sm text-gray-900">{m.label}</span>
                          </div>
                          <p className="text-xs text-gray-400 ml-6">{m.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR Code */}
                  {selectedMethod === 'QRscan' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
                      <p className="text-sm font-semibold text-gray-800">สแกน QR Code เพื่อชำระ</p>
                      <div className="flex justify-center">
                        <div className="bg-white p-3 rounded-xl shadow-md inline-block">
                          <Image src="/images/QrCode.jpg" alt="QR Code" width={180} height={180} className="rounded-lg" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">สแกนด้วยแอปธนาคาร แล้วกด "ยืนยันการชำระ"</p>
                    </div>
                  )}

                  {/* Credit Card */}
                  {selectedMethod === 'Credit Card' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-gray-800">กรอกข้อมูลบัตรเครดิต</p>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">หมายเลขบัตร</label>
                        <input type="text" value={cardNumber} onChange={e => formatCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456" maxLength={19} disabled={loading}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อผู้ถือบัตร</label>
                        <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                          placeholder="JOHN DOE" disabled={loading}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 uppercase text-sm bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">วันหมดอายุ</label>
                          <input type="text" value={expiryDate} onChange={e => formatExpiry(e.target.value)}
                            placeholder="MM/YY" maxLength={5} disabled={loading}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
                          <input type="text" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="123" maxLength={3} disabled={loading}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm bg-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ══ STEP 3: SUCCESS ══ */}
              {step === 'success' && (
                <div className="flex flex-col items-center text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-100">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">ชำระเงินเสร็จสิ้น</h3>
                    <p className="text-sm text-gray-500 mt-1">การชำระเงินมัดจำของคุณเสร็จสมบูรณ์แล้ว</p>
                  </div>
                  <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3.5 text-left space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ยอดชำระ</span>
                      <span className="font-bold text-gray-900">฿{totalNum.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">วิธีชำระ</span>
                      <span className="font-semibold text-gray-700">{selectedMethod === 'QRscan' ? 'QR Code' : 'บัตรเครดิต'}</span>
                    </div>
                    <p className="text-xs text-green-700 font-medium pt-2 border-t border-green-200">
                      งานของคุณพร้อมเผยแพร่แล้ว
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
              {step === 'summary' && (
                <>
                  <button onClick={handleClose} disabled={fetchingPayment}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                    ปิด
                  </button>
                  <button onClick={() => setStep('payment')} disabled={fetchingPayment || !paymentData}
                    className="flex-[2] py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}>
                    ดำเนินการชำระเงิน
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </>
              )}

              {step === 'payment' && (
                <>
                  <button onClick={() => { setStep('summary'); setError(''); }} disabled={loading}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
                    ย้อนกลับ
                  </button>
                  <button onClick={handleConfirmPayment} disabled={loading || !selectedMethod}
                    className="flex-[2] py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 bg-[#FFBD0D]" >
                    {loading ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle className="opacity-25" cx="12" cy="12" r="10"/>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>กำลังดำเนินการ...</>
                    ) : (
                      <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>ยืนยันการชำระ</>
                    )}
                  </button>
                </>
              )}

              {step === 'success' && (
                <button onClick={handleClose}
                  className="w-full py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  รับทราบและดำเนินการต่อ
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}