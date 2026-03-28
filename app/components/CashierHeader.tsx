"use client";

import Link from "next/link";

export default function CashierHeader({ currentUser, handleLogout }: { currentUser: any, handleLogout: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 className="text-3xl font-bold text-gray-800">ระบบ POS - หน้าจอแคชเชียร์</h1>
      
      <div className="flex flex-wrap items-center gap-3">
        {currentUser && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {currentUser.name?.charAt(0) || "U"}
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-800 leading-none mb-1">{currentUser.name}</p>
              <p className="text-[10px] text-gray-700 uppercase font-bold">
                {currentUser.role === 'manager' ? '👑 ผู้จัดการ' : '🧑‍🍳 แคชเชียร์'}
              </p>
            </div>
          </div>
        )}

        <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold shadow-sm border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-2">
          🚪 ออกจากระบบ
        </button>

        {currentUser?.role === 'manager' && (
          <Link href="/history" className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-2">
            📊 หลังร้าน
          </Link>
        )}
      </div>
    </div>
  );
}