// src/features/auth/components/ForgotPasswordForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserRole } from '../types/auth.types';
import { createOTP, verifyOTP, changePassword } from '../api/forgotPasswordApi';

// ─── Step Indicator ───────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { no: 1, label: 'ยืนยันตัวตน' },
    { no: 2, label: 'กรอก OTP' },
    { no: 3, label: 'รหัสผ่านใหม่' },
  ];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s.no} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                current > s.no
                  ? 'bg-green-500 text-white'
                  : current === s.no
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-400'
              }`}
              style={current === s.no ? { background: 'linear-gradient(135deg,#3674B5,#498AC3)' } : {}}
            >
              {current > s.no
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : s.no
              }
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${
              current === s.no ? 'text-[#3674B5]' : current > s.no ? 'text-green-500' : 'text-gray-400'
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-5 mx-2 transition-all ${current > s.no ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>('organizer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const startCountdown = (sec = 60) => {
    setResendCountdown(sec);
    const t = setInterval(() => {
      setResendCountdown(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; });
    }, 1000);
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp]; n[i] = v.slice(-1); setOtp(n);
    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) { setOtp(p.split('')); document.getElementById('otp-5')?.focus(); }
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await createOTP(email, role); setStep(2); startCountdown(); }
    catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) { setError('กรุณากรอก OTP ให้ครบ 6 หลัก'); return; }
    setError(''); setLoading(true);
    try { const t = await verifyOTP(email, otpStr, role); setResetToken(t); setStep(3); }
    catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); setOtp(['','','','','','']); document.getElementById('otp-0')?.focus(); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setError(''); setLoading(true);
    try { await createOTP(email, role); setOtp(['','','','','','']); startCountdown(); }
    catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setError(''); setLoading(true);
    try { await changePassword(resetToken, password, confirmPassword); setSuccess(true); }
    catch (err: any) { setError(err.message || 'เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  // ── Success ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1.5">เปลี่ยนรหัสผ่านสำเร็จ</h2>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว<br/>สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย</p>
          <button onClick={() => router.push('/login')}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
            ไปหน้าเข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  const eyeOff = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const eyeOn  = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

  return (
    <div className="min-h-screen flex">

      {/* ── Left ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-8 lg:px-16 xl:px-24 py-10 bg-white">
        <div className="w-full max-w-sm">

          {/* Back */}
          <button
            onClick={() => step === 1 ? router.push('/login') : setStep(p => (p - 1) as 1|2|3)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition mb-8 text-sm font-medium"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            {step === 1 ? 'กลับไปเข้าสู่ระบบ' : 'ขั้นตอนก่อนหน้า'}
          </button>

          {/* Title */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">ลืมรหัสผ่าน</h1>
            <p className="text-sm text-gray-400">
              {step === 1 && 'กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งรหัส OTP ให้คุณ'}
              {step === 2 && <>ส่ง OTP ไปที่ <span className="font-semibold text-gray-600">{email}</span> แล้ว</>}
              {step === 3 && 'ตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ'}
            </p>
          </div>

          {/* Steps */}
          <StepIndicator current={step} />

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">

              {/* Role Dropdown */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="organizer">ผู้จัดงาน (Organizer)</option>
                  <option value="booth_manager">ผู้จัดการบูธ (Booth Manager)</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="อีเมลที่ใช้ลงทะเบียน" required disabled={loading} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-90 mt-2"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                {loading
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังส่ง OTP...</>
                  : <>ส่งรหัส OTP ไปที่อีเมล <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                }
              </button>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5">
              <div className="bg-[#EBF3FC] rounded-xl px-4 py-3.5 flex gap-3 items-start">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[#1E40AF]">ตรวจสอบอีเมลของคุณ</p>
                  <p className="text-xs text-[#3674B5] mt-0.5 leading-relaxed">รหัส OTP 6 หลักถูกส่งไปที่ <span className="font-bold">{email}</span><br/>รหัสมีอายุ 5 นาที</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 text-center tracking-wide uppercase">กรอกรหัส OTP</p>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                      value={d} onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      maxLength={1} disabled={loading}
                      className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 bg-gray-50 focus:outline-none focus:bg-white transition-all ${
                        d ? 'border-[#3674B5] text-[#3674B5] bg-[#EBF3FC]' : 'border-gray-200 text-gray-800'
                      }`}
                      style={{ height: '52px' }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading || otp.join('').length < 6}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                {loading
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังตรวจสอบ...</>
                  : 'ยืนยัน OTP'
                }
              </button>

              <p className="text-center text-xs text-gray-400">
                ไม่ได้รับรหัส?{' '}
                {resendCountdown > 0
                  ? <span className="text-gray-400 font-medium">ส่งใหม่ได้ใน {resendCountdown}s</span>
                  : <button type="button" onClick={handleResend} disabled={loading}
                      className="text-[#3674B5] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0">
                      ส่ง OTP ใหม่
                    </button>
                }
              </p>
            </form>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              {/* New password */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" required disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3.5 rounded-xl border-0 bg-gray-50 text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="ยืนยันรหัสผ่านใหม่" required disabled={loading} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? eyeOff : eyeOn}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {password === confirmPassword
                    ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>รหัสผ่านตรงกัน</>
                    : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>รหัสผ่านไม่ตรงกัน</>
                  }
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition disabled:opacity-70 flex items-center justify-center gap-2 hover:opacity-90 mt-1"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                {loading
                  ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังเปลี่ยนรหัสผ่าน...</>
                  : 'ยืนยันรหัสผ่านใหม่'
                }
              </button>
            </form>
          )}

        </div>
      </div>

      {/* ── Right ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"/>
        </div>
        <div className="relative z-10 w-full max-w-sm">
          <Image
            src="/images/Forgot_Password.png"
            alt="Forgot Password"
            width={420}
            height={420}
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

    </div>
  );
}