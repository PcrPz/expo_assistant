// src/features/events/api/joinApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// Join Expo by Invite Code
// ============================================
export async function joinExpoByCode(inviteCode: string): Promise<{
  success: boolean;
  message: string;
  expoId?: string;
}> {
  try {
    console.log('📤 Joining expo with code:', inviteCode);
    
    // ✅ ใช้ endpoint ที่ Backend มี: /staff/join-with-code
    const response = await fetchWithAuth(`${API_URL}/staff/join-with-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        code: inviteCode  // ✅ เปลี่ยนจาก invite_code เป็น code
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Failed to join expo:', response.status, errorData);
      
      // Handle specific error cases
      if (response.status === 400) {
        // Backend return: "Code not match"
        return {
          success: false,
          message: errorData.error || 'โค้ดเชิญไม่ถูกต้องหรือหมดอายุแล้ว',
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'ไม่พบงาน Expo ที่ต้องการเข้าร่วม',
        };
      } else if (response.status === 409) {
        return {
          success: false,
          message: 'คุณได้เข้าร่วมงานนี้แล้ว',
        };
      }
      
      return {
        success: false,
        message: errorData.error || 'เกิดข้อผิดพลาดในการเข้าร่วมงาน',
      };
    }

    const result = await response.json();
    console.log('✅ Successfully joined expo:', result);
    
    // Backend return: { "expo_id": "uuid-string" }
    return {
      success: true,
      message: 'เข้าร่วมงานสำเร็จ',
      expoId: result.expo_id, // ✅ Backend ส่งมาเป็น expo_id
    };
    
  } catch (error) {
    console.error('❌ Failed to join expo:', error);
    return {
      success: false,
      message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
    };
  }
}