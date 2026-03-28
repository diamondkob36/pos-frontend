import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireRole?: "manager" | "cashier") {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) { 
      router.push("/login"); 
      return; 
    }
    
    const user = JSON.parse(userStr);
    
    // ถ้าหน้านี้บังคับว่าต้องเป็นผู้จัดการเท่านั้น
    if (requireRole === "manager" && user.role !== "manager") {
      alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้ครับ (เฉพาะผู้จัดการเท่านั้น) ❌");
      router.push("/");
      return;
    }
    
    setCurrentUser(user);
  }, [router, requireRole]);

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("pos_user");
      router.push("/login");
    }
  };

  return { currentUser, handleLogout };
}