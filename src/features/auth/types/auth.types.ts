// src/features/auth/types/auth.types.ts

/**
 * User Role Types - ประเภทผู้ใช้งาน
 */
export type UserRole = 'organizer' | 'booth_manager';

/**
 * User Interface - ตรงกับ Backend Response (Uppercase)
 */
export interface User {
  Firstname: string;
  Lastname: string;
  Email: string;
  Tel: string;
  Gender: string;
  Role: UserRole;  // ✅ เปลี่ยนเป็น UserRole แทน string
  Career: string;
  Company: string;
  Detail: string;
  ProfilePic: string;
}

/**
 * Register Request - ส่งไปเป็น lowercase
 */
export interface RegisterRequest {
  firstname: string;           // lowercase
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  tel: string;
  dob: string;
  gender: string;
  pdpa_accepted: boolean;
  role: UserRole;              // ✅ เพิ่ม role field
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Auth Response
 */
export interface AuthResponse {
  accessToken: string;
}

export interface UpdateUserRequest {
  // Required fields (ต้องส่งเสมอ)
  firstname: string;
  lastname: string;
  email: string;
  tel: string;
  gender: string;
  // Optional fields
  password?: string;
  dob?: string;
  career?: string;
  company?: string;
  detail?: string;
  profile_pic?: File;
}