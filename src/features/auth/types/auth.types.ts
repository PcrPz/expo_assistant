// src/features/auth/types/auth.types.ts

/**
 * User Interface - ตรงกับ Backend Response (Uppercase)
 */
export interface User {
  Firstname: string;
  Lastname: string;
  Email: string;
  Tel: string;
  Gender: string;
  Role: string;
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