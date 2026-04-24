"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id?: number;
  username: string;
  name: string;
  role: string;
}

export function useAuth(allowedRoles?: string[]) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // 🌟 1. แปลง Array ให้เป็น String ก่อน (เช่น "manager,supervisor") 
  // เพื่อป้องกัน React มองว่าเป็นข้อมูลใหม่ทุกรอบการ Render
  const rolesString = allowedRoles ? allowedRoles.join(",") : "";

  useEffect(() => {
    const storedUser = localStorage.getItem("pos_user");
    const token = localStorage.getItem("pos_token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      
      // 🌟 2. อัปเดตข้อมูล User เฉพาะตอนที่ข้อมูลเปลี่ยนไปจริงๆ เท่านั้น (ป้องกันลูปนรก)
      setCurrentUser((prev) => 
        prev?.username === parsedUser.username ? prev : parsedUser
      );

      // เช็คสิทธิ์การเข้าถึงหน้าเว็บ
      if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
        router.push("/"); // สิทธิ์ไม่ถึง เด้งกลับหน้าแคชเชียร์
      }
    } else {
      router.push("/login");
    }
    
  // 🌟 3. ใช้ rolesString แทน allowedRoles ใน Dependency Array
  }, [router, rolesString]); 

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("pos_user");
      localStorage.removeItem("pos_token");
      setCurrentUser(null);
      router.push("/login");
    }
  };

  return { currentUser, handleLogout };
}