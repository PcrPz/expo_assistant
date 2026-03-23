// src/features/auth/api/forgotPasswordApi.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// 1. Create OTP (POST /users/create-otp)
// ============================================
export async function createOTP(email: string, role: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/create-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMap: Record<string, string> = {
      'otp error': 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีเมลและบทบาทที่เลือก',
    };
    const msg = errorMap[error.error] || 'ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง';
    throw new Error(msg);
  }
}

// ============================================
// 2. Verify OTP (POST /users/verify-otp)
// ============================================
export async function verifyOTP(
  email: string,
  otp: string,
  role: string
): Promise<string> {
  const response = await fetch(`${API_URL}/users/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMap: Record<string, string> = {
      'wrong OTP': 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    };
    const msg = errorMap[error.error] || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว';
    throw new Error(msg);
  }

  const data = await response.json();
  return data.resetToken;
}

// ============================================
// 3. Change Password (POST /users/change-password)
// ============================================
export async function changePassword(
  resetToken: string,
  password: string,
  confirmPassword: string
): Promise<void> {
  const response = await fetch(`${API_URL}/users/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resetToken}`,
    },
    body: JSON.stringify({
      password,
      confirm_password: confirmPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    const errorMap: Record<string, string> = {
      'Failed to change password': 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง',
      'Unauthorized': 'หมดเวลาดำเนินการ กรุณาเริ่มต้นใหม่',
    };
    const msg = errorMap[error.error] || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
    throw new Error(msg);
  }
}