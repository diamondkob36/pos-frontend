"use client";

export default function StatCards({ totalRevenue, totalOrders, mostSoldProduct, mostSoldTopping }: any) {
  return (
    // 🌟 มือถือ: 2x2 grid, แท็บเล็ต: 2x2, จอใหญ่: 1x4 แนวนอน
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-5 border-l-4 border-l-blue-500">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0">💰</div>
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-gray-500">รายรับรวม</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">฿{totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-5 border-l-4 border-l-purple-500">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0">🧾</div>
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-gray-500">จำนวนบิล</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{totalOrders} <span className="text-xs sm:text-sm font-normal text-gray-500">รายการ</span></p>
        </div>
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-5 border-l-4 border-l-orange-500">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0">🏆</div>
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-gray-500">เมนูขายดีสุด</p>
          <p className="text-base sm:text-xl font-bold text-gray-800 truncate" title={mostSoldProduct?.name}>
            {mostSoldProduct ? mostSoldProduct.name : "-"}
          </p>
          {mostSoldProduct && (
            <p className="text-[10px] sm:text-xs text-green-600 font-bold mt-1 truncate">ขายได้ {mostSoldProduct.quantity} รายการ</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 sm:gap-5 border-l-4 border-l-pink-500">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-50 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0">✨</div>
        <div className="overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-gray-500">ท็อปปิ้งยอดฮิต</p>
          <p className="text-base sm:text-xl font-bold text-gray-800 truncate" title={mostSoldTopping?.name}>
            {mostSoldTopping ? mostSoldTopping.name : "-"}
          </p>
          {mostSoldTopping && (
            <p className="text-[10px] sm:text-xs text-pink-600 font-bold mt-1 truncate">ถูกสั่งไป {mostSoldTopping.quantity} ครั้ง</p>
          )}
        </div>
      </div>
      
    </div>
  );
}
