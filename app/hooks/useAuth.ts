"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id?: number;
  username: string;
  name: string;
  role: string;
}

/**
 * ตรวจสอบว่า Token หมดอายุหรือยัง
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

/**
 * ล้าง Session ทั้งหมดและ Redirect ไป Login
 */
const clearSessionAndRedirect = (router: any, pathname: string) => {
  // ไม่ทำงานในหน้า Login
  if (pathname === '/login') {
    return;
  }

  localStorage.removeItem("pos_user");
  localStorage.removeItem("pos_token");
  sessionStorage.clear();
  router.push("/login");
};

export function useAuth(allowedRoles?: string[]) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // แปลง Array ให้เป็น String ก่อน
  const rolesString = allowedRoles ? allowedRoles.join(",") : "";

  // ตรวจสอบ Token Expiration แบบ Real-time
  const checkTokenExpiration = useCallback(() => {
    // ไม่ทำงานในหน้า Login
    if (pathname === '/login') {
      return;
    }

    const token = localStorage.getItem("pos_token");
    
    if (!token) {
      clearSessionAndRedirect(router, pathname);
      return;
    }

    if (isTokenExpired(token)) {
      clearSessionAndRedirect(router, pathname);
    }
  }, [router, pathname]);

  useEffect(() => {
    // ไม่ทำงานในหน้า Login
    if (pathname === '/login') {
      return;
    }

    const storedUser = localStorage.getItem("pos_user");
    const token = localStorage.getItem("pos_token");

    if (storedUser && token) {
      // ตรวจสอบว่า Token หมดอายุหรือไม่
      if (isTokenExpired(token)) {
        clearSessionAndRedirect(router, pathname);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      
      // อัปเดตข้อมูล User เฉพาะตอนที่ข้อมูลเปลี่ยนไปจริงๆ เท่านั้น
      setCurrentUser((prev) => 
        prev?.username === parsedUser.username ? prev : parsedUser
      );

      // เช็คสิทธิ์การเข้าถึงหน้าเว็บ
      if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
        router.push("/");
      }
    } else {
      router.push("/login");
    }
  }, [router, rolesString, pathname]);

  // ตรวจสอบ Token ทุก 30 วินาที (เฉพาะนอกหน้า Login)
  useEffect(() => {
    if (pathname === '/login') {
      return;
    }

    const interval = setInterval(checkTokenExpiration, 30000);
    return () => clearInterval(interval);
  }, [checkTokenExpiration, pathname]);

  const handleLogout = async () => {
    const { confirm } = await import("@/lib/toast");
    const confirmed = await confirm("ต้องการออกจากระบบใช่หรือไม่?", "ออกจากระบบ");
    
    if (confirmed) {
      clearSessionAndRedirect(router, pathname);
      setCurrentUser(null);
    }
  };

  return { currentUser, handleLogout };
}
