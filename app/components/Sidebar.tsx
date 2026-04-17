"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, handleLogout } = useAuth();
  
  // 🌟 State สำหรับเปิด/ปิด Sidebar ในมือถือ
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';

  return (
    <>
      {/* 🌟 ปุ่ม Floating Button สำหรับเปิด/ปิดเมนูบนมือถือ (ซ่อนในจอ md ขึ้นไป) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[70] bg-blue-600 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-transform print:hidden border-2 border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* 🌟 ฉากหลังมืดๆ (Backdrop) เวลากดเปิดเมนูในมือถือ */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[50] backdrop-blur-sm print:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🌟 ตัว Sidebar (ปรับให้สไลด์ได้ในมือถือ และแสดงค้างในคอม) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[60] 
        w-72 md:w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0 print:hidden
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 pb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">POS System</h2>
          <p className="text-gray-400 text-sm mt-1">Management Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="pb-2">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หน้าร้าน</p>
            {/* 🌟 เพิ่ม onClick={() => setIsOpen(false)} เพื่อให้จิ้มแล้วเมนูพับเก็บในมือถือ */}
            <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">🛒</span> หน้าแคชเชียร์
            </Link>
          </div>
          
          {isAdmin && (
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">หลังร้าน (Admin)</p>
              
              <Link href="/history" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/history' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-xl">📊</span> ประวัติยอดขาย
              </Link>
              
              <Link href="/admin/products" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/products' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-xl">☕</span> เมนูสินค้า
              </Link>
              
              <Link href="/admin/toppings" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/toppings' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-xl">✨</span> ท็อปปิ้ง
              </Link>
              
              <Link href="/admin/categories" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/categories' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-xl">🗂️</span> หมวดหมู่สินค้า
              </Link>
              
              <Link href="/admin/users" onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/users' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-xl">👥</span> จัดการพนักงาน
              </Link>
              
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 mt-auto bg-gray-900">
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
    </>
  );
}