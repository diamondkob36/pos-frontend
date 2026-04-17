"use client";

export default function OrderList({ filteredOrders, timeFilter, formatDate }: any) {
  return (
    // 🌟 1. ล็อกกล่องด้านนอก: ใช้ h-[450px] สำหรับแท็บเล็ต/มือถือ และ h-full min-h-0 สำหรับ PC
    // เพื่อให้กล่องพอดีกับหน้าจอเป๊ะๆ ไม่ดันหน้าหลักทะลุลงไปครับ
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[450px] lg:h-full min-h-0 overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800 mb-4 shrink-0">
        🧾 รายการบิลย้อนหลัง {timeFilter !== 'all' ? `(${timeFilter} วันล่าสุด)` : ""}
      </h2>
      
      {/* 🌟 2. ลบ h-[520px] ออก แล้วใช้ flex-1 min-h-0 
          มันจะหาพื้นที่ที่เหลือในจอแล้วสร้างแถบเลื่อน (Scroll) ให้พอดีเป๊ะอัตโนมัติครับ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 min-h-0">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium border-2 border-dashed rounded-2xl bg-gray-50">
            ไม่พบข้อมูลบิลในช่วงเวลานี้
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <div key={order.id} className="p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-100 transition-colors bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                <div>
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide">
                    บิล #{order.dailyNumber || order.id}
                  </span>
                  <span className="text-[11px] lg:text-xs text-gray-500 ml-2 font-medium">
                    📅 {formatDate(order.createdAt)}
                  </span>
                </div>
                <span className="font-black text-blue-600 text-lg tracking-tight">
                  ฿{order.totalAmount?.toLocaleString() || (order.items || []).reduce((sum:number, i:any) => sum + (i.price * i.quantity), 0).toLocaleString()}
                </span>
              </div>
              
              <div className="space-y-2">
                {(order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-gray-800 leading-tight">
                        {item.product?.name || "ไม่ทราบชื่อ"} 
                        <span className="text-gray-400 font-medium text-xs ml-1">x{item.quantity}</span>
                      </p>
                      <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                        {item.size && <p className="text-blue-600 font-bold">• {item.size}</p>}
                        {item.toppings && <p>• ท็อปปิ้ง: {item.toppings.replace(/@/g, '฿')}</p>}
                        {item.note && <p className="text-orange-500 font-bold">หมายเหตุ: {item.note}</p>}
                      </div>
                    </div>
                    <span className="font-bold text-gray-700 shrink-0">฿{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}