"use client";

import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function CashierHeader() {
  const { currentUser, handleLogout } = useAuth();

  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';

  return (
    <header className="bg-white px-6 py-4 shadow-sm border-b flex flex-col md:flex-row justify-between items-center print:hidden gap-4 m-6 mb-0.5 rounded-xl">
      
      {/* 🌟 ฝั่งซ้าย: โลโก้ + ข้อมูลพนักงาน */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">POS System</h1>
        
        {/* เส้นคั่นแนวตั้ง (โชว์เฉพาะจอใหญ่) */}
        <div className="hidden md:block h-8 w-px bg-gray-200"></div>
        
        {/* ป้ายชื่อพนักงาน */}
        <div className="bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-3">
          <span className="text-2xl">
            {currentUser?.role === 'manager' ? '👑' : currentUser?.role === 'supervisor' ? '⭐' : '🧑‍🍳'}
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase leading-none mb-1">
              {currentUser?.role === 'manager' ? 'ผู้จัดการ (Manager)' : currentUser?.role === 'supervisor' ? 'หัวหน้างาน (Supervisor)' : 'แคชเชียร์ (Cashier)'}
            </span>
            <span className="text-sm text-blue-700 font-black leading-tight">
              {currentUser?.name || "กำลังโหลด..."}
            </span>
          </div>
        </div>
      </div>
      
      {/* 🌟 ฝั่งขวา: ปุ่มเมนู */}
      <div className="flex gap-3 w-full md:w-auto">
        {isAdmin && (
          <Link href="/history" className="flex-1 md:flex-none bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition-all flex justify-center items-center gap-2 shadow-sm border-b-2 border-black active:border-b-0 active:translate-y-px">
            <span className="text-md">⚙️</span>
            <span>จัดการหลังร้าน</span>
          </Link>
        )}
        
        <button onClick={handleLogout} className="flex-1 md:flex-none bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all flex justify-center items-center gap-2 border border-red-100">
          🚪 ออกจากระบบ
        </button>
      </div>
    </header>
  );
}