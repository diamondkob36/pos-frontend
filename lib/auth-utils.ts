/**
 * 🔐 Authentication Utilities
 * จัดการ Token, Session และการ Logout อัตโนมัติ
 */

/**
 * ตรวจสอบว่า Token หมดอายุหรือยัง
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true; // ถ้า decode ไม่ได้ ถือว่า token ไม่ถูกต้อง
  }
};

/**
 * คำนวณเวลาที่เหลือก่อน Token หมดอายุ (วินาที)
 */
export const getTokenTimeLeft = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  } catch {
    return 0;
  }
};

/**
 * ดึงข้อมูลจาก Token Payload
 */
export const getTokenPayload = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

/**
 * ล้าง Session ทั้งหมด
 */
export const clearSession = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    sessionStorage.clear();
  }
};

/**
 * ล้าง Session และ Redirect ไปหน้า Login
 */
export const clearSessionAndRedirect = (showToast = true): void => {
  if (typeof window !== 'undefined') {
    // ตรวจสอบว่าอยู่ในหน้า Login หรือไม่
    if (window.location.pathname === '/login') {
      clearSession();
      return; // ไม่ต้องแสดง Toast หรือ Redirect
    }

    clearSession();
    
    if (showToast) {
      // แสดง Toast แทน Alert
      import('./toast').then(({ toast }) => {
        toast.error('🔒 Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', 2000);
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      });
    } else {
      window.location.href = '/login';
    }
  }
};

/**
 * ตรวจสอบ Token ปัจจุบันว่ายังใช้งานได้หรือไม่
 */
export const validateCurrentToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('pos_token');
  
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    clearSessionAndRedirect();
    return false;
  }
  
  return true;
};

/**
 * บันทึก Token และ User ลง localStorage
 */
export const saveAuthData = (token: string, user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pos_token', token);
    localStorage.setItem('pos_user', JSON.stringify(user));
  }
};

/**
 * ดึงข้อมูล User จาก localStorage
 */
export const getCurrentUser = (): any => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('pos_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * ตรวจสอบว่า User มีสิทธิ์ตาม Role หรือไม่
 */
export const hasRole = (allowedRoles: string[]): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  return allowedRoles.includes(user.role);
};
