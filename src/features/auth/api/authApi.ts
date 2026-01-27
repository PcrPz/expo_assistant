// src/features/auth/api/authApi.ts
/**
 * 🔐 Auth API - Cookie-based Version
 * - accessToken: localStorage
 * - refreshToken: HTTPOnly Cookie
 */

import type { 
  User, 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse,
  UpdateUserRequest 
} from '../types/auth.types';

import { tokenManager } from '@/src/lib/auth/tokenManager';
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// 1. Register (POST /users/register)
// ============================================

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    credentials: 'include',  // ← สำคัญ! รับ Cookie
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const result = await response.json();
  
  // ✅ บันทึกแค่ accessToken (refreshToken อยู่ใน Cookie แล้ว)
  tokenManager.setTokens(result.accessToken);
  
  return result;
}

// ============================================
// 2. Login (POST /users/login)
// ============================================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    credentials: 'include',  // ← สำคัญ! รับ Cookie
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const result = await response.json();
  
  // ✅ บันทึกแค่ accessToken
  tokenManager.setTokens(result.accessToken);
  
  return result;
}

// ============================================
// 3. Get User Detail (GET /users/detail)
// ============================================

export async function getUserDetail(): Promise<User> {
  const response = await fetchWithAuth(`${API_URL}/users/detail`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get user detail');
  }

  return response.json();
}

// ============================================
// 4. Logout (GET /users/logout)
// ============================================

export async function logout(): Promise<void> {
  try {
    await fetchWithAuth(`${API_URL}/users/logout`, {
      method: 'GET',
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    tokenManager.clearTokens();
  }
}

// ============================================
// 5. Update User (PUT /users/update)
// ============================================

export async function updateUser(data: UpdateUserRequest): Promise<void> {
  const formData = new FormData();
  
  if (data.firstname) formData.append('firstname', data.firstname);
  if (data.lastname) formData.append('lastname', data.lastname);
  if (data.email) formData.append('email', data.email);
  if (data.tel) formData.append('tel', data.tel);
  if (data.gender) formData.append('gender', data.gender);
  
  if (data.dob) formData.append('dob', data.dob);
  if (data.career) formData.append('career', data.career);
  if (data.company) formData.append('company', data.company);
  if (data.detail) formData.append('detail', data.detail);
  
  if (data.profile_pic) {
    formData.append('profile_pic', data.profile_pic);
  }

  console.log('📤 Sending data to backend:');
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: [File] ${value.name}`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }

  const response = await fetchWithAuth(`${API_URL}/users/update`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Update failed');
  }
}