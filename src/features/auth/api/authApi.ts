// src/features/auth/api/authApi.ts

import type { LoginRequest, LoginResponse } from '../types/auth.types';

// Base URL ของ Backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ⚠️ MOCK MODE - เปลี่ยนเป็น false เมื่อพร้อมใช้ API จริง
const USE_MOCK = true;


const MOCK_USER = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  phoneNumber: '0812345678',
  companyName: 'Test Company',
  role: 'user' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Mock Login Function
 */
async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
  // จำลองการรอ API (1 วินาที)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // ตรวจสอบ email/password (ทดสอบ)
  if (
    (data.email === 'test@example.com' || data.email === 'testuser') &&
    data.password === '123456'
  ) {
    return {
      user: MOCK_USER,
      accessToken: 'mock-access-token-12345',
      refreshToken: 'mock-refresh-token-67890',
      message: 'เข้าสู่ระบบสำเร็จ',
    };
  }

  // Login ล้มเหลว
  throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
}

/**
 * เข้าสู่ระบบ
 * @param data - email และ password
 * @returns ข้อมูล user และ token
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // ถ้าใช้ Mock Mode
  if (USE_MOCK) {
    return mockLogin(data);
  }

  // API จริง
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }

    return response.json();
  } catch (error: any) {
    throw new Error(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
  }
}

/**
 * ออกจากระบบ
 */
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    // Mock logout
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return;
  }

  // API จริง
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error: any) {
    throw new Error(error.message || 'ออกจากระบบไม่สำเร็จ');
  }
}