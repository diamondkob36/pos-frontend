"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, handleLogout } = useAuth();

  // 🌟 อนุญาตให้ทั้ง manager และ supervisor เห็นเมนูหลังบ้าน
  const isAdmin = currentUser?.role === 'manager' || currentUser?.role === 'supervisor';

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0 print:hidden hidden md:flex">
      <div className="p-6 pb-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">POS System</h2>
        <p className="text-gray-400 text-sm mt-1">Management Panel</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        <div className="pb-2">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">หน้าร้าน</p>
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
            <span className="text-xl">🛒</span> หน้าแคชเชียร์
          </Link>
        </div>
        
        {isAdmin && (
          <div className="pt-2 border-t border-gray-800 space-y-1">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">หลังร้าน (Admin)</p>
            
            <Link href="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/history' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">📊</span> ประวัติยอดขาย
            </Link>
            
            <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/products' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">☕</span> เมนูสินค้า
            </Link>
            
            <Link href="/admin/toppings" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/toppings' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">✨</span> ท็อปปิ้ง
            </Link>
            
            <Link href="/admin/categories" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/categories' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">🗂️</span> หมวดหมู่สินค้า
            </Link>
            
            <Link href="/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === '/admin/users' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <span className="text-xl">👥</span> จัดการพนักงาน
            </Link>
            
          </div>
        )}
      </nav>

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