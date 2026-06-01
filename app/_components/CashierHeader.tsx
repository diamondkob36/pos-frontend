"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";

export default function CashierHeader() {
  const { currentUser, handleLogout } = useAuth();
  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* 🌟 Header แบบบาง - แสดงแค่ชื่อระบบ + ปุ่มแฮมเบอร์เกอร์ */}
      <header className="bg-white px-4 lg:px-6 py-3 shadow-sm border-b flex justify-between items-center print:hidden m-3 lg:m-6 mb-0.5 rounded-xl relative z-40">
        
        <h1 className="text-xl lg:text-2xl font-black text-gray-800 tracking-tight">
          ☕ POS System
        </h1>
        
        {/* ปุ่มแฮมเบอร์เกอร์ */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl transition-all flex items-center justify-center"
          title={isMenuOpen ? "ปิดเมนู" : "เปิดเมนู"}
        >
          {isMenuOpen ? (
            // ไอคอน X (ปิด)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // ไอคอนแฮมเบอร์เกอร์
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* 🌟 Backdrop (พื้นหลังมืด) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 print:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* 🌟 เมนู Dropdown/Overlay */}
      <div className={`fixed top-[72px] left-3 right-3 lg:left-6 lg:right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 print:hidden transition-all duration-300 ${
        isMenuOpen 
          ? 'translate-y-0 opacity-100 pointer-events-auto' 
          : '-translate-y-4 opacity-0 pointer-events-none'
      }`}>
        
        <div className="p-5 lg:p-6">
          
          {/* ข้อมูลผู้ใช้ */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-4 rounded-xl border border-blue-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl shrink-0">
                {currentUser?.role === 'manager' ? '👑' : currentUser?.role === 'supervisor' ? '⭐' : '🧑‍🍳'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-500 uppercase">
                  {currentUser?.role === 'manager' ? 'ผู้จัดการ (Manager)' : currentUser?.role === 'supervisor' ? 'หัวหน้างาน (Supervisor)' : 'แคชเชียร์ (Cashier)'}
                </p>
                <p className="text-lg font-black text-gray-800 truncate">
                  {currentUser?.name || "กำลังโหลด..."}
                </p>
              </div>
            </div>
          </div>

          {/* เมนูต่างๆ */}
          <div className="space-y-2">
            
            {/* ปุ่มจัดการหลังร้าน (สำหรับ Admin) */}
            {isAdmin && (
              <Link 
                href="/history" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full bg-gray-800 text-white px-5 py-4 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center gap-3 shadow-sm border-b-4 border-black active:border-b-0 active:translate-y-1"
              >
                <span className="text-2xl">⚙️</span>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold">จัดการหลังร้าน</p>
                  <p className="text-xs text-gray-300 font-normal">ประวัติยอดขาย, จัดการสินค้า, พนักงาน</p>
                </div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* ปุ่มออกจากระบบ */}
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="w-full bg-red-50 text-red-600 px-5 py-4 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-3 border-2 border-red-100"
            >
              <span className="text-2xl">🚪</span>
              <div className="flex-1 text-left">
                <p className="text-base font-bold">ออกจากระบบ</p>
                <p className="text-xs text-red-400 font-normal">ล็อกเอาท์และกลับไปหน้าเข้าสู่ระบบ</p>
              </div>
            </button>

          </div>

        </div>
      </div>
    </>
  );
}
