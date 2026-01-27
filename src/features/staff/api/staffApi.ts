// src/features/staff/api/staffApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Staff {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string;
}

// ============================================
// Get Staff List
// ============================================
export async function getStaffList(expoId: string): Promise<Staff[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/staff/${expoId}/staff-list`);
    
    if (!response.ok) {
      console.error(`Failed to fetch staff for expo ${expoId}:`, response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('📊 Raw API Response:', data); // Debug log
    
    // รองรับทั้ง array ตรงๆ และ object ที่มี key
    let staffList = [];
    if (Array.isArray(data)) {
      staffList = data;
    } else if (data && Array.isArray(data.staff)) {
      staffList = data.staff;
    } else if (data && Array.isArray(data.staffList)) {
      staffList = data.staffList;
    } else {
      console.warn('⚠️ Unexpected API response format:', data);
      return [];
    }
    
    console.log('📋 Staff List:', staffList); // Debug log
    
    // Map ข้อมูลให้รองรับหลาย format
    const mappedStaff = staffList.map((s: any) => {
      const staff = {
        id: s.id || s.user_id || s.ID || s.UserID || '',
        firstname: s.firstname || s.Firstname || s.first_name || '',
        lastname: s.lastname || s.Lastname || s.last_name || '',
        email: s.email || s.Email || '',
        role: s.role || s.Role || '',
        status: s.status || s.Status || '',
      };
      console.log('👤 Mapped Staff:', staff); // Debug log
      return staff;
    });
    
    return mappedStaff;
    
  } catch (error) {
    console.error(`❌ Failed to fetch staff for expo ${expoId}:`, error);
    return [];
  }
}

// ============================================
// Invite Staff by Email
// ============================================
export async function inviteStaffByEmail(
  expoId: string,
  data: {
    email: string;
    role: string;
  }
): Promise<boolean> {
  try {
    console.log('📤 Inviting staff:', data); // Debug log
    
    const response = await fetchWithAuth(`${API_URL}/staff/${expoId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('❌ Failed to invite staff:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }

    console.log('✅ Staff invited successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to invite staff:', error);
    return false;
  }
}

// ============================================
// Create Invite Code
// ============================================
export async function createInviteCode(
  expoId: string,
  data: {
    role: string;
  }
): Promise<{ code: string } | null> {
  try {
    console.log('📤 Creating invite code:', data); // Debug log
    
    const response = await fetchWithAuth(
      `${API_URL}/staff/${expoId}/create-invite-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to create invite code:', response.status);
      return null;
    }

    const result = await response.json();
    console.log('✅ Invite code created:', result); // Debug log
    return { code: result.code };
    
  } catch (error) {
    console.error('❌ Failed to create invite code:', error);
    return null;
  }
}

// ============================================
// Change Staff Role
// ============================================
export async function changeStaffRole(
  expoId: string,
  data: {
    user_id: string;
    role: string;
  }
): Promise<boolean> {
  try {
    console.log('📤 Changing staff role:', data); // Debug log
    
    const response = await fetchWithAuth(
      `${API_URL}/staff/${expoId}/change-role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to change staff role:', response.status);
      return false;
    }

    console.log('✅ Staff role changed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to change staff role:', error);
    return false;
  }
}

// ============================================
// Remove Staff
// ============================================
export async function removeStaff(
  expoId: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('📤 Removing staff:', userId); // Debug log
    
    const response = await fetchWithAuth(
      `${API_URL}/staff/${expoId}/remove/${userId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to remove staff:', response.status);
      return false;
    }

    console.log('✅ Staff removed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to remove staff:', error);
    return false;
  }
}