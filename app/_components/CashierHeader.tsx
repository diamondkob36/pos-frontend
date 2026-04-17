"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function CashierHeader() {
  const { currentUser, handleLogout } = useAuth();
  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';

  return (
    // 🌟 เปลี่ยน md:flex-row เป็น lg:flex-row และปรับ Margin ให้เล็กลงในหน้าจอเล็ก
    <header className="bg-white px-4 lg:px-6 py-3 lg:py-4 shadow-sm border-b flex flex-col lg:flex-row justify-between items-center print:hidden gap-3 lg:gap-4 m-3 lg:m-6 mb-0.5 rounded-xl">
      
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <h1 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight">POS System</h1>
        
        {/* ซ่อนเส้นคั่นใน Tablet/มือถือ */}
        <div className="hidden lg:block h-8 w-px bg-gray-200"></div>
        
        <div className="bg-blue-50/50 px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl border border-blue-100 flex items-center gap-2 lg:gap-3">
          <span className="text-xl lg:text-2xl">
            {currentUser?.role === 'manager' ? '👑' : currentUser?.role === 'supervisor' ? '⭐' : '🧑‍🍳'}
          </span>
          <div className="flex flex-col">
            <span className="text-[9px] lg:text-[10px] font-bold text-gray-500 uppercase leading-none mb-0.5 lg:mb-1">
              {currentUser?.role === 'manager' ? 'ผู้จัดการ (Manager)' : currentUser?.role === 'supervisor' ? 'หัวหน้างาน (Supervisor)' : 'แคชเชียร์ (Cashier)'}
            </span>
            <span className="text-xs lg:text-sm text-blue-700 font-black leading-tight">
              {currentUser?.name || "กำลังโหลด..."}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
        {isAdmin && (
          <Link href="/history" className="flex-1 lg:flex-none bg-gray-800 text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-all flex justify-center items-center gap-2 shadow-sm border-b-2 border-black active:border-b-0 active:translate-y-px text-sm lg:text-base">
            <span className="text-sm lg:text-md">⚙️</span>
            <span>จัดการหลังร้าน</span>
          </Link>
        )}
        
        <button onClick={handleLogout} className="flex-1 lg:flex-none bg-red-50 text-red-600 px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all flex justify-center items-center gap-2 border border-red-100 text-sm lg:text-base">
          🚪 ออกจากระบบ
        </button>
      </div>
    </header>
  );
}