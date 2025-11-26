// src/features/auth/types/auth.types.ts

/**
 * ประเภทของผู้ใช้
 */
export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  role: 'user' | 'admin' | 'organizer' | 'exhibitor';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * ข้อมูลสำหรับ Login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * ข้อมูลที่ได้จาก Login สำเร็จ
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

/**
 * Error จาก API
 */
export interface AuthError {
  message: string;
  statusCode?: number;
}