// src/lib/auth/tokenManager.ts
/**
 * 🔑 Token Manager - Cookie-based Version
 * - เก็บ accessToken ใน localStorage
 * - refreshToken อยู่ใน HTTPOnly Cookie (จาก Backend)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class TokenManager {
  private static instance: TokenManager;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  // Singleton
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * 💾 บันทึก Access Token (แค่ตัวเดียว)
   */
  setTokens(accessToken: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('accessToken', accessToken);
    console.log('✅ Access Token saved');
  }

  /**
   * 🔑 ดึง Access Token
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * 🗑️ ลบ Token ทั้งหมด
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    
    this.isRefreshing = false;
    this.refreshPromise = null;
    
    console.log('🗑️ Tokens cleared');
  }

  /**
   * ✅ เช็คว่ามี Token หรือไม่
   */
  hasTokens(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * 🔄 Refresh Token (ใช้ Cookie จาก Backend)
   */
  async refreshToken(): Promise<boolean> {
    // ถ้ากำลัง refresh อยู่ → รอ promise เดิม
    if (this.isRefreshing && this.refreshPromise) {
      console.log('⏳ Already refreshing, waiting...');
      return this.refreshPromise;
    }

    // สร้าง promise ใหม่
    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    return this.refreshPromise;
  }

  /**
   * 🔧 ทำการ Refresh จริงๆ
   */
  private async _performRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing token...');

      // ✅ Backend จะอ่าน refreshToken จาก Cookie เอง
      const response = await fetch(`${API_URL}/users/refresh`, {
        method: 'GET',
        credentials: 'include',  // ← สำคัญ! ส่ง Cookie ไป
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Refresh failed:', response.status);
        this.clearTokens();
        
        // Redirect ไป login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return false;
      }

      const data = await response.json();
      
      // ✅ บันทึกแค่ accessToken ใหม่
      this.setTokens(data.accessToken);

      console.log('✅ Token refreshed successfully');
      return true;

    } catch (error) {
      console.error('❌ Refresh error:', error);
      this.clearTokens();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return false;
      
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * ⏰ เช็คว่า Token หมดอายุแล้วหรือยัง (ไม่จำเป็นในระบบนี้)
   */
  isTokenExpired(): boolean {
    // เราจะรู้ว่าหมดเมื่อได้ 401
    return false;
  }
}

// Export singleton
export const tokenManager = TokenManager.getInstance();

// Export helper functions
export const setTokens = (access: string) => 
  tokenManager.setTokens(access);

export const clearTokens = () => tokenManager.clearTokens();

export const getAccessToken = () => tokenManager.getAccessToken();

export const hasTokens = () => tokenManager.hasTokens();