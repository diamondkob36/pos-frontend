import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 🌟 อนุญาตให้รับค่าได้ทั้ง String ("manager") และ Array (["manager", "supervisor"])
export function useAuth(allowedRoles?: string | string[]) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🌟 ดักจับ: ถ้าส่งมาเป็น String ให้จับใส่ปีกกาเป็น Array ซะ จะได้ไม่มีบั๊ก .join
  const rolesArray = typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles;
  
  // แปลง Array เป็น String เพื่อใส่ใน Dependency ของ useEffect
  const rolesKey = rolesArray ? rolesArray.join(",") : "";

  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) { 
      router.push("/login"); 
      return; 
    }
    
    const user = JSON.parse(userStr);
    
    // เช็คสิทธิ์ด้วย rolesArray ที่ถูกแปลงมาอย่างปลอดภัยแล้ว
    if (rolesArray && !rolesArray.includes(user.role)) {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ ❌");
      router.push("/");
      return;
    }
    
    setCurrentUser(user);
  }, [router, rolesKey]); 

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("pos_user");
      router.push("/login");
    }
  };

  return { currentUser, handleLogout };
}