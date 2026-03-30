import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuth(allowedRoles?: string | string[]) {
  const router = useRouter();
  const pathname = usePathname(); // 🌟 ใช้เช็คว่าตอนนี้อยู่หน้าไหน
  const [currentUser, setCurrentUser] = useState<any>(null);

  const rolesArray = typeof allowedRoles === 'string' ? [allowedRoles] : allowedRoles;
  const rolesKey = rolesArray ? rolesArray.join(",") : "";

  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    
    if (!userStr) { 
      // 🌟 ดักไว้ว่า ถ้าไม่ได้อยู่หน้า login ค่อยเด้งไป (กันลูป)
      if (pathname !== "/login") {
        router.push("/login"); 
      }
      return; 
    }
    
    const user = JSON.parse(userStr);
    
    if (rolesArray && rolesArray.length > 0 && !rolesArray.includes(user.role)) {
      // 🌟 ดักไว้ว่า ถ้าไม่ได้อยู่หน้าแรก (/) ค่อยแจ้งเตือนและเด้งไป (กันลูป)
      if (pathname !== "/") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ ❌");
        router.push("/");
      }
      return;
    }
    
    setCurrentUser(user);
  }, [router, rolesKey, pathname]); 

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("pos_user");
      router.push("/login");
    }
  };

  return { currentUser, handleLogout };
}