"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  // 🌟 ใช้ usePathname เพื่อเช็คว่าตอนนี้ผู้ใช้กำลังอยู่หน้าไหน
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0 print:hidden hidden md:flex">
      <div className="p-6 pb-8">
        <h2 className="text-2xl font-bold text-white tracking-wide">POS System</h2>
        <p className="text-gray-400 text-sm mt-1">Management Panel</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {/* เช็คเงื่อนไข: ถ้า pathname ตรงกับลิงก์ ให้ปุ่มเป็นสีน้ำเงิน ถ้าไม่ตรงให้เป็นสีเทา */}
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            pathname === '/' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xl">🛒</span> หน้าแคชเชียร์
        </Link>
        
        <Link 
          href="/history" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            pathname === '/history' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xl">📊</span> ประวัติยอดขาย
        </Link>
        
        <Link 
          href="/admin" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            pathname === '/admin' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xl">⚙️</span> จัดการหลังร้าน
        </Link>
      </nav>
    </aside>
  );
}