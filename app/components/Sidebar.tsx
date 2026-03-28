"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // ดึงข้อมูลคนล็อกอินมาแสดง
    const userStr = localStorage.getItem("pos_user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("pos_user"); // ลบข้อมูลการล็อกอินทิ้ง
      router.push("/login"); // เด้งกลับไปหน้าล็อกอิน
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0 print:hidden hidden md:flex">
      <div className="p-6 pb-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">POS System</h2>
        <p className="text-gray-400 text-sm mt-1">Management Panel</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
          <span className="text-xl">🛒</span> หน้าแคชเชียร์
        </Link>
        
        {/* 🌟 ซ่อนปุ่มเหล่านี้ถ้าไม่ใช่ผู้จัดการ */}
        {currentUser?.role === 'manager' && (
          <>
            <Link href="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/history' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">📊</span> ประวัติยอดขาย
            </Link>
            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">⚙️</span> จัดการหลังร้าน
            </Link>
            <Link href="/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/users' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">👥</span> จัดการพนักงาน
            </Link>
          </>
        )}
      </nav>

      {/* 🌟 โซนด้านล่าง (โปรไฟล์ & ปุ่ม Logout) */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="bg-gray-800 p-3 rounded-xl mb-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{currentUser?.name || "กำลังโหลด..."}</p>
            <p className="text-[10px] text-gray-400 uppercase">{currentUser?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
          🚪 ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}