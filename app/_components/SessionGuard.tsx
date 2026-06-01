"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
 * คำนวณเวลาที่เหลือก่อน Token หมดอายุ (วินาที)
 */
const getTokenTimeLeft = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  } catch {
    return 0;
  }
};

export default function SessionGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tokenTimeLeft, setTokenTimeLeft] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ไม่ทำงานในหน้า Login
    if (pathname === '/login') {
      return;
    }

    const checkSession = () => {
      const token = localStorage.getItem("pos_token");
      
      // ถ้าไม่มี Token ให้ Redirect ไป Login ทันที
      if (!token) {
        handleLogout();
        return;
      }

      // ตรวจสอบว่า Token หมดอายุหรือไม่
      if (isTokenExpired(token)) {
        handleLogout();
        return;
      }

      // คำนวณเวลาที่เหลือของ Token
      const secondsLeft = getTokenTimeLeft(token);
      setTokenTimeLeft(secondsLeft);

      // แสดงคำเตือนเมื่อเหลือเวลาน้อยกว่า 5 นาที (300 วินาที)
      if (secondsLeft > 0 && secondsLeft <= 300) {
        setShowWarning(true);
        setTimeLeft(Math.ceil(secondsLeft / 60)); // แปลงเป็นนาที
      }

      // เช็คเวลาตัดกะ (06:00 และ 18:00)
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // แจ้งเตือนล่วงหน้า 5 นาทีก่อนตัดกะ
      if ((hours === 5 || hours === 17) && minutes >= 55) {
        setShowWarning(true);
        setTimeLeft(60 - minutes);
      }

      // ถ้าถึงเวลาตัดกะ ให้ Logout ทันที
      if ((hours === 6 || hours === 18) && minutes === 0) {
        handleLogout();
      }
    };

    const handleLogout = async () => {
      localStorage.removeItem("pos_token");
      localStorage.removeItem("pos_user");
      sessionStorage.clear();
      
      // แสดง Toast
      const { toast } = await import("@/lib/toast");
      toast.error("🔒 Session หมดอายุ กรุณาเข้าสู่ระบบใหม่", 2000);
      
      setTimeout(() => {
        router.push("/login");
      }, 500);
    };

    // เช็คทันทีตอน Mount
    checkSession();

    // เช็คทุก 10 วินาที
    const timer = setInterval(checkSession, 10000);
    return () => clearInterval(timer);
  }, [router, pathname]);

  // ไม่แสดงอะไรในหน้า Login
  if (pathname === '/login' || !showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-4 border-orange-100 animate-bounce-slow">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {tokenTimeLeft > 0 && tokenTimeLeft <= 300 ? "Session ใกล้หมดอายุ!" : "ใกล้หมดกะแล้ว!"}
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {tokenTimeLeft > 0 && tokenTimeLeft <= 300 ? (
            <>
              Session จะหมดอายุในอีก <br/>
              <span className="text-red-600 font-black text-xl">{timeLeft} นาที</span> <br/>
              กรุณาบันทึกงานและเข้าสู่ระบบใหม่
            </>
          ) : (
            <>
              ระบบจะทำการตัดการเชื่อมต่อโดยอัตโนมัติในอีก <br/>
              <span className="text-orange-600 font-black text-xl">{timeLeft} นาที</span> <br/>
              กรุณาเคลียร์ออเดอร์ให้เรียบร้อยครับ
            </>
          )}
        </p>
        <button 
          onClick={() => setShowWarning(false)}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        >
          รับทราบ (ทำรายการต่อ)
        </button>
      </div>
    </div>
  );
}