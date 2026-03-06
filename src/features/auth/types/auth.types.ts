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
  Role: UserRole;
  Career: string;
  Company: string;
  Detail: string;
  ProfilePic: string;
}

/**
 * Register Request - ส่งไปเป็น lowercase
 */
export interface RegisterRequest {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  tel: string;
  dob: string;
  gender: string;
  pdpa_accepted: boolean;
  role: UserRole;
}

/**
 * Login Request - เพิ่ม role ✅
 */
export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;  // ✅ เพิ่ม role field
}

/**
 * Auth Response
 */
export interface AuthResponse {
  accessToken: string;
}

export interface UpdateUserRequest {
  // Required fields
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