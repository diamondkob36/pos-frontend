"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, handleLogout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';

  return (
    <>
      {/* 🌟 เปลี่ยนจาก md:hidden เป็น lg:hidden เพื่อให้ Tablet มีปุ่มลอยด้วย */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[70] bg-blue-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-transform print:hidden border-2 border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[50] backdrop-blur-sm print:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🌟 ปรับ lg:static เพื่อให้แสดงค้างเฉพาะในจอ PC */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[60] 
        w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0 print:hidden
        transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 lg:p-6 pb-6 lg:pb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-wide">POS System</h2>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">Management Panel</p>
        </div>
        
        <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="pb-2">
            <p className="px-4 text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หน้าร้าน</p>
            {/* 🌟 ปรับขนาด padding (py-2.5) และขนาดตัวหนังสือ (text-sm) บนจอเล็ก */}
            <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-lg lg:text-xl">🛒</span> หน้าแคชเชียร์
            </Link>
          </div>
          
          {isAdmin && (
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <p className="px-4 text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">หลังร้าน (Admin)</p>
              
              <Link href="/history" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/history' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg lg:text-xl">📊</span> ประวัติยอดขาย
              </Link>
              <Link href="/admin/products" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/admin/products' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg lg:text-xl">☕</span> เมนูสินค้า
              </Link>
              <Link href="/admin/toppings" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/admin/toppings' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg lg:text-xl">✨</span> ท็อปปิ้ง
              </Link>
              <Link href="/admin/categories" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/admin/categories' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg lg:text-xl">🗂️</span> หมวดหมู่สินค้า
              </Link>
              <Link href="/admin/users" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 lg:py-3 rounded-xl transition-all font-medium text-sm lg:text-base ${pathname === '/admin/users' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-lg lg:text-xl">👥</span> จัดการพนักงาน
              </Link>
            </div>
          )}
        </nav>

        <div className="p-3 lg:p-4 border-t border-gray-800 mt-auto bg-gray-900">
          <div className="bg-gray-800 p-2.5 lg:p-3 rounded-xl mb-3 flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm lg:text-base">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs lg:text-sm truncate">{currentUser?.name || "กำลังโหลด..."}</p>
              <p className="text-[9px] lg:text-[10px] text-gray-400 uppercase">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-2.5 lg:py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm lg:text-base">
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  );
}