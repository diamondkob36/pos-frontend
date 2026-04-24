"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// กำหนดหน้าตาข้อมูล User (เพิ่ม ID เข้ามาด้วย)
interface User {
  id?: number;
  username: string;
  name: string;
  role: string;
}

export function useAuth(allowedRoles?: string[]) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. ดึงข้อมูล User จาก LocalStorage
    const storedUser = localStorage.getItem("pos_user");
    
    // 2. ดึง Token เพื่อเช็คว่ามีกุญแจไหม (ถ้าทำระบบเต็มควรเช็ควันหมดอายุด้วย)
    const token = localStorage.getItem("pos_token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);

      // ถ้าหน้าไหนมีการล็อคสิทธิ์ (allowedRoles) ให้เช็คว่าสิทธิ์ถึงไหม
      if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
        router.push("/"); // สิทธิ์ไม่ถึง เด้งกลับหน้าแคชเชียร์
      }
    } else {
      // ถ้าไม่มี User หรือไม่มี Token ให้เด้งไปหน้า Login เสมอ
      router.push("/login");
    }
  }, [router, allowedRoles]);

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      // 🌟 เคลียร์ทั้ง User และ Token ทิ้งตอนออกจากระบบ
      localStorage.removeItem("pos_user");
      localStorage.removeItem("pos_token");
      setCurrentUser(null);
      router.push("/login");
    }
  };

  return { currentUser, handleLogout };
}