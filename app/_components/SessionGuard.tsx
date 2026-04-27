"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // เช็คว่าเหลืออีกกี่นาทีจะถึง 06:00 หรือ 18:00
      // ตัวอย่าง: แจ้งเตือนตอน 05:55 และ 17:55 (ล่วงหน้า 5 นาที)
      if ((hours === 5 || hours === 17) && minutes >= 55) {
        setShowWarning(true);
        setTimeLeft(60 - minutes);
      }

      // ถ้าถึงเวลาเป๊ะๆ ให้ Logout ทันที
      if ((hours === 6 || hours === 18) && minutes === 0) {
        handleLogout();
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("pos_token"); //
      router.push("/login");
      window.location.reload();
    };

    const timer = setInterval(checkTime, 30000); // เช็คทุก 30 วินาที
    return () => clearInterval(timer);
  }, [router]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border-4 border-orange-100 animate-bounce-slow">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">ใกล้หมดกะแล้ว!</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          ระบบจะทำการตัดการเชื่อมต่อโดยอัตโนมัติในอีก <br/>
          <span className="text-orange-600 font-black text-xl">{timeLeft} นาที</span> <br/>
          กรุณาเคลียร์ออเดอร์ให้เรียบร้อยครับ
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