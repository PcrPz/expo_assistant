'use client';

import { useState, useEffect } from 'react';
import { checkoutPayment, confirmPayment } from '@/src/features/booths/api/boothGlobalApi';
import type { JoinForm } from '@/src/features/booths/types/boothGlobal.types';

const BLUE = '#3674B5';
const BLUE2 = '#498AC3';
const BL = '#EBF3FC';

type Step = 'loading' | 'select_method' | 'qr' | 'credit_card' | 'processing' | 'done' | 'error';

interface CheckoutData {
  paymentId: string;
  price: string;
  boothNo: string;
  expoTitle: string;
}

export function PaymentModal({ form, boothGroupId, onClose, onSuccess }: {
  form: JoinForm;
  boothGroupId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const hasExistingPayment = !!form.paymentId;
  const [step, setStep] = useState<Step>(hasExistingPayment ? 'select_method' : 'loading');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(
    hasExistingPayment ? {
      paymentId: form.paymentId!,
      price: '0',
      boothNo: form.boothNo,
      expoTitle: form.expoTitle,
    } : null
  );
  const [paymentMethod, setPaymentMethod] = useState<'qr_scan' | 'credit_card'>('qr_scan');
  const [error, setError] = useState('');

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
// 1. เพิ่ม Log เพื่อดูว่า Props ที่ได้รับมา "ครบไหม"
  console.log('📦 Modal Props:', { 
    requestId: form?.requestId, 
    boothGroupId: boothGroupId 
  });
  // Auto-checkout on mount — skip if paymentId already exists
  useEffect(() => {
    // 2. เช็คว่ามีค่าครบก่อนเรียก API ไหม
    if (!boothGroupId || !form?.requestId) {
      console.error('❌ ข้อมูลไม่ครบ: boothGroupId หรือ requestId หายไป');
      return;
    }
(async () => {
      try {
        console.log('🚀 กำลังเริ่มดึงข้อมูล checkout...');
        setStep('loading');
        const data = await checkoutPayment(boothGroupId, form.requestId);
        console.log('✅ ดึงข้อมูลสำเร็จ:', data);
        setCheckoutData(data);
        setStep('select_method');
      } catch (e: any) {
        console.error('❌ checkoutPayment พัง:', e);
        setError(e.message);
        setStep('error');
      }
    })();
  }, [boothGroupId, form?.requestId]);

  const handleConfirmPayment = async () => {
    if (!checkoutData) return;
    setStep('processing');
    try {
      await confirmPayment(boothGroupId, checkoutData.paymentId, paymentMethod);
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'การชำระเงินล้มเหลว');
      setStep('error');
    }
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val: string) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/^(.{2})(.+)/, '$1/$2');

  const isCardValid = cardNumber.replace(/\s/g, '').length === 16
    && cardName.trim().length > 0
    && cardExpiry.length === 5
    && cardCvv.length === 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden"
        style={{ maxWidth: step === 'qr' ? '360px' : step === 'credit_card' ? '420px' : '380px' }}>

        {/* Top bar */}
        <div className="h-1" style={{ background: `linear-gradient(90deg,${BLUE},${BLUE2})` }}/>

        {/* Header */}
        {step !== 'done' && step !== 'processing' && (
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: BL }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">ชำระเงิน</p>
                <p className="text-[11px] text-gray-400">
                  {step === 'loading' ? 'กำลังโหลด...' : step === 'select_method' ? 'เลือกวิธีชำระเงิน' : step === 'qr' ? 'สแกน QR Code' : step === 'credit_card' ? 'กรอกข้อมูลบัตร' : 'เกิดข้อผิดพลาด'}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Booth info strip */}
        {checkoutData && step !== 'done' && step !== 'processing' && (
          <div className="mx-5 mt-4 rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100" style={{ backgroundColor: BL }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BLUE }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{checkoutData.expoTitle}</p>
              <p className="text-[11px] text-gray-500">บูธ {checkoutData.boothNo}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-black" style={{ color: BLUE }}>
                {parseInt(checkoutData.price).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">บาท</p>
            </div>
          </div>
        )}

        <div className="p-5">

          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center py-10 gap-3">
              <svg className="animate-spin w-8 h-8" style={{ color: BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-gray-400">กำลังดึงข้อมูลการชำระเงิน...</p>
            </div>
          )}

          {/* Select method */}
          {step === 'select_method' && (
            <>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">เลือกวิธีชำระเงิน</p>
              <div className="space-y-2.5 mb-5">
                {/* QR */}
                <button onClick={() => setPaymentMethod('qr_scan')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                  style={{ borderColor: paymentMethod === 'qr_scan' ? BLUE : '#F1F5F9', backgroundColor: paymentMethod === 'qr_scan' ? BL : '#FAFAFA' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition"
                    style={{ backgroundColor: paymentMethod === 'qr_scan' ? BLUE : '#E2E8F0' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'qr_scan' ? 'white' : '#94A3B8'} strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">QR Code / พร้อมเพย์</p>
                    <p className="text-xs text-gray-400 mt-0.5">สแกนผ่านแอปธนาคาร</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition flex-shrink-0"
                    style={{ borderColor: paymentMethod === 'qr_scan' ? BLUE : '#D1D5DB', backgroundColor: paymentMethod === 'qr_scan' ? BLUE : 'white' }}>
                    {paymentMethod === 'qr_scan' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>

                {/* Credit Card */}
                <button onClick={() => setPaymentMethod('credit_card')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 transition text-left"
                  style={{ borderColor: paymentMethod === 'credit_card' ? BLUE : '#F1F5F9', backgroundColor: paymentMethod === 'credit_card' ? BL : '#FAFAFA' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition"
                    style={{ backgroundColor: paymentMethod === 'credit_card' ? BLUE : '#E2E8F0' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={paymentMethod === 'credit_card' ? 'white' : '#94A3B8'} strokeWidth="2" strokeLinecap="round">
                      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">บัตรเครดิต / เดบิต</p>
                    <p className="text-xs text-gray-400 mt-0.5">Visa · Mastercard · JCB</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition flex-shrink-0"
                    style={{ borderColor: paymentMethod === 'credit_card' ? BLUE : '#D1D5DB', backgroundColor: paymentMethod === 'credit_card' ? BLUE : 'white' }}>
                    {paymentMethod === 'credit_card' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
                <button onClick={() => setStep(paymentMethod === 'qr_scan' ? 'qr' : 'credit_card')}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  ถัดไป →
                </button>
              </div>
            </>
          )}

          {/* QR Step */}
          {step === 'qr' && (
            <>
              <div className="flex flex-col items-center mb-5">
                <p className="text-xs text-gray-500 mb-4 text-center">สแกน QR Code ด้านล่างเพื่อชำระเงิน แล้วกดยืนยันหลังจากโอนเงินสำเร็จ</p>
                {/* QR mock */}
                <div className="w-48 h-48 rounded-2xl border-4 flex items-center justify-center mb-3"
                  style={{ borderColor: BLUE, backgroundColor: BL }}>
                  <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
                    {/* QR pattern mock */}
                    <rect x="5" y="5" width="35" height="35" rx="3" fill={BLUE} opacity="0.15"/>
                    <rect x="9" y="9" width="27" height="27" rx="2" fill={BLUE} opacity="0.3"/>
                    <rect x="13" y="13" width="19" height="19" rx="1" fill={BLUE}/>
                    <rect x="60" y="5" width="35" height="35" rx="3" fill={BLUE} opacity="0.15"/>
                    <rect x="64" y="9" width="27" height="27" rx="2" fill={BLUE} opacity="0.3"/>
                    <rect x="68" y="13" width="19" height="19" rx="1" fill={BLUE}/>
                    <rect x="5" y="60" width="35" height="35" rx="3" fill={BLUE} opacity="0.15"/>
                    <rect x="9" y="64" width="27" height="27" rx="2" fill={BLUE} opacity="0.3"/>
                    <rect x="13" y="68" width="19" height="19" rx="1" fill={BLUE}/>
                    {[45,50,55,60,65,70,75,80,85,90].map((x, i) =>
                      [45,50,55,60,65,70,75,80,85,90].filter((_, j) => (i + j) % 3 !== 0).map(y =>
                        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.5" fill={BLUE} opacity="0.6"/>
                      )
                    )}
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">จำนวนเงิน</p>
                  <p className="text-2xl font-black" style={{ color: BLUE }}>
                    {checkoutData ? parseInt(checkoutData.price).toLocaleString() : '0'}
                  </p>
                  <p className="text-sm text-gray-500">บาท</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('select_method')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  ← ย้อนกลับ
                </button>
                <button onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  โอนแล้ว ยืนยัน
                </button>
              </div>
            </>
          )}

          {/* Credit Card Step */}
          {step === 'credit_card' && (
            <>
              <div className="space-y-3 mb-5">
                {/* Card preview */}
                <div className="w-full h-36 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  <div className="flex justify-between items-start">
                    <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
                      <rect width="36" height="28" rx="4" fill="white" fillOpacity="0.2"/>
                      <line x1="0" y1="10" x2="36" y2="10" stroke="white" strokeOpacity="0.4" strokeWidth="6"/>
                    </svg>
                    <p className="text-white text-xs font-bold opacity-80">CREDIT CARD</p>
                  </div>
                  <div>
                    <p className="text-white font-mono text-base tracking-widest mb-1">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between">
                      <p className="text-white text-xs opacity-70">{cardName || 'ชื่อเจ้าของบัตร'}</p>
                      <p className="text-white text-xs opacity-70">{cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">หมายเลขบัตร</label>
                  <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="0000 0000 0000 0000" maxLength={19}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400 transition"
                    style={{ letterSpacing: '0.05em' }}/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">ชื่อเจ้าของบัตร</label>
                  <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                    placeholder="FULL NAME" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">วันหมดอายุ</label>
                    <input value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY" maxLength={5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400 transition"/>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CVV</label>
                    <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0,3))}
                      placeholder="•••" maxLength={3} type="password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400 transition"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep('select_method')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  ← ย้อนกลับ
                </button>
                <button onClick={handleConfirmPayment} disabled={!isCardValid}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  ยืนยันชำระเงิน
                </button>
              </div>
            </>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center py-12 gap-3">
              <svg className="animate-spin w-10 h-10" style={{ color: BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10"/>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm font-semibold text-gray-700">กำลังดำเนินการ...</p>
              <p className="text-xs text-gray-400">กรุณารอสักครู่</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-xl font-black text-gray-900 mb-1">ชำระเงินสำเร็จ!</p>
              <p className="text-sm text-gray-400 mb-6">การจองบูธของคุณเสร็จสมบูรณ์แล้ว</p>
              <button onClick={onSuccess}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                เสร็จสิ้น
              </button>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">เกิดข้อผิดพลาด</p>
              <p className="text-xs text-gray-400 mb-5">{error}</p>
              <div className="flex gap-2 w-full">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                  ปิด
                </button>
                <button onClick={() => { setError(''); setStep('loading'); }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  ลองใหม่
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}