// src/features/events/components/checkout/CheckoutTab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, CreditCard, QrCode, Receipt, Banknote,
  Building2, Upload, X, ArrowRight, Cpu, AlertCircle,
  Lock, Package, Wallet, TrendingUp, ShieldCheck,
} from 'lucide-react';
import {
  getExpoPayments, getCheckoutDetail, getPaymentDetail,
  confirmPayment, getIncome, createPaymentAccount,
} from '../../api/checkoutApi';
import type {
  CheckoutData, IncomeData, PaymentDetail,
} from '../../types/checkout.types';
import type { EventRole } from '../../types/event.types';

interface Props {
  expoID: string;
  role: EventRole;
  onComplete?: () => void;
}

const PRODUCT_LABELS: Record<string, string> = {
  booth: 'ค่าเช่าบูธ',
  ble_beacon: 'BLE Beacon',
  staff_badge: 'บัตรเจ้าหน้าที่',
};

const G = {
  solid: '#4ADE80',
  light: '#F7FEF9',
  border: '#DCFCE7',
  text:  '#166534',
};

type Step = 'summary' | 'payment' | 'income' | 'complete';

// ── Step Indicator ────────────────────────────────────────────
const STEPS = [
  {
    key: 'summary',
    label: 'รายละเอียด',
    title: 'ตรวจสอบรายละเอียด',
    desc: 'ตรวจสอบค่าใช้จ่ายและยอดรวมที่ต้องชำระให้ครบถ้วนก่อนดำเนินการ',
  },
  {
    key: 'payment',
    label: 'ชำระเงิน',
    title: 'ชำระค่าใช้จ่าย',
    desc: 'อัปโหลดหลักฐานการโอนเงิน และรอการยืนยันจากระบบ',
  },
  {
    key: 'income',
    label: 'รับเงิน',
    title: 'กรอกข้อมูลรับเงิน',
    desc: 'ระบุบัญชีธนาคารเพื่อรับรายได้จากการจัดงาน',
  },
];

function StepBar({ current }: { current: Step }) {
  const idx = current === 'complete' ? 3 : STEPS.findIndex(s => s.key === current);
  const activeStep = STEPS[idx];
  return (
    <div className="mb-6">
      {/* Progress dots */}
      <div className="flex items-center mb-5">
        {STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.key} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: done ? '#3674B5' : active ? 'white' : '#F3F4F6',
                    border: active ? '2px solid #3674B5' : done ? 'none' : '2px solid #E5E7EB',
                  }}>
                  {done
                    ? <CheckCircle size={16} color="white" strokeWidth={2.5} />
                    : <span className="text-xs font-bold" style={{ color: active ? '#3674B5' : '#9CA3AF' }}>{i + 1}</span>
                  }
                </div>
                <span className="text-[11px] font-semibold whitespace-nowrap"
                  style={{ color: active ? '#3674B5' : done ? '#374151' : '#9CA3AF' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-4 transition-colors"
                  style={{ background: done ? '#3674B5' : '#E5E7EB' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step description */}
      {activeStep && (
        <div className="bg-[#EEF4FB] border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: '#3674B5' }}>
            <span className="text-white text-xs font-black">{idx + 1}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#3674B5]">{activeStep.title}</p>
            <p className="text-xs text-[#3674B5]/70 mt-0.5">{activeStep.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 1: Summary ───────────────────────────────────────────
function SummaryStep({
  data, onNext,
}: { data: CheckoutData; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2.5 px-4 py-3.5 rounded-xl"
        style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
        <AlertCircle size={15} color="#F97316" className="flex-shrink-0 mt-px" />
        <div>
          <p className="text-xs font-bold m-0 mb-0.5" style={{ color: '#C2410C' }}>งานสิ้นสุดแล้ว</p>
          <p className="text-xs m-0" style={{ color: '#9A3412' }}>กรุณาชำระค่าใช้จ่ายเพื่อรับเงินรายได้</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
          <Receipt size={15} color="#3674B5" />
          <p className="text-sm font-bold text-gray-900 m-0">รายละเอียดค่าใช้จ่าย</p>
        </div>
        {data.Detail.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3.5"
            style={{ borderBottom: i < data.Detail.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EEF4FB' }}>
                {item.ProductName === 'booth' ? <Building2 size={15} color="#3674B5" /> : <Cpu size={15} color="#3674B5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 m-0">{PRODUCT_LABELS[item.ProductName] || item.ProductName}</p>
                <p className="text-xs text-gray-400 m-0">× {item.Quantity}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-700 m-0">
              ฿{(parseInt(item.Price) * item.Quantity).toLocaleString()}
            </p>
          </div>
        ))}
        <div className="flex justify-between items-center px-6 py-4"
          style={{ borderTop: '2px solid #F1F3F6', background: '#F9FAFB' }}>
          <p className="text-[15px] font-bold text-gray-900 m-0">ยอดรวมที่ต้องชำระ</p>
          <p className="text-2xl font-extrabold m-0" style={{ color: '#3674B5' }}>
            ฿{parseInt(data.TotalPrice).toLocaleString()}
          </p>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 mt-1"
        style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)', boxShadow: '0 4px 12px rgba(54,116,181,0.28)' }}>
        ดำเนินการชำระเงิน <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ── Payment Success Screen ────────────────────────────────────
function PaymentSuccessScreen({
  method, totalPrice, onNext,
}: { method: string; totalPrice: string; onNext: () => void }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); onNext(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center py-8 gap-4">
      <div className="w-18 h-18 rounded-full flex items-center justify-center"
        style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #3674B5, #498AC3)', boxShadow: '0 8px 24px rgba(54,116,181,0.3)' }}>
        <CheckCircle size={36} color="white" strokeWidth={2} />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-extrabold text-gray-900 m-0 mb-1.5">ชำระเงินสำเร็จ!</h3>
        <p className="text-sm text-gray-500 m-0 mb-1">
          ยอด ฿{parseInt(totalPrice).toLocaleString()} ได้รับการยืนยันแล้ว
        </p>
        <p className="text-xs text-gray-400 m-0">
          ชำระด้วย {method === 'QRscan' ? 'QR Code' : 'Credit Card'}
        </p>
      </div>

      <div className="px-8 py-3.5 rounded-2xl text-center"
        style={{ background: '#EEF4FB', border: '1px solid #B8D0EA' }}>
        <p className="text-xs font-semibold m-0 mb-1" style={{ color: '#5B8FC9' }}>ยอดที่ชำระ</p>
        <p className="text-2xl font-extrabold m-0" style={{ color: '#3674B5' }}>
          ฿{parseInt(totalPrice).toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <p className="text-xs text-gray-400 m-0">ไปยังขั้นตอนถัดไปใน {countdown} วินาที...</p>
        <button onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)', boxShadow: '0 4px 12px rgba(54,116,181,0.28)' }}>
          ดำเนินการรับเงิน <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Payment ───────────────────────────────────────────
function PaymentStep({
  expoID, data, onPaid,
}: { expoID: string; data: CheckoutData; onPaid: (method: 'QRscan' | 'Credit Card') => void }) {
  const [method, setMethod] = useState<'QRscan' | 'Credit Card' | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paidMethod, setPaidMethod] = useState<'QRscan' | 'Credit Card' | null>(null);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  if (success && paidMethod) {
    return (
      <PaymentSuccessScreen
        method={paidMethod}
        totalPrice={data.TotalPrice}
        onNext={() => onPaid(paidMethod)}
      />
    );
  }

  async function handleConfirm() {
    if (!method) return;
    setLoading(true); setError('');
    try {
      await confirmPayment(expoID, data.PaymentID, method);
      setPaidMethod(method);
      setSuccess(true);
    } catch {
      setError('ชำระเงินไม่สำเร็จ กรุณาลองใหม่');
    } finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium m-0">{error}</p>
        </div>
      )}

      <p className="text-xs font-semibold text-gray-600 m-0">เลือกวิธีชำระเงิน</p>

      {([
        { key: 'QRscan' as const, icon: QrCode, label: 'QR Code', desc: 'สแกนผ่านแอปธนาคาร' },
        { key: 'Credit Card' as const, icon: CreditCard, label: 'Credit Card', desc: 'Visa, Mastercard, JCB' },
      ]).map(m => (
        <div key={m.key} onClick={() => setMethod(m.key)}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all"
          style={{
            border: method === m.key ? '2px solid #3674B5' : '1.5px solid #E9ECF0',
            background: method === m.key ? '#EEF4FB' : '#FAFAFA',
          }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: method === m.key ? '#3674B5' : '#F3F4F6' }}>
            <m.icon size={19} color={method === m.key ? 'white' : '#6B7280'} strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 m-0">{m.label}</p>
            <p className="text-xs text-gray-400 m-0">{m.desc}</p>
          </div>
          <div className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ border: method === m.key ? '5px solid #3674B5' : '2px solid #D1D5DB' }} />
        </div>
      ))}

      {method === 'QRscan' && (
        <div className="rounded-2xl p-4 text-center border border-gray-100 bg-gray-50">
          <div className="w-32 h-32 mx-auto mb-2.5 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
            <img src="/images/QrCode.jpg" alt="QR" className="w-full h-full object-contain"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <p className="text-xs text-gray-500 m-0 mb-0.5">สแกนเพื่อชำระเงิน</p>
          <p className="text-lg font-extrabold m-0" style={{ color: '#3674B5' }}>
            ฿{parseInt(data.TotalPrice).toLocaleString()}
          </p>
        </div>
      )}

      {method === 'Credit Card' && (
        <div className="rounded-2xl p-3.5 border border-gray-100 bg-gray-50 flex flex-col gap-2.5">
          {[
            { key: 'number', label: 'หมายเลขบัตร', placeholder: '0000 0000 0000 0000' },
            { key: 'name',   label: 'ชื่อบนบัตร',   placeholder: 'FIRSTNAME LASTNAME' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">{f.label}</label>
              <input placeholder={f.placeholder}
                value={cardData[f.key as keyof typeof cardData]}
                onChange={e => setCardData(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#3674B5] transition bg-white" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: 'expiry', label: 'วันหมดอายุ', placeholder: 'MM/YY' },
              { key: 'cvv',    label: 'CVV',         placeholder: '000' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">{f.label}</label>
                <input placeholder={f.placeholder}
                  value={cardData[f.key as keyof typeof cardData]}
                  onChange={e => setCardData(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#3674B5] transition bg-white" />
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleConfirm} disabled={!method || loading}
        className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 mt-1 transition-all disabled:opacity-50"
        style={{
          background: method ? 'linear-gradient(135deg, #3674B5, #498AC3)' : '#F3F4F6',
          color: method ? 'white' : '#9CA3AF',
          cursor: method ? 'pointer' : 'not-allowed',
          boxShadow: method ? '0 4px 12px rgba(54,116,181,0.28)' : 'none',
        }}>
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังยืนยัน...</>
          : <><Lock size={13} />ยืนยันชำระเงิน ฿{parseInt(data.TotalPrice).toLocaleString()}</>
        }
      </button>
    </div>
  );
}

// ── Step 3: Income + Bank Account ────────────────────────────
function IncomeStep({
  expoID, income, onDone,
}: { expoID: string; income: IncomeData; onDone: () => void }) {
  const [form, setForm] = useState({
    recipient_name: '', entity_type: 'individual', tax_id: '',
    tax_address: '', tax_email: '', phone: '',
    bank_name: '', account_number: '', account_name: '', branch: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    const required = ['recipient_name', 'account_number', 'account_name', 'bank_name'];
    if (required.some(k => !form[k as keyof typeof form])) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ'); return;
    }
    if (!file) { setError('กรุณาอัปโหลดเอกสารยืนยัน'); return; }
    setLoading(true); setError('');
    try {
      await createPaymentAccount(expoID, { ...form, verify_file: file });
      onDone();
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally { setLoading(false); }
  }

  const net = parseInt(income.TotalPrice);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 font-medium m-0">{error}</p>
        </div>
      )}

      {/* Net income */}
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
        style={{ background: G.light, border: `1px solid ${G.border}` }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#22C55E' }}>
          <TrendingUp size={20} color="white" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold m-0 mb-0.5" style={{ color: G.text }}>รายได้สุทธิหลังหักค่าใช้จ่าย</p>
          <p className="text-2xl font-extrabold m-0" style={{ color: G.text }}>฿{net.toLocaleString()}</p>
        </div>
      </div>

      {/* Income breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
          <Banknote size={15} color="#22C55E" />
          <p className="text-sm font-bold text-gray-900 m-0">รายได้จากงาน</p>
        </div>
        {income.Detail.map((item, i) => (
          <div key={i} className="flex justify-between items-center px-6 py-3.5"
            style={{ borderBottom: i < income.Detail.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
            <div>
              <p className="text-sm font-semibold text-gray-900 m-0">{item.Name}</p>
              <p className="text-xs text-gray-400 m-0">× {item.Quantity} รายการ</p>
            </div>
            <p className="text-sm font-bold text-gray-700 m-0">฿{parseInt(item.TotalPrice).toLocaleString()}</p>
          </div>
        ))}
        <div className="flex justify-between items-center px-6 py-4"
          style={{ borderTop: '2px solid #F1F3F6', background: G.light }}>
          <p className="text-[15px] font-bold text-gray-900 m-0">รวมรายได้</p>
          <p className="text-2xl font-extrabold m-0" style={{ color: '#22C55E' }}>
            ฿{parseInt(income.TotalPrice).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Bank form */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
          <Building2 size={15} color="#3674B5" />
          <p className="text-xs font-bold text-gray-900 m-0">
            บัญชีรับเงิน <span className="text-red-500">*</span>
          </p>
        </div>
        <div className="p-7 flex flex-col gap-6">
          {[
            { key: 'recipient_name', label: 'ชื่อผู้รับเงิน / นิติบุคคล', placeholder: 'ชื่อ-นามสกุล หรือชื่อบริษัท' },
            { key: 'account_number', label: 'เลขที่บัญชี', placeholder: '000-0-00000-0' },
            { key: 'account_name',   label: 'ชื่อบัญชี', placeholder: 'ชื่อบัญชีธนาคาร' },
            { key: 'bank_name',      label: 'ธนาคาร', placeholder: 'เช่น กสิกรไทย, SCB, กรุงเทพ' },
            { key: 'branch',         label: 'สาขา', placeholder: 'ชื่อสาขา' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">{f.label}</label>
              <input placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] outline-none focus:border-[#3674B5] transition" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { key: 'tax_id', label: 'เลขที่ผู้เสียภาษี', placeholder: '0-0000-00000-00-0' },
              { key: 'phone',  label: 'เบอร์โทร', placeholder: '0XX-XXX-XXXX' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">{f.label}</label>
                <input placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] outline-none focus:border-[#3674B5] transition" />
              </div>
            ))}
          </div>

          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#EEF4FB', border: '1px solid #B8D0EA' }}>
              <Package size={15} color="#3674B5" />
              <span className="text-xs font-semibold flex-1 truncate" style={{ color: '#3674B5' }}>{file.name}</span>
              <button onClick={() => setFile(null)} className="bg-transparent border-none cursor-pointer p-0">
                <X size={13} color="#9CA3AF" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-50 transition"
              style={{ border: '1.5px dashed #B8D0EA', background: 'white' }}>
              <Upload size={13} /> อัปโหลดเอกสารยืนยัน
            </button>
          )}
          <p className="text-xs text-gray-400 m-0">สำเนาบัตรประชาชน หรือหนังสือรับรองบริษัท</p>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #17A34A, #22C55E)', boxShadow: '0 4px 12px rgba(34,197,94,0.22)' }}>
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />กำลังบันทึก...</>
          : <><CheckCircle size={14} />ยืนยันและรับเงิน</>
        }
      </button>
    </div>
  );
}

// ── Complete Summary ──────────────────────────────────────────
function CompleteSummary({
  checkout, income, payDetail,
}: { checkout: CheckoutData; income: IncomeData; payDetail: PaymentDetail | null }) {
  const net = parseInt(income.TotalPrice) - parseInt(checkout.TotalPrice);

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: G.light, border: `1px solid ${G.border}` }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #17A34A, #22C55E)', boxShadow: '0 4px 16px rgba(34,197,94,0.22)' }}>
          <ShieldCheck size={28} color="white" strokeWidth={2} />
        </div>
        <p className="text-base font-extrabold m-0 mb-1" style={{ color: G.text }}>สรุปงานเสร็จสมบูรณ์</p>
        <p className="text-xs m-0" style={{ color: '#4B7C5A' }}>ทีมงานจะโอนเงินให้ภายใน 3-5 วันทำการ</p>
      </div>

      {/* 3 summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'รายได้รวม', value: `฿${parseInt(income.TotalPrice).toLocaleString()}`, bg: G.light, border: G.border, color: G.text },
          { label: 'ค่าใช้จ่าย', value: `฿${parseInt(checkout.TotalPrice).toLocaleString()}`, bg: '#FEF2F2', border: '#FECACA', color: '#DC2626' },
          { label: 'สุทธิ', value: `฿${net.toLocaleString()}`, bg: G.light, border: G.border, color: G.text, bold: true },
        ].map(c => (
          <div key={c.label} className="rounded-2xl p-4 text-center"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <p className="text-[11px] text-gray-500 m-0 mb-1 font-medium">{c.label}</p>
            <p className="font-extrabold m-0" style={{ fontSize: c.bold ? 15 : 13, color: c.color }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payment info */}
      {payDetail && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
            <Wallet size={15} color="#6B7280" />
            <p className="text-sm font-bold text-gray-900 m-0">ข้อมูลการชำระ</p>
          </div>
          {[
            { label: 'ชำระโดย', value: `${payDetail.Firstname} ${payDetail.Lastname}` },
            { label: 'อีเมล',   value: payDetail.Email },
            { label: 'วิธีชำระ', value: payDetail.PaymentMethod },
            { label: 'ยอดชำระ', value: `฿${parseInt(payDetail.TotalPrice).toLocaleString()}` },
          ].map((r, i, arr) => (
            <div key={r.label} className="flex justify-between px-6 py-3.5"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
              <span className="text-xs text-gray-500">{r.label}</span>
              <span className="text-xs font-semibold text-gray-900">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Income detail */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
          <TrendingUp size={15} color="#22C55E" />
          <p className="text-sm font-bold text-gray-900 m-0">รายได้</p>
        </div>
        {income.Detail.map((item, i, arr) => (
          <div key={i} className="flex justify-between px-6 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
            <span className="text-xs text-gray-600">{item.Name} × {item.Quantity}</span>
            <span className="text-xs font-semibold text-gray-700">฿{parseInt(item.TotalPrice).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Cost detail */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-6 py-[18px] border-b border-gray-100 flex items-center gap-2.5">
          <Receipt size={15} color="#3674B5" />
          <p className="text-sm font-bold text-gray-900 m-0">ค่าใช้จ่าย</p>
        </div>
        {checkout.Detail.filter(i => i.Quantity > 0).map((item, i, arr) => (
          <div key={i} className="flex justify-between px-6 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
            <span className="text-xs text-gray-600">{PRODUCT_LABELS[item.ProductName] || item.ProductName} × {item.Quantity}</span>
            <span className="text-xs font-semibold text-gray-700">฿{(parseInt(item.Price) * item.Quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Tab ──────────────────────────────────────────────────
export function CheckoutTab({ expoID, role, onComplete }: Props) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('summary');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [payDetail, setPayDetail] = useState<PaymentDetail | null>(null);
  const [paidMethod, setPaidMethod] = useState<string | null>(null);

  useEffect(() => { init(); }, [expoID]);

  async function init() {
    setLoading(true);
    try {
      const payments = await getExpoPayments(expoID);
      const closed = payments.find(p => p.Title === 'closed_expo_fee');

      const checkout = await getCheckoutDetail(expoID);
      setCheckoutData(checkout);

      if (!closed || !closed.PaymentID) {
        setStep('summary');
      } else if (closed.Status === 'pending') {
        setStep('payment');
      } else if (closed.Status === 'paid') {
        const [income, detail] = await Promise.all([
          getIncome(expoID),
          getPaymentDetail(expoID),
        ]);
        setIncomeData(income);
        setPayDetail(detail);
        setPaidMethod(detail.PaymentMethod);
        setStep('income');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaid(method: 'QRscan' | 'Credit Card') {
    setPaidMethod(method);
    const [income, detail] = await Promise.all([
      getIncome(expoID),
      getPaymentDetail(expoID),
    ]);
    setIncomeData(income);
    setPayDetail(detail);
    setStep('income');
  }

  async function handleAccountDone() {
    setStep('complete');
    onComplete?.();
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
      <p className="text-sm text-gray-400">กำลังโหลด...</p>
    </div>
  );

  if (!checkoutData) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2">
      <p className="text-sm font-semibold text-gray-500">ไม่พบข้อมูลการชำระเงิน</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">สรุปและจัดการการเงิน</h3>
          {step === 'complete' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: G.light, border: `1px solid ${G.border}`, color: G.text }}>
              <ShieldCheck size={11} /> เสร็จสมบูรณ์
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">ชำระค่าใช้จ่ายและรับเงินรายได้จากการจัดงาน</p>
      </div>

      {/* Alert */}
      {step !== 'complete' && (
        <div className="flex gap-2.5 px-4 py-3.5 rounded-xl"
          style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <AlertCircle size={15} color="#F97316" className="flex-shrink-0 mt-px" />
          <div>
            <p className="text-xs font-bold m-0 mb-0.5" style={{ color: '#C2410C' }}>งานสิ้นสุดแล้ว กรุณาดำเนินการ</p>
            <p className="text-xs m-0" style={{ color: '#9A3412' }}>ชำระค่าใช้จ่ายเพื่อรับเงินรายได้จากการจัดงาน</p>
          </div>
        </div>
      )}

      {/* Step bar — ไม่แสดงตอน complete */}
      {step !== 'complete' && <StepBar current={step} />}

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 p-7"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {step === 'summary' && (
          <SummaryStep data={checkoutData} onNext={() => setStep('payment')} />
        )}
        {step === 'payment' && (
          <PaymentStep expoID={expoID} data={checkoutData} onPaid={handlePaid} />
        )}
        {step === 'income' && incomeData && (
          <IncomeStep expoID={expoID} income={incomeData} onDone={handleAccountDone} />
        )}
        {step === 'complete' && incomeData && (
          <CompleteSummary
            checkout={checkoutData}
            income={incomeData}
            payDetail={payDetail}
          />
        )}
      </div>
    </div>
  );
}